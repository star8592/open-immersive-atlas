// OIA Lab 05 — real Chrome browser integration tests; requires Playwright.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname,extname,sep} from 'node:path';
import {syntheticHumanoid} from './rig.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.OIA_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.json':'application/json'};
const server=createServer(async(req,res)=>{
 const n=new URL(req.url,'http://127.0.0.1').pathname;
 const path=resolve(root,'.'+(n.endsWith('/')?n+'index.html':n));
 if(!path.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return;}
 try{const buffer=await readFile(path);res.writeHead(200,{'Content-Type':mime[extname(path)]||'text/plain'});res.end(buffer);}
 catch{res.writeHead(404);res.end('Not found');}
});
async function main(){
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const host='http://127.0.0.1:'+server.address().port;
 const args=process.env.OIA_NO_SANDBOX==='1'?['--no-sandbox']:[];
 let browser;
 try{
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE||undefined,
    args,timeout:25000});
  const page=await browser.newPage({viewport:{width:1410,height:920},acceptDownloads:true});
  const exceptions=[],external=[];
  page.on('pageerror',e=>exceptions.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(host))external.push(r.url());});
  const response=await page.goto(host+'/labs/five-lane-runtime/',{waitUntil:'load',timeout:25000});
  assert.equal(response.status(),200);
  await page.waitForFunction(()=>window.__oiaFiveLane?.getState()?.nature?.plants>0,{timeout:20000});
  const first=await page.evaluate(()=>window.__oiaFiveLane.getState());
  assert.equal(Object.keys(first).length,5);
  assert.equal(first.rig.mapped,10);
  assert.equal(first.lod.fineTriangles,512);
  assert.ok(first.lod.seamErrorMeters<1e-8);
  assert.equal(first.assets.strategy,'parametric-reconstruction');
  assert.equal(first.nature.style,'watercolor');
  assert.equal((await page.locator('#browserStatus').innerText()),'5/5 READY');
  // Physics independent of navigation; a steep unclimbable slope must stop motion.
  await page.locator('#terrain').selectOption('steep');
  const steep=await page.evaluate(()=>window.__oiaFiveLane.getState().physics);
  assert.ok(steep.controller.blockedSteps>0);
  await page.locator('#terrain').selectOption('stairs');
  const stairs=await page.evaluate(()=>window.__oiaFiveLane.getState().physics);
  assert.equal(stairs.mode,'stairs');
  // Morphing identical shared edge across differing mesh densities.
  await page.locator('#lodBlend').evaluate(el=>{el.value='.91';el.dispatchEvent(new Event('input',{bubbles:true}));});
  const mixed=await page.evaluate(()=>window.__oiaFiveLane.getState().lod);
  assert.ok(mixed.seamErrorMeters<1e-8);
  assert.equal(mixed.morph,.91);
  // The real local-file input should read a user-selected glTF, not fetch its external buffers.
  const d=syntheticHumanoid();d.nodes[9].scale=[-1,1,1];
  await page.locator('#rigFile').setInputFiles({name:'original-mirrored-rig.gltf',
    mimeType:'model/gltf+json',buffer:Buffer.from(JSON.stringify(d))});
  await page.waitForFunction(()=>window.__oiaFiveLane.getState().rig.flags.some(x=>x.includes('Mirrored')),{timeout:5000});
  const rig=await page.evaluate(()=>window.__oiaFiveLane.getState().rig);
  assert.equal(rig.mapped,10);
  await page.locator('#rigFile').setInputFiles({name:'malformed.glb',
    mimeType:'application/octet-stream',buffer:Buffer.from([1,2,3,4])});
  await page.waitForFunction(()=>!!window.__oiaFiveLane.getState().rig.error,{timeout:5000});
  assert.ok((await page.locator('#rigOut').textContent()).includes('Input error'));
  await page.locator('#syntheticRig').click();
  assert.equal((await page.evaluate(()=>window.__oiaFiveLane.getState().rig)).mapped,10);
  // The routing cannot invent critical mechanical hole/shaft dimensions.
  await page.locator('#assetPreset').selectOption('ambiguousGear');
  assert.equal((await page.evaluate(()=>window.__oiaFiveLane.getState().assets)).strategy,'needs-dimensional-evidence');
  await page.locator('#assetPreset').selectOption('cloth');
  assert.equal((await page.evaluate(()=>window.__oiaFiveLane.getState().assets)).strategy,'topology-aware-retopology');
  // Switch between original CPU painted visual styles, confirm pixels are actually drawn.
  await page.locator('#natureStyle').selectOption('ink');
  await page.locator('#natureSeed').evaluate(el=>{el.value='22';el.dispatchEvent(new Event('input',{bubbles:true}));});
  const art=await page.evaluate(()=>window.__oiaFiveLane.getState().nature);
  assert.equal(art.style,'ink');assert.equal(art.seed,22);
  const pixelVariance=await page.locator('#natureCanvas').evaluate(canvas=>{
   const data=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
   const seen=new Set();
   for(let i=0;i<data.length;i+=408)seen.add(data[i]+','+data[i+1]+','+data[i+2]);
   return seen.size;
  });
  assert.ok(pixelVariance>20,'Landscape canvas must contain more than a flat fill');
  // Original five-module evidence report, with no external requests.
  const pending=page.waitForEvent('download',{timeout:11000});
  await page.locator('#exportAll').click();
  const download=await pending;
  assert.equal(download.suggestedFilename(),'oia-five-lane-qa.json');
  const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(exported.schema,'OIA-FIVE-LANE-RUNTIME-1');
  assert.equal(Object.keys(exported.runs).length,5);
  assert.deepEqual(exceptions,[]);
  assert.deepEqual(external,[]);
  if(process.env.OIA_FIVE_SCREENSHOT)await page.screenshot({path:process.env.OIA_FIVE_SCREENSHOT,fullPage:true});
  console.log('OIA_FIVE_LANE_BROWSER_PASS',JSON.stringify({
    http:response.status(),lanes:5,physicsSteepBlocked:true,stairMode:true,
    LODMixedSeam:mixed.seamErrorMeters,mirroredRigDetected:true,malformedRejected:true,
    cautiousGearRoute:true,clothRetopology:true,landscapeColors:pixelVariance,
    JSONexport:true,externalRequests:external.length,pageErrors:exceptions.length
  }));
 }finally{if(browser)await browser.close();server.close();}
}
main().catch(e=>{console.error('OIA_FIVE_LANE_BROWSER_FAIL',e.stack||e);server.close();process.exitCode=1;});

