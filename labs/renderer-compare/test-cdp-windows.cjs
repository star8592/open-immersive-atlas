// Optional standalone Chrome CDP smoke test (no Playwright/npm dependency).
// Runs a NEW disposable Chrome profile; does not attach to the user's existing Chrome.
// On Windows: node labs/renderer-compare/test-cdp-windows.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const http=require('node:http');
const {spawn,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const chrome=process.env.CHROME_EXECUTABLE||
  (process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'/usr/bin/google-chrome');
const wait=ms=>new Promise(done=>setTimeout(done,ms));
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
  const raw=new URL(req.url,'http://127.0.0.1').pathname;
  const target=path.resolve(root,'.'+(raw.endsWith('/')?raw+'index.html':raw));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(target,(err,data)=>{
    if(err){res.writeHead(404);res.end('Missing');return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'text/plain'});res.end(data);
  });
});
async function openCDP(url,dir) {
  const args=['--headless=new','--remote-debugging-address=127.0.0.1',
    '--remote-debugging-port=0','--remote-allow-origins=*',
    '--disable-extensions','--no-first-run','--no-default-browser-check',
    '--enable-unsafe-webgpu','--ignore-gpu-blocklist',
    '--user-data-dir='+dir,url];
  const chromeProcess=spawn(chrome,args,{stdio:'ignore',windowsHide:true});
  let ws=null;
  try{
    const debugFile=path.join(dir,'DevToolsActivePort');
    for(let i=0;i<150&&!fs.existsSync(debugFile);i++)await wait(100);
    if(!fs.existsSync(debugFile))throw Error('Chrome CDP debugging port unavailable');
    const port=Number(fs.readFileSync(debugFile,'utf8').split(/\r?\n/)[0]);
    const targets=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();
    const target=targets.find(t=>t.type==='page'&&t.url.includes('/labs/renderer-compare/'));
    if(!target)throw Error('Chrome target page not found');
    ws=new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{
      ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});
    });
    let seq=0;
    const callbacks=new Map();
    ws.addEventListener('message',event=>{
      const msg=JSON.parse(event.data);
      if(msg.id&&!callbacks.has(msg.id))return;
      if(callbacks.has(msg.id)){callbacks.get(msg.id)(msg);callbacks.delete(msg.id);}
    });
    async function call(method,params={}) {
      const id=++seq;
      const result=await Promise.race([
        new Promise(resolve=>{callbacks.set(id,resolve);ws.send(JSON.stringify({id,method,params}));}),
        wait(10000).then(()=>{throw Error('CDP timeout '+method);})
      ]);
      if(result.error)throw Error(result.error.message);
      return result;
    }
    return {chromeProcess,ws,call};
  }catch(e){
    if(ws)ws.close();
    try{chromeProcess.kill();}catch{}
    throw e;
  }
}
async function main(){
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'oia-cdp-gpu-'));
  let cd=null;
  try{
    await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
    const url='http://127.0.0.1:'+server.address().port+'/labs/renderer-compare/';
    cd=await openCDP(url,profile);
    await cd.call('Runtime.enable');
    async function evaluate(expression){
      const result=await cd.call('Runtime.evaluate',{expression,returnByValue:true});
      if(result.result?.exceptionDetails)throw Error('Page JS exception: '+JSON.stringify(result.result.exceptionDetails).slice(0,400));
      return result.result?.result?.value;
    }
    const state=async()=>JSON.parse(await evaluate('JSON.stringify(window.__oiaCompare?.getState?.()||{})')||'{}');
    let initial={};
    for(let i=0;i<70;i++){await wait(180);initial=await state();if(initial.ready)break;}
    assert.equal(initial.ready,true,'Lab must initialize');
    assert.equal(initial.available.webgl2,true,'WebGL2 baseline unavailable');
    assert.equal(initial.triangles,18432);
    if(process.env.OIA_REQUIRE_WEBGPU==='1')assert.equal(initial.available.webgpu,true,'Hardware WebGPU is required for this run');
    await evaluate('document.getElementById("measure").click()');
    let finished={};
    for(let i=0;i<160;i++){await wait(300);finished=await state();if(finished.benchmarkResult)break;}
    assert.ok(finished.benchmarkResult,'Benchmark must finish');
    const result=finished.benchmarkResult;
    assert.equal(result.schema,'OIA-RENDER-COMPARE-2');
    const timers={};
    for(const [api,measure] of Object.entries(result.rendererModes)){
      assert.equal(measure.sampleFrames,120);
      const t=measure.gpuPassMs;
      assert.ok(t,'GPU timer result must be present even when unsupported');
      assert.equal(t.requested,24);
      if(t.supported&&t.collected===0&&process.env.OIA_REQUIRE_GPU_TIMESTAMPS==='1')
        throw Error(api+' advertised GPU timestamps but none were collected: '+(t.reason||t.status));
      if(!t.supported)assert.equal(t.p95Ms,null,'Unsupported timers must be null');
      timers[api]={supported:t.supported,status:t.status,method:t.method,collected:t.collected,
        requested:t.requested,p50Ms:t.p50Ms,p95Ms:t.p95Ms,reason:t.reason};
    }
    assert.equal(finished.glError,0);
    if(finished.available.webgpu)assert.equal(finished.gpuError,0);
    console.log('OIA_GPU_CDP_PASS',JSON.stringify({adapter:finished.gpuAdapter,
      available:finished.available,renderedFrames:finished.frames,
      triangles:result.scene.triangles,viewport:result.resolution,timers,
      userAgent:result.system.userAgent}));
  }finally{
    if(cd){
      try{cd.ws.close();}catch{}
      try{
        if(process.platform==='win32')
          spawnSync('taskkill',['/PID',String(cd.chromeProcess.pid),'/T','/F'],
            {stdio:'ignore',windowsHide:true,timeout:8000});
        else cd.chromeProcess.kill();
      }catch{}
    }
    server.close();
    try{fs.rmSync(profile,{recursive:true,force:true});}catch{}
  }
}
main().catch(e=>{console.error('OIA_GPU_CDP_FAILED',e.stack||e);process.exitCode=1;server.close();});
