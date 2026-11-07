// Optional real-browser smoke test for Spatial Lab 03.
// Requires Playwright + Chrome. No third-party assets or user data are fetched.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.OIA_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const MIME={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json'};
const server=createServer(async(req,res)=>{
  const p=new URL(req.url,'http://127.0.0.1').pathname;
  const path=resolve(root,'.'+(p.endsWith('/')?p+'index.html':p));
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  try{const content=await readFile(path);res.writeHead(200,{'Content-Type':MIME[extname(path)]||'text/plain'});res.end(content);}
  catch{res.writeHead(404);res.end('Not found');}
});
async function runOne(url,extraArgs,tag){
  const args=process.env.OIA_SWIFTSHADER==='1'?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[];
  if(process.env.OIA_NO_SANDBOX==='1')args.push('--no-sandbox');
  args.push(...extraArgs);
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||undefined,args,timeout:25000});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:880},acceptDownloads:true});
    const errors=[],remote=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(!r.url().startsWith(url.split('/labs/')[0]))remote.push(r.url());});
    const response=await page.goto(url,{waitUntil:'load',timeout:20000});
    assert.equal(response.status(),200);
    await page.waitForFunction(()=>window.__oiaCompare?.getState()?.ready===true,{timeout:20000});
    await page.waitForTimeout(500);
    const initial=await page.evaluate(()=>window.__oiaCompare.getState());
    assert.ok(initial.available.webgl2,'WebGL2 baseline must work');
    assert.equal(initial.triangles,18432);
    assert.equal(initial.vertexCount,9409);
    assert.ok(initial.frames.webgl2>0);
    assert.equal(initial.glError,0);
    await page.locator('#mode').selectOption('webgl2');
    await page.locator('#density').selectOption('160');
    await page.waitForFunction(()=>window.__oiaCompare?.getState()?.triangles===51200&&window.__oiaCompare.getState().ready,{timeout:20000});
    const second=await page.evaluate(()=>window.__oiaCompare.getState());
    assert.equal(second.triangles,51200);
    assert.equal(second.vertexCount,25921);
    await page.locator('#fog').uncheck();
    const rect=await page.locator('#canvas-gl').boundingBox();
    assert.ok(rect?.width>100&&rect?.height>100);
    const x=rect.x+rect.width*.42,y=rect.y+rect.height*.48;
    await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+Math.min(140,rect.width*.26),y+Math.min(45,rect.height*.16),{steps:6});await page.mouse.up();
    await page.mouse.wheel(0,-230);
    await page.waitForTimeout(300);
    const moved=await page.evaluate(()=>window.__oiaCompare.getState());
    assert.notEqual(moved.camera.yaw,initial.camera.yaw);
    assert.ok(moved.camera.distance<initial.camera.distance);
    assert.equal(moved.fog,false);
    await page.locator('#reset').click();
    const reset=await page.evaluate(()=>window.__oiaCompare.getState());
    assert.equal(reset.camera.distance,32);
    // The measurement uses only the available API for each phase; no FPS pass threshold.
    await page.locator('#measure').click();
    await page.waitForFunction(()=>window.__oiaCompare?.getState()?.benchmarkResult!==null,{timeout:80000});
    const done=await page.evaluate(()=>window.__oiaCompare.getState());
    assert.ok(done.benchmarkResult.rendererModes.webgl2.sampleFrames===120);
    assert.ok(done.benchmarkResult.rendererModes.webgl2.jsCallMs.p95Ms>=0);
    assert.ok(done.benchmarkResult.rendererModes.webgl2.rafIntervalMs.count>0);
    if(done.available.webgpu)assert.equal(done.benchmarkResult.rendererModes.webgpu.sampleFrames,120);
    for(const api of Object.keys(done.benchmarkResult.rendererModes)){
      const sample=done.benchmarkResult.rendererModes[api].gpuPassMs;
      assert.ok(sample,'Every renderer must explicitly report GPU timer support or absence');
      assert.equal(sample.requested,24);
      assert.equal(sample.samplesMs.length,sample.collected,'Exported raw GPU sample count');
      assert.ok(['complete','partial','unsupported','unavailable','error'].includes(sample.status));
      if(sample.status==='unsupported')assert.equal(sample.p95Ms,null,'Unsupported GPU queries must not fake GPU timings');
      if(sample.collected>0){
        assert.ok(Number.isFinite(sample.p95Ms)&&sample.p95Ms>=0);
        assert.equal(sample.units,'ms');
      }
    }
    const downloadPromise=page.waitForEvent('download');
    await page.locator('#export').click();const download=await downloadPromise;
    assert.equal(download.suggestedFilename(),'oia-webgpu-webgl2-comparison.json');
    assert.equal(done.glError,0);
    assert.deepEqual(errors,[],'No JS exceptions');
    assert.deepEqual(remote,[],'No external network requests');
    const path=process.env.OIA_SCREENSHOT||'/tmp/oia-render-compare-'+tag+'.png';
    await page.screenshot({path});
    return{status:'PASS',tag,
      available:done.available,
      webgpuStatus:await page.locator('#status-gpu').textContent(),
      scene:{triangles:done.triangles,vertices:done.vertexCount},measured:Object.keys(done.benchmarkResult.rendererModes),
      gpuTimers:Object.fromEntries(Object.entries(done.benchmarkResult.rendererModes).map(([api,x])=>[api,x.gpuPassMs])),
      screenshot:path};
  }finally{await browser.close();}
}
async function main(){
  await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
  const url='http://127.0.0.1:'+server.address().port+'/labs/renderer-compare/';
  try{
    const a=await runOne(url,[],'baseline');console.log('SMOKE',JSON.stringify(a));
    if(process.env.OIA_TEST_SOFTWARE_WEBGPU==='1'){
      const b=await runOne(url,['--enable-unsafe-webgpu','--use-webgpu-adapter=swiftshader'],'software-guard');
      console.log('SMOKE',JSON.stringify(b));
      assert.ok(b.webgpuStatus.includes('software WebGPU adapter')||b.webgpuStatus.includes('WebGPU adapter'),
        'Software adapters must be guarded or explicitly unavailable');
    }
  }finally{server.close();}
}
main().catch(e=>{console.error('RENDER_COMPARE_SMOKE_FAILED',e.stack||e);process.exitCode=1;server.close();});
