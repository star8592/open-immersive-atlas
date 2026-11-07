#!/usr/bin/env python3
"""Record short, source-attributed videos of PUBLIC website behavior for OIA research.

No user Chrome profiles, cookies, API keys or original media files are read.
The exported clip is an original browser screen recording, 4–7 seconds,
without audio. Websites and included visual art remain their owners' property.
A clip is tagged scroll_recording; it does not prove a specific site's
claimed WebGL, Three.js, video or app functionality.
"""
import argparse
import base64
import concurrent.futures
import io
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from PIL import Image, ImageChops, ImageOps, ImageStat

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from importlib.machinery import SourceFileLoader
cap = SourceFileLoader("oia_capture_still", str(pathlib.Path(__file__).with_name("capture-site-previews.py"))).load_module()

def safe_id(value):
    return cap.clean_id(str(value))

def load_jobs(source_path, chosen):
    doc = json.loads(pathlib.Path(source_path).read_text(encoding="utf-8"))
    records = doc.get("records") or doc.get("posts") or doc.get("examples") or []
    candidates = {}
    for x in records:
        sid = str(x.get("status_id") or x.get("id") or "")
        url = x.get("website_url") or x.get("site_url") or x.get("live_url")
        if sid and url and url.startswith("https://"):
            candidates[sid] = {
                "id": sid, "url": url, "name": x.get("project") or x.get("work") or x.get("title") or sid
            }
    return [candidates[k] for k in chosen if k in candidates]

def screenshot(page):
    raw = page.call("Page.captureScreenshot", {
        "format": "jpeg", "quality": 75,
        "fromSurface": True, "captureBeyondViewport": False
    })["data"]
    im = Image.open(io.BytesIO(base64.b64decode(raw))).convert("RGB")
    return ImageOps.fit(im,(640,392),method=Image.Resampling.LANCZOS,centering=(.5,.30))

def difference(a,b):
    a=a.resize((80,49),Image.Resampling.BILINEAR)
    b=b.resize((80,49),Image.Resampling.BILINEAR)
    return sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/3.0

def record(job,port,out_dir,opts):
    out={"id":job["id"],"site":job["url"],"title":job["name"],
         "captured_at":datetime.now(timezone.utc).isoformat(),
         "kind":"live_browser_scroll_recording_no_audio",
         "status":"error","path":None}
    target=None
    try:
        target=cap.Page(port)
        target.call("Page.navigate",{"url":job["url"]})
        time.sleep(opts.wait)
        info=target.eval("""({
          title:document.title,url:location.href,
          text:(document.body?.innerText||'').slice(0,500),
          docHeight:Math.max(document.documentElement.scrollHeight,document.body?.scrollHeight||0),
          innerHeight:innerHeight,innerWidth:innerWidth,scrollY:scrollY
        })""")
        info=info or {}
        out["title"]=info.get("title") or job["name"]
        out["final_url"]=info.get("url")
        out["docHeight"]=info.get("docHeight")
        if cap.BAD_TITLE.search((info.get("title") or "")+" "+(info.get("text") or "")):
            out["status"]="blocked_error_page"
            return out
        if not (info.get("url") or "").startswith("http"):
            out["status"]="navigation_failed"
            return out
        height=int(info.get("docHeight") or 0)
        view=int(info.get("innerHeight") or 880)
        span=max(0, min(int(height*.68),height-view-30))
        out["scroll_span_css_px"]=span
        frames=[]
        total=opts.frames
        with tempfile.TemporaryDirectory(prefix="oia-motion-frames-") as dirpath:
            temp=pathlib.Path(dirpath)
            # One initial frame, then scroll through the actual DOM. This is
            # not a morph or image-to-video synthetic animation.
            for i in range(total):
                if i<6: y=0
                else:
                    t=(i-6)/max(1,total-7)
                    eased=t*t*(3-2*t)
                    y=int(span*eased)
                target.eval("window.scrollTo({top:"+str(y)+",behavior:'instant'})")
                time.sleep(opts.interval)
                im=screenshot(target)
                if i:
                    frames.append(difference(last,im))
                last=im
                im.save(temp/("frame-%03d.jpg"%i),quality=78,subsampling=0)
            out["mean_frame_change"]=round(sum(frames)/max(1,len(frames)),3)
            out["moving_pairs"]=sum(d>1.6 for d in frames)
            # Reject fake activity: enough non-identical frames must exist,
            # and the observed website must have actual scene movement.
            if out["moving_pairs"]<max(6,int(total*.15)):
                out["status"]="insufficient_motion"
                return out
            filepath=out_dir/(safe_id(job["id"])+".mp4")
            command=["ffmpeg","-hide_banner","-loglevel","error","-y",
                     "-framerate",str(opts.fps),"-i",str(temp/"frame-%03d.jpg"),
                     "-c:v","libx264","-preset","veryfast","-crf",str(opts.crf),
                     "-pix_fmt","yuv420p","-movflags","+faststart","-an",str(filepath)]
            run=subprocess.run(command,capture_output=True,text=True,timeout=55)
            if run.returncode:
                raise RuntimeError("ffmpeg: "+run.stderr[-300:])
            size=filepath.stat().st_size
            if size<3000: raise ValueError("Video suspiciously small")
            if size>opts.max_bytes:
                filepath.unlink()
                out["status"]="exceeds_size_budget"
                out["bytes"]=size
                return out
            out["status"]="captured"
            out["path"]=filepath.name
            out["duration_s"]=round(total/opts.fps,2)
            out["frames"]=total
            out["fps"]=opts.fps
            out["bytes"]=size
            return out
    except Exception as exc:
        out["error"]=str(exc)[:320]
        return out
    finally:
        if target:
            try:target.close()
            except Exception:pass

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--dataset",required=True)
    parser.add_argument("--ids",required=True,help="Comma-separated dataset IDs")
    parser.add_argument("--output",required=True)
    parser.add_argument("--workers",type=int,default=2)
    parser.add_argument("--wait",type=float,default=5.0)
    parser.add_argument("--interval",type=float,default=.085)
    parser.add_argument("--frames",type=int,default=44)
    parser.add_argument("--fps",type=int,default=11)
    parser.add_argument("--crf",type=int,default=34)
    parser.add_argument("--max-bytes",type=int,default=1_800_000)
    opts=parser.parse_args()
    out_dir=pathlib.Path(opts.output)
    out_dir.mkdir(parents=True,exist_ok=True)
    jobs=load_jobs(opts.dataset,[x.strip() for x in opts.ids.split(",") if x.strip()])
    if not jobs:
        raise ValueError("Selected IDs do not match dataset")
    with tempfile.TemporaryDirectory(prefix="oia-chrome-motion-", ignore_cleanup_errors=True) as tmpdir:
        process,port=cap.start_chrome(pathlib.Path(tmpdir))
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=opts.workers) as pool:
                jobs_out=list(pool.map(lambda item:record(item,port,out_dir,opts),jobs))
        finally:
            process.terminate()
            try:process.wait(timeout=5)
            except Exception:process.kill()
    report={"schema":"oia-site-motion-capture-v1",
      "method":"Z890 isolated Chrome 157 CDP screenshots captured over REAL website scroll, encoded to H264 silent MP4",
      "copyright":"Original site content retains publisher copyright; short credited editorial UI reference only; no source video copied",
      "as_of":datetime.now(timezone.utc).isoformat(),
      "count":len(jobs_out),"captured":sum(x["status"]=="captured" for x in jobs_out),
      "results":jobs_out}
    (out_dir/"capture-motion-manifest.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    for x in jobs_out:
        print(json.dumps({k:x.get(k) for k in ("id","status","path","bytes","moving_pairs","mean_frame_change","scroll_span_css_px","error")},ensure_ascii=False),flush=True)
    print("SUMMARY",report["captured"],"/",report["count"],flush=True)

if __name__=="__main__":
    main()
