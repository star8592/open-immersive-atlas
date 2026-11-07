// OIA Spatial Lab 04 — independent actual-Chrome smoke test.
// Optional Playwright is provided by the developer environment, not by the public website.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.OIA_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const MIME={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
  '.json':'application/json'};
const server=createServer(async(req,res)=>{
  const raw=new URL(req.url,'http://127.0.0.1').pathname;
  const path=resolve(root,'.'+(raw.endsWith('/')?raw+'index.html':raw));
  if(!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  try{const data=await readFile(path);res.writeHead(200,{'Content-Type':MIME[extname(path)]||'text/plain'});res.end(data);}
  catch{res.writeHead(404);res.end('Not found');}
});
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const host='http://127.0.0.1:'+server.address().port;
  const args=process.env.OIA_SWIFTSHADER==='1'?
    ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[];
  if(process.env.OIA_NO_SANDBOX==='1')args.push('--no-sandbox');
  let browser;
  try{
    browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||undefined,
      args,timeout:25000});
    const page=await browser.newPage({viewport:{width:1365,height:940},acceptDownloads:true});
    const errors=[],external=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(!r.url().startsWith(host))external.push(r.url());});
    const response=await page.goto(host+'/labs/motion-qa/',{waitUntil:'load',timeout:22000});
    assert.equal(response.status(),200);
    await page.waitForFunction(()=>window.__oiaMotionQA?.getState()?.frames>3,{timeout:20000});
    const initial=await page.evaluate(()=>window.__oiaMotionQA.getState());
    assert.equal(initial.ready,true,'Native WebGL2 must be available for visual pass');
    assert.equal(initial.renderError,null);
    assert.equal(initial.stats.glError,0);
    assert.equal(initial.stats.drawCalls,2);
    assert.equal(initial.terrain,'slope');
    const box=await page.locator('#view').boundingBox();
    assert.ok(box?.width>400&&box?.height>330);
    await page.locator('#play').click(); // pause for deterministic input tests
    await page.locator('#time').evaluate(el=>{
      el.value='0.46';el.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForTimeout(150);
    assert.equal((await page.locator('#attack').innerText()).includes('active'),true);
    for(const terrain of ['flat','steps','slope']){
      await page.locator('#terrain').selectOption(terrain);
      await page.waitForFunction(t=>window.__oiaMotionQA.getState().terrain===t,terrain);
      const s=await page.evaluate(()=>window.__oiaMotionQA.getState());
      assert.equal(s.stats.glError,0,'GL error in '+terrain);
    }
    for(const technique of ['thrust','diagonal','parry']){
      await page.locator('#technique').selectOption(technique);
      await page.waitForTimeout(45);
      const s=await page.evaluate(()=>window.__oiaMotionQA.getState());
      assert.equal(s.technique,technique);
      assert.equal(s.stats.glError,0);
    }
    await page.locator('#health').evaluate(el=>{
      el.value='0.1';el.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.locator('#distance').evaluate(el=>{
      el.value='1.0';el.dispatchEvent(new Event('input',{bubbles:true}));
    });
    await page.waitForFunction(()=>window.__oiaMotionQA.getState().ai?.action==='retreat',{timeout:5000});
    await page.locator('#visible').uncheck();
    await page.waitForFunction(()=>window.__oiaMotionQA.getState().ai?.action==='search',{timeout:5000});
    await page.locator('#visible').check();
    const yawBefore=(await page.evaluate(()=>window.__oiaMotionQA.getState())).camera.yaw;
    await page.mouse.move(box.x+box.width*.50,box.y+box.height*.55);
    await page.mouse.down();await page.mouse.move(box.x+box.width*.60,box.y+box.height*.58,{steps:5});await page.mouse.up();
    await page.mouse.wheel(0,-220);
    await page.waitForTimeout(150);
    const afterOrbit=await page.evaluate(()=>window.__oiaMotionQA.getState());
    assert.notEqual(afterOrbit.camera.yaw,yawBefore);
    assert.ok(afterOrbit.camera.distance<initial.camera.distance);
    await page.locator('#audit').click();
    const done=await page.evaluate(()=>window.__oiaMotionQA.getState());
    assert.equal(done.acceptance.passed,6,JSON.stringify(done.acceptance.results));
    assert.equal(done.acceptance.total,6);
    assert.equal(done.acceptance.fixture.terrain,'slope');
    assert.equal(done.acceptance.fixture.technique,'parry');
    assert.ok(await page.locator('#report').innerText().then(s=>s.includes('6/6')));
    const pending=page.waitForEvent('download',{timeout:12000});
    await page.locator('#export').click();
    const download=await pending;
    assert.equal(download.suggestedFilename(),'oia-motion-qa-report.json');
    const raw=await readFile(await download.path(),'utf8');
    const parsed=JSON.parse(raw);
    assert.equal(parsed.schema,'OIA-MOTION-QA-1');assert.equal(parsed.passed,6);
    assert.equal(external.length,0,'No third-party network requests');
    assert.deepEqual(errors,[]);
    if(process.env.OIA_MOTION_SCREENSHOT)await page.screenshot({
      path:process.env.OIA_MOTION_SCREENSHOT,fullPage:true});
    console.log('OIA_MOTION_BROWSER_PASS',JSON.stringify({
      engine:'WebGL2',drawCalls:initial.stats.drawCalls,
      terrainModes:3,swordTechniques:3,npcStates:['retreat','search'],
      shaderErrors:0,qualityChecks:done.acceptance.passed+'/'+done.acceptance.total,
      jsonExport:'PASS',orbit:'PASS',remoteRequests:external.length,jsExceptions:errors.length,
      debugTriangles:done.stats.debugTriangles
    }));
  }finally{
    if(browser)await browser.close();
    server.close();
  }
}
main().catch(e=>{console.error('OIA_MOTION_BROWSER_FAIL',e.stack||e);server.close();process.exitCode=1;});
