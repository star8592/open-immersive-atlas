/* Screenshots are user-visible references to the original creator's website,
   not generated promotional art and not licensed for resale. */
(function(){
"use strict";
const manifestPath="./data/site-previews-2026-11-07.json";
const entries=new Map();
let manifestLoaded=false;
function normalizeUrl(u){
  try{
    const url=new URL(u);
    let host=url.hostname.toLowerCase().replace(/^www\./,"");
    let pathname=url.pathname.replace(/\/+/g,"/").replace(/\/$/,"");
    return host+pathname.toLowerCase();
  }catch(_){return "";}
}
function put(entry){
 const keys=[entry.url,entry.final_url,...(entry.aliases||[])].map(normalizeUrl).filter(Boolean);
 for(const key of keys)if(!entries.has(key)||(entry.status==="captured"||entry.status==="official_cover"))entries.set(key,entry);
}
async function load(){
 if(manifestLoaded)return entries;
 manifestLoaded=true;
 try{
  const response=await fetch(manifestPath,{cache:"no-store"});
  if(!response.ok)throw Error("HTTP "+response.status);
  const doc=await response.json();
  for(const item of (doc.sites||[]))put(item);
 }catch(err){console.warn("OIA screenshot manifest unavailable; showing explicit fallbacks:",err.message)}
 return entries;
}
const el=(tag,cls,text)=>{
 const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e
};
function secureAsset(path){
 return typeof path==="string"&&/^assets\/site-previews\/2026-11-07\/[a-zA-Z0-9_\/-]+\.webp$/.test(path)?"./"+path:null
}
function get(url){
 const k=normalizeUrl(url);return entries.get(k)||entries.get(k.replace(/\/$/,""))||null
}
function missing(reason){
 const div=el("div","snapshot-shell snapshot-unavailable");
 div.append(el("div",null,"暂未取得该站有效实拍截图"));
 div.append(el("div","snapshot-source",reason||"可能存在反爬、跳转或图片加载问题"));
 return div
}
function dialog(){
 let box=document.getElementById("oia-site-image-dialog");
 if(box)return box;
 box=el("dialog","oia-image-dialog");box.id="oia-site-image-dialog";
 const top=el("div","oia-dialog-head");const ttl=el("strong");
 ttl.id="oia-image-caption";const close=el("button","oia-dialog-close","关闭 ×");close.type="button";close.addEventListener("click",()=>box.close());top.append(ttl,close);
 const body=el("div","oia-dialog-body");const image=el("img");image.id="oia-image-large";image.alt="真实网站截图";body.append(image);
 const foot=el("div","oia-dialog-foot");const text=el("span",null,"截图或网站官方公开配图；原站版权归创作者");const buttons=el("div");
 const swap=el("button","oia-dialog-swap","查看滚动后的画面");swap.type="button";swap.id="oia-image-swap";
 const original=el("a",null,"打开原始网站 ↗");original.id="oia-image-site";original.rel="noopener noreferrer";original.target="_blank";buttons.append(swap,document.createTextNode("　"),original);foot.append(text,buttons);body.append(foot);box.append(top,body);document.body.append(box);
 box.addEventListener("click",ev=>{if(ev.target===box)box.close()});
 return box
}
function preview(entry,title,url){
 const box=dialog(),large=box.querySelector("#oia-image-large");
 const swap=box.querySelector("#oia-image-swap"),original=box.querySelector("#oia-image-site");
 let alt=false;
 const c=secureAsset(entry.cover),s=secureAsset(entry.scroll);
 if(!c)return;
 function update(){large.src=alt&&s?s:c;swap.textContent=alt?"返回首屏截图":"查看滚动后的画面";swap.disabled=!s}
 box.querySelector("#oia-image-caption").textContent=title+(entry.status==="official_cover"?" · 官方预览配图（非网页截图）":" · 真实网页截图");
 original.href=url&&/^https:\/\//.test(url)?url:entry.url;
 alt=false;swap.onclick=()=>{alt=!alt;update()};update();
 if(!box.open)box.showModal()
}
function mount(url,label,opts={}){
 const entry=get(url);
 if(!entry||!["captured","official_cover"].includes(entry.status)||!secureAsset(entry.cover)){
  return missing(entry?.reason||"已记录，后续重试采集");
 }
 const shell=el("div","snapshot-shell");
 shell.dataset.screenshotSource=entry.status==="official_cover"?"official_metadata_image":"chrome";
 const open=el("button","snapshot-open");open.type="button";open.title="放大查看 "+label+" 的真实网页截图";open.setAttribute("aria-label",open.title);
 const cover=el("img","snapshot-cover");cover.src=secureAsset(entry.cover);cover.alt=label+"：浏览器实拍首屏";cover.loading="lazy";cover.decoding="async";open.append(cover);
 if(secureAsset(entry.scroll)){
  const scroll=el("img","snapshot-scroll");scroll.src=secureAsset(entry.scroll);scroll.alt="";scroll.loading="lazy";scroll.decoding="async";open.append(scroll)
 }
 const labelBadge=el("span","snapshot-label",(entry.status==="official_cover"?"官网公开预览图（非截图）":(opts.kind||"真实网站截图"))+" · "+(opts.year||"2026"));open.append(labelBadge);
 open.onclick=()=>preview(entry,label,url);
 shell.append(open);
 if(secureAsset(entry.scroll)){
  const toggle=el("button","snapshot-contrast","对比滚动画面");toggle.type="button";
  toggle.setAttribute("aria-label","切换 "+label+" 的首屏与滚动截图");
  toggle.onclick=()=>{shell.classList.toggle("is-alt");toggle.textContent=shell.classList.contains("is-alt")?"显示首屏":"对比滚动画面"};
  shell.append(toggle)
 }
 return shell;
}
window.OIASiteMedia={load,mount,get,normalizeUrl};
})();
