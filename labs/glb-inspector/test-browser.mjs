// Optional end-to-end test for the original public GLB inspector.
// Requirements: Playwright module and Chromium/Chrome installed; no model upload.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,extname,sep} from 'node:path';
import {createRequire} from 'node:module';
import {demoGlb,demoName} from './sample.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.OIA_PLAYWRIGHT_MODULE||'playwright');
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const type={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json'};
const server=createServer(async(req,res)=>{
  const part=new URL(req.url,'http://127.0.0.1').pathname;
  const file=resolve(root,'.'+(part.endsWith('/')?part+'index.html':part));
  if(!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  try{const data=await readFile(file);res.writeHead(200,{'Content-Type':type[extname(file)]||'text/plain'});res.end(data);}
  catch{res.writeHead(404);res.end('404');}
});
async function main(){
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const args=process.env.OIA_SWIFTSHADER==='1'?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[];
  if(process.env.OIA_NO_SANDBOX==='1')args.push('--no-sandbox');
  const browser=await chromium.launch({headless:true,
    executablePath:process.env.CHROME_EXECUTABLE||undefined,args,timeout:25000});
  try{
    const page=await browser.newPage({viewport:{width:1240,height:850},acceptDownloads:true});
    const exceptions=[],remote=[];
    page.on('pageerror',e=>exceptions.push(e.message));
    page.on('request',r=>{if(r.url().includes('example.invalid'))remote.push(r.url());});
    const response=await page.goto('http://127.0.0.1:'+server.address().port+'/labs/glb-inspector/',{waitUntil:'load'});
    assert.equal(response.status(),200);
    await page.locator('#sample').click();
    await page.waitForFunction(()=>window.__oiaInspector?.getReport()?.stats.triangles===1);
    const sample=await page.evaluate(()=>window.__oiaInspector.getReport());
    assert.equal(sample.counts.errors,0);assert.equal(sample.stats.vertices,3);
    assert.equal(await page.locator('#metrics .metric').count(),9);
    const downloadPromise=page.waitForEvent('download');
    await page.locator('#export').click();
    const download=await downloadPromise;
    assert.equal(download.suggestedFilename(),'oia-glb-preflight-report.json');
    await page.locator('#language').click();
    assert.equal(await page.locator('#language').innerText(),'中文');
    const broken=demoGlb();new DataView(broken.buffer).setUint32(8,broken.length+20,true);
    await page.locator('#file').setInputFiles({name:'broken.glb',mimeType:'model/gltf-binary',buffer:Buffer.from(broken)});
    await page.waitForFunction(()=>window.__oiaInspector?.getError()?.code==='LENGTH');
    assert.equal(await page.locator('#report').isVisible(),false);
    await page.locator('#file').setInputFiles({name:demoName,mimeType:'model/gltf-binary',buffer:Buffer.from(demoGlb())});
    await page.waitForFunction(()=>window.__oiaInspector?.getReport()?.stats.vertices===3);
    const gltf={asset:{version:'2.0'},buffers:[{byteLength:64,uri:'https://example.invalid/should-not-fetch.bin'}],
      nodes:[{name:'Original'}],scenes:[{nodes:[0]}],scene:0};
    await page.locator('#file').setInputFiles({name:'external.gltf',mimeType:'model/gltf+json',
      buffer:Buffer.from(JSON.stringify(gltf))});
    await page.waitForFunction(()=>window.__oiaInspector?.getReport()?.stats.externalBuffers===1);
    const final=await page.evaluate(()=>window.__oiaInspector.getReport());
    assert.ok(final.issues.some(i=>i.code==='EXTERNAL'));
    assert.deepEqual(remote,[],'Inspector must not request external buffers');
    assert.deepEqual(exceptions,[],'No browser JavaScript exceptions');
    await page.locator('#sample').click();
    await page.screenshot({path:process.env.OIA_SCREENSHOT||'/tmp/oia-glb-inspector.png'});
    console.log(JSON.stringify({result:'PASS',sample:{triangles:sample.stats.triangles,vertices:sample.stats.vertices},
      passed:['demo','file input','malformed GLB','external URI blocked','language','JSON export','no JS exception'],
      screenshot:process.env.OIA_SCREENSHOT||'/tmp/oia-glb-inspector.png'}));
  } finally{await browser.close();}
}
main().catch(e=>{console.error('GLB_BROWSER_SMOKE_FAILED:',e.stack||e);process.exitCode=1;})
  .finally(()=>server.close());
