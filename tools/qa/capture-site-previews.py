#!/usr/bin/env python3
"""Capture evidence-labelled images from public websites for Open Immersive Atlas.

Run on a system with Google Chrome, Pillow, requests, websocket-client:
  python3 capture-site-previews.py --input dataset.json --output /tmp/oia-previews --workers 3

This uses an isolated, *new headless* Chrome profile. It never attaches to the user's
signed-in browser session, never uses private cookies, and never uploads source media.
Screenshots depict publicly served websites; copyright remains with the site authors.
"""
import argparse, base64, concurrent.futures, io, json, os, pathlib, re
import socket, subprocess, tempfile, threading, time, urllib.parse
from datetime import datetime, timezone
from PIL import Image, ImageChops, ImageOps, ImageStat
import requests, websocket

UA = "Open Immersive Atlas screenshot research / Chrome"
BAD_TITLE = re.compile(r"(just a moment|access denied|attention required|not found|404|403|security check|verify you are human|website unavailable|site can't be reached|domain for sale|this site can.t be reached)", re.I)
_LOCK = threading.Lock()

def find_urls(doc):
    if "records" in doc:
        records = doc["records"]
        return [{"id":str(x["status_id"]),"url":x.get("website_url"),"name":x.get("project")} for x in records if x.get("website_url")]
    if "posts" in doc:
        return [{"id":str(x["id"]),"url":x.get("site_url"),"name":x.get("work")} for x in doc["posts"] if x.get("site_url")]
    if "examples" in doc:
        return [{"id":str(x["id"]),"url":x.get("live_url"),"name":x.get("title")} for x in doc["examples"] if x.get("live_url")]
    return []

def start_chrome(tmp):
    cmd = ["/usr/bin/google-chrome","--headless=new","--no-sandbox",
        "--disable-dev-shm-usage","--disable-extensions",
        "--no-first-run","--no-default-browser-check","--disable-background-networking",
        "--remote-allow-origins=*","--remote-debugging-port=0",
        "--window-size=1360,880","--user-data-dir="+str(tmp),"about:blank"]
    proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    p = tmp / "DevToolsActivePort"
    for _ in range(70):
        if p.exists():
            try:
                port = int(p.read_text().splitlines()[0])
                requests.get("http://127.0.0.1:%d/json/version"%port,timeout=3).raise_for_status()
                return proc,port
            except Exception: pass
        if proc.poll() is not None: raise RuntimeError("Chrome exited early")
        time.sleep(.2)
    proc.terminate()
    raise RuntimeError("No isolated Chrome debugging endpoint")

class Page:
    def __init__(self, port):
        self.port = port
        resp = requests.put("http://127.0.0.1:%d/json/new?about:blank"%port,timeout=8)
        resp.raise_for_status()
        target = resp.json()
        self.ws = websocket.create_connection(target["webSocketDebuggerUrl"],timeout=22)
        self.n = 0
        self.target_id = target["id"]
        self.call("Page.enable")
        self.call("Runtime.enable")
        self.call("Emulation.setDeviceMetricsOverride",{"width":1360,"height":880,"deviceScaleFactor":1,"mobile":False})
    def call(self,method,params=None):
        self.n += 1
        request_id=self.n
        self.ws.send(json.dumps({"id":request_id,"method":method,"params":params or {}}))
        while True:
            d=json.loads(self.ws.recv())
            if d.get("id")==request_id:
                if "error" in d: raise RuntimeError(str(d["error"])[:280])
                return d.get("result",{})
    def eval(self,expression):
        d=self.call("Runtime.evaluate",{"expression":expression,"returnByValue":True,"awaitPromise":True})
        return d.get("result",{}).get("value")
    def screenshot(self):
        d=self.call("Page.captureScreenshot",{"format":"jpeg","quality":75,"captureBeyondViewport":False,"fromSurface":True})
        return Image.open(io.BytesIO(base64.b64decode(d["data"]))).convert("RGB")
    def close(self):
        try:self.ws.close()
        except Exception:pass
        try:requests.get("http://127.0.0.1:%d/json/close/%s"%(self.port,self.target_id),timeout=2)
        except Exception:pass

def clean_id(s):
    return re.sub(r"[^A-Za-z0-9_-]","-",str(s))[:95]

def image_save(image,path, width=600, height=376):
    im=ImageOps.fit(image,(width,height),method=Image.Resampling.LANCZOS,centering=(.5,.3))
    im.save(path,"WEBP",quality=65,method=5)
    return path.stat().st_size

def capture(job,port,out,wait=4.0):
    rid=clean_id(job["id"]);url=job["url"]
    base={"id":job["id"],"source_url":url,"name":job.get("name"),"capture_at":datetime.now(timezone.utc).isoformat(),
       "status":"error","cover":None,"scroll":None,"video":None}
    try:
        up=urllib.parse.urlsplit(url)
        if up.scheme!="https" or not up.hostname or up.hostname in ("localhost","127.0.0.1"):
            raise ValueError("Only public HTTPS URL allowed")
        page=Page(port)
        try:
            page.call("Page.navigate",{"url":url,"transitionType":"typed"})
            time.sleep(wait)
            meta=page.eval("""({title:document.title,final:location.href,text:(document.body?.innerText||'').slice(0,1300),height:document.documentElement.scrollHeight})""") or {}
            base["title"]=meta.get("title","");base["final_url"]=meta.get("final","")
            base["scroll_height"]=meta.get("height",0)
            sample=(meta.get("title","")+" "+(meta.get("text","")[:450]))
            if (BAD_TITLE.search(sample) or base["final_url"].startswith("chrome-error:")):
                base["status"]="blocked_or_error_page";base["reason"]=sample[:150];return base
            pic=page.screenshot()
            if max(pic.resize((3,3)).getextrema()[0])<12:pass
            resized=ImageOps.fit(pic,(120,75),method=Image.Resampling.LANCZOS)
            stat=ImageStat.Stat(resized)
            if sum(stat.stddev)/3<8:
                base["status"]="low_detail_capture";base["reason"]="Likely blank/loading/single-color screenshot"
                return base
            cover=out/(rid+"-cover.webp")
            base["cover_bytes"]=image_save(pic,cover)
            base["cover"]=cover.name
            if (meta.get("height") or 0)>1100:
                page.eval("window.scrollTo({top:Math.min(document.documentElement.scrollHeight-750,Math.max(550,document.documentElement.scrollHeight*.38)),behavior:'instant'})")
                time.sleep(1.35)
                second=page.screenshot()
                small1=ImageOps.fit(pic,(100,63))
                small2=ImageOps.fit(second,(100,63))
                change=ImageStat.Stat(ImageChops.difference(small1,small2)).mean
                base["scroll_visual_change"]=round(sum(change)/3,2)
                if sum(change)/3>5.0:
                    dest=out/(rid+"-scroll.webp")
                    base["scroll_bytes"]=image_save(second,dest)
                    base["scroll"]=dest.name
            base["status"]="captured"
            return base
        finally:page.close()
    except Exception as exc:
        base["error"]=str(exc)[:260]
        return base

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--input",required=True)
    p.add_argument("--output",required=True)
    p.add_argument("--workers",type=int,default=3)
    p.add_argument("--wait",type=float,default=4.0)
    p.add_argument("--limit",type=int,default=0)
    args=p.parse_args()
    jobs=find_urls(json.load(open(args.input,encoding="utf-8")))
    if args.limit:jobs=jobs[:args.limit]
    # Domain dedup: preserve individual record but never capture same URL twice in a batch.
    by_url={}
    for job in jobs:
        by_url.setdefault(job["url"],job)
    unique=list(by_url.values())
    out=pathlib.Path(args.output)
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="oia-chrome-") as tmpdir:
        proc,port=start_chrome(pathlib.Path(tmpdir))
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
                futures={ex.submit(capture,job,port,out,args.wait):job for job in unique}
                results=[]
                for fut in concurrent.futures.as_completed(futures):
                    result=fut.result()
                    results.append(result)
                    with _LOCK: print(json.dumps({"id":result["id"],"status":result["status"],"cover":result.get("cover"),"scroll":result.get("scroll"),"reason":result.get("error") or result.get("reason")},ensure_ascii=False),flush=True)
        finally:
            proc.terminate()
            try:proc.wait(timeout=4)
            except Exception:proc.kill()
    obj={"schema":"oia-screenshot-capture-v1","captured_at":datetime.now(timezone.utc).isoformat(),
       "site_count":len(jobs),"unique_urls":len(unique),"captured":sum(x["status"]=="captured" for x in results),"results":sorted(results,key=lambda x:str(x["id"]))}
    (out/"capture-manifest.json").write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("SUMMARY "+json.dumps({k:obj[k] for k in ["site_count","unique_urls","captured"]}),flush=True)

if __name__=="__main__": main()
