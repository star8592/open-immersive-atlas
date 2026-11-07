import {createGrid,cameraFrame,sampleSummary,VERSION} from './scene.mjs';
import {createWebGL2,createWebGPU} from './renderers.mjs';
const $=id=>document.getElementById(id);
const glCanvas=$('canvas-gl'),gpuCanvas=$('canvas-gpu'),density=$('density'),mode=$('mode'),fog=$('fog');
const measureBtn=$('measure'),exportBtn=$('export'),progress=$('progress'),output=$('results');
let geometry=null,glRenderer=null,gpuRenderer=null,building=false,ready=false,generation=0,benchmark=null,lastResults=null;
const frames={webgl2:0,webgpu:0};
const calls={webgl2:[],webgpu:[]},intervals=[];
let previous=0,uiAt=0;
const cam={yaw:.6,pitch:.95,distance:32};
function status(api,text,unavailable=false){
  const s=$(api==='webgl2'?'status-gl':'status-gpu');
  const overlay=$(api==='webgl2'?'overlay-gl':'overlay-gpu');
  s.textContent=text;overlay.hidden=!unavailable;if(unavailable)overlay.textContent=text;
}
function resize(canvas) {
  const rect=canvas.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,1.25);
  const w=Math.max(1,Math.min(960,Math.round(rect.width*dpr)));
  const h=Math.max(1,Math.min(600,Math.round(rect.height*dpr)));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
}
function push(list,n,max=150){list.push(n);if(list.length>max)list.shift();}
function updateUI(){
  $('scene-info').textContent=geometry?
    'Shared scene: '+geometry.triangles.toLocaleString()+' triangles · '+geometry.vertexCount.toLocaleString()+
    ' vertices · '+glCanvas.width+'×'+glCanvas.height+' px · '+VERSION:'Initializing';
  $('frame-info').textContent='rAF interval p95: '+sampleSummary(intervals).p95Ms.toFixed(2)+' ms (combined browser loop)';
  $('call-gl').textContent=calls.webgl2.length?sampleSummary(calls.webgl2).p95Ms.toFixed(3)+' ms':'—';
  $('call-gpu').textContent=calls.webgpu.length?sampleSummary(calls.webgpu).p95Ms.toFixed(3)+' ms':'—';
  $('frames-gl').textContent=String(frames.webgl2);$('frames-gpu').textContent=String(frames.webgpu);
}
function available(api){return api==='webgl2'?!!glRenderer:!!gpuRenderer;}
function renderApi(api,frame){
  const renderer=api==='webgl2'?glRenderer:gpuRenderer;
  if(!renderer)return;
  const canvas=api==='webgl2'?glCanvas:gpuCanvas;
  const start=performance.now();
  try{renderer.render(frame,{fog:fog.checked});}
  catch(e){
    status(api,'Runtime failure: '+e.message,true);
    if(api==='webgpu'){gpuRenderer?.destroy();gpuRenderer=null;}
    else {glRenderer?.destroy();glRenderer=null;}
    if(benchmark){endBenchmark('Renderer failure: '+e.message);}
    return;
  }
  push(calls[api],performance.now()-start);frames[api]++;
}
function snapshot(){
  return{ready,building,available:{webgl2:!!glRenderer,webgpu:!!gpuRenderer},
    triangles:geometry?.triangles||0,vertexCount:geometry?.vertexCount||0,
    packedVertexBytes:geometry?.vertexBytes||0,indexBytes:geometry?.indexBytes||0,
    dimensions:{gl:[glCanvas.width,glCanvas.height],gpu:[gpuCanvas.width,gpuCanvas.height]},
    mode:mode.value,fog:fog.checked,camera:{...cam},
    frames:{...frames},
    jsCallP95Ms:{webgl2:sampleSummary(calls.webgl2).p95Ms,webgpu:sampleSummary(calls.webgpu).p95Ms},
    frameIntervalP95Ms:sampleSummary(intervals).p95Ms,
    glError:glRenderer?.getError()??'UNAVAILABLE',
    gpuError:gpuRenderer?.getError()??'UNAVAILABLE',
    gpuAdapter:gpuRenderer?.getAdapterInfo?.()||null,
    benchmarkActive:!!benchmark,benchmarkResult:lastResults};
}
window.__oiaCompare=Object.freeze({getState:snapshot});
function endBenchmark(error=''){
  const b=benchmark;
  if(!b)return;
  if(error)b.errors.push(error);
  lastResults={schema:'OIA-RENDER-COMPARE-1',timestamp:new Date().toISOString(),
    scene:{segments:geometry.segments,triangles:geometry.triangles,vertexCount:geometry.vertexCount,
      verticesBytes:geometry.vertexBytes,indicesBytes:geometry.indexBytes},
    resolution:{webgl2:[glCanvas.width,glCanvas.height],webgpu:[gpuCanvas.width,gpuCanvas.height]},
    fog:b.fog,rendererModes:b.results,unavailable:b.unavailable,errors:b.errors,
    system:{userAgent:navigator.userAgent,secureContext:isSecureContext,
      webgpuAdapter:gpuRenderer?.getAdapterInfo?.()||null},
    caveat:'JS render-call time is not GPU time. rAF interval includes presentation, vsync and browser scheduling; no cross-API performance superiority claim.'};
  benchmark=null;measureBtn.disabled=false;exportBtn.disabled=false;
  density.disabled=false;mode.disabled=false;fog.disabled=false;$('reset').disabled=false;
  progress.textContent=error?'Measurement stopped / 测试中止: '+error:'Sequential sampling completed / 顺序采样结束';
  output.textContent=JSON.stringify(lastResults,null,2);
}
function beginBenchmark(){
  if(building||!ready||benchmark)return;
  const phases=['webgl2','webgpu'].filter(available);
  if(!phases.length)return;
  const unavailable=['webgl2','webgpu'].filter(api=>!available(api));
  lastResults=null;exportBtn.disabled=true;
  density.disabled=true;mode.disabled=true;fog.disabled=true;$('reset').disabled=true;
  benchmark={phases,idx:0,frame:0,warmup:40,samples:120,
    currentCalls:[],currentIntervals:[],results:{},unavailable,errors:[],
    fog:fog.checked,frozen:{...cam},lastFrame:0};
  progress.textContent='Warmup / 预热 '+phases[0]+'…';output.textContent='Measurement in progress / 正在采样…';
}
function benchmarkFrame(now,frame){
  const b=benchmark;if(!b)return;
  const api=b.phases[b.idx];
  const renderer=api==='webgl2'?glRenderer:gpuRenderer;
  if(!renderer){endBenchmark('Missing renderer '+api);return;}
  const canvas=api==='webgl2'?glCanvas:gpuCanvas;
  const activeFrame=canvas.width===glCanvas.width&&canvas.height===glCanvas.height?
    frame:cameraFrame(b.frozen.yaw,b.frozen.pitch,b.frozen.distance,canvas.width/canvas.height);
  const t=performance.now();
  try{renderer.render(activeFrame,{fog:b.fog});}
  catch(e){status(api,'Benchmark error: '+e.message,true);endBenchmark(e.message);return;}
  const callMs=performance.now()-t;
  frames[api]++;push(calls[api],callMs);
  const elapsed=b.lastFrame?now-b.lastFrame:0;b.lastFrame=now;
  if(b.frame>=b.warmup){b.currentCalls.push(callMs);if(elapsed>0&&elapsed<1000)b.currentIntervals.push(elapsed);}
  b.frame++;
  progress.textContent='Sequential / 顺序采样 '+api+' '+Math.min(b.frame,b.warmup+b.samples)+'/'+(b.warmup+b.samples);
  if(b.frame<b.warmup+b.samples)return;
  b.results[api]={sampleFrames:b.currentCalls.length,
    jsCallMs:sampleSummary(b.currentCalls),rafIntervalMs:sampleSummary(b.currentIntervals),
    canvasPixels:canvas.width*canvas.height};
  b.idx++;if(b.idx>=b.phases.length){endBenchmark();return;}
  b.frame=0;b.lastFrame=0;b.currentCalls=[];b.currentIntervals=[];
}
function frameLoop(now){
  requestAnimationFrame(frameLoop);
  if(previous>0&&now-previous<1000)push(intervals,now-previous);
  previous=now;
  if(building||!ready)return;
  resize(glCanvas);resize(gpuCanvas);
  const active=benchmark?.frozen||cam;
  // One camera transform is used by both renderers at identical viewport dimensions.
  const fGL=cameraFrame(active.yaw,active.pitch,active.distance,glCanvas.width/glCanvas.height);
  if(benchmark){benchmarkFrame(now,fGL);}
  else {
    if(mode.value!=='webgpu')renderApi('webgl2',fGL);
    if(mode.value!=='webgl2'){
      const fGPU=glCanvas.width===gpuCanvas.width&&glCanvas.height===gpuCanvas.height?
        fGL:cameraFrame(active.yaw,active.pitch,active.distance,gpuCanvas.width/gpuCanvas.height);
      renderApi('webgpu',fGPU);
    }
  }
  if(now-uiAt>700){updateUI();uiAt=now;}
}
async function build(){
  if(building||benchmark)return;
  const token=++generation;
  building=true;ready=false;measureBtn.disabled=true;exportBtn.disabled=true;
  status('webgl2','Initializing WebGL2…');status('webgpu','Checking WebGPU support…');
  glRenderer?.destroy();gpuRenderer?.destroy();glRenderer=null;gpuRenderer=null;
  try{
    geometry=createGrid(Number(density.value));resize(glCanvas);resize(gpuCanvas);
    glRenderer=createWebGL2(glCanvas,geometry);
    status('webgl2','Available · original GLSL renderer');
  }catch(e){status('webgl2','Unavailable: '+e.message,true);}
  try{
    gpuRenderer=await createWebGPU(gpuCanvas,geometry);
    if(token!==generation){gpuRenderer.destroy();gpuRenderer=null;return;}
    status('webgpu','Available · original WGSL renderer');
  }catch(e){status('webgpu','Unavailable: '+e.message,true);}
  if(token!==generation)return;
  calls.webgl2.length=0;calls.webgpu.length=0;intervals.length=0;
  frames.webgl2=0;frames.webgpu=0;lastResults=null;
  ready=true;building=false;measureBtn.disabled=!glRenderer&&!gpuRenderer;
  progress.textContent='Ready · '+(gpuRenderer?'WebGPU and WebGL2 available':'WebGL2 fallback or no rendering adapter')+
    ' / 初始化结束';
  updateUI();
}
let drag=null;
for(const canvas of [glCanvas,gpuCanvas]){
  canvas.addEventListener('pointerdown',e=>{
    if(benchmark||building)return;
    drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId||benchmark)return;
    cam.yaw-=(e.clientX-drag.x)*.008;
    cam.pitch=Math.max(.24,Math.min(1.4,cam.pitch+(e.clientY-drag.y)*.006));
    drag.x=e.clientX;drag.y=e.clientY;
  });
  canvas.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId)drag=null;});
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{
    e.preventDefault();if(benchmark)return;
    cam.distance=Math.max(7,Math.min(75,cam.distance*Math.exp(e.deltaY*.001)));
  },{passive:false});
}
$('reset').addEventListener('click',()=>{cam.yaw=.6;cam.pitch=.95;cam.distance=32;});
density.addEventListener('change',build);
measureBtn.addEventListener('click',beginBenchmark);
exportBtn.addEventListener('click',()=>{
  if(!lastResults)return;
  const blob=new Blob([JSON.stringify(lastResults,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='oia-webgpu-webgl2-comparison.json';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
window.addEventListener('pagehide',()=>{glRenderer?.destroy();gpuRenderer?.destroy();});
requestAnimationFrame(frameLoop);
build();
