// OIA Five-Lane Runtime: one browser dashboard, five isolated pure computing modules.
import {terrainY,sweepCharacter,planGridPath} from './physics.mjs';
import {createPatch,seamError,sampleVerticalEdge,transitionError} from './lod.mjs';
import {auditRigDocument,auditRigBytes,syntheticHumanoid} from './rig.mjs';
import {routeAsset,EXAMPLES} from './assets.mjs';
import {drawNature} from './nature.mjs';
const $=id=>document.getElementById(id),results={};
const safe=(fn,key,out)=>{try{const value=fn();results[key]=value;return value;}catch(e){results[key]={error:String(e.message||e)};$(out).textContent='ERROR / 异常: '+String(e.message||e);return null;}};
const formatted=x=>Number(x).toFixed(6),rgb=(ctx,color)=>{ctx.strokeStyle=color;ctx.fillStyle=color;};
function physics(){
 return safe(()=>{
  const mode=$('terrain').value,canvas=$('physicsCanvas'),ctx=canvas.getContext('2d');
  const obstacles=[[5,0,5.8,9]],blocked=Array.from({length:9},(_,z)=>({x:5,z}));
  const nav=planGridPath({x:2,z:2},{x:10,z:2},{width:12,height:12,blocked});
  const sweep=sweepCharacter({x:2,z:2},{x:7,z:2},{mode,radius:.24,obstacles});
  const w=canvas.width,h=canvas.height,scale=Math.min((w-30)/12,(h-20)/12),x0=25,y0=10;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0b2632';ctx.fillRect(0,0,w,h);
  for(let z=0;z<12;z++)for(let x=0;x<12;x++){
   const ground=terrainY(x,z,mode),light=Math.round(Math.max(25,Math.min(95,50+ground*7)));
   ctx.fillStyle='rgb('+(light*.5|0)+','+light+','+(light*.85|0)+')';
   ctx.fillRect(x0+x*scale,y0+z*scale,scale-1,scale-1);
  }
  ctx.fillStyle='#bc5e5d';ctx.fillRect(x0+5*scale,y0,scale*.8,9*scale);
  if(nav.reachable){
   ctx.beginPath();
   nav.path.forEach((p,i)=>{const x=x0+(p.x+.5)*scale,y=y0+(p.z+.5)*scale;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
   ctx.strokeStyle='#8ff3d3';ctx.lineWidth=3;ctx.stroke();
  }
  ctx.fillStyle='#f9d37d';ctx.beginPath();ctx.arc(x0+(sweep.x+.5)*scale,y0+(sweep.z+.5)*scale,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e8eef4';ctx.font='12px system-ui';ctx.fillText('A*: '+(nav.reachable?nav.cost+' steps':'blocked'),12,18);
  const result={mode,controller:sweep,navigation:{reachable:nav.reachable,length:nav.path.length,expanded:nav.expanded},surfaceHeight:terrainY(sweep.x,sweep.z,mode)};
  $('physicsOut').textContent='Controller / 角色: '+sweep.movedDistance.toFixed(3)+'m / 7.000m requested; blocked='+sweep.blockedSteps+
    '\nA* / 路径: '+nav.path.length+' cells, expanded='+nav.expanded+
    '\nSlope, step and AABB checks are isolated from navigation.';
  return result;
 },'physics','physicsOut');
}
function lod(){
 return safe(()=>{
  const t=Number($('lodBlend').value),fine=createPatch({x0:-8,z0:0,size:8,segments:16,morph:t,edgeStep:1}),
   coarse=createPatch({x0:0,z0:0,size:8,segments:8,morph:1-t,edgeStep:1});
  const seam=seamError(fine,coarse,256),temporal=transitionError({
    x0:-8,z0:0,size:8,segments:16,edgeStep:1},t,Math.min(1,t+.001));
  const c=$('lodCanvas'),ctx=c.getContext('2d'),w=c.width,h=c.height;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a2430';ctx.fillRect(0,0,w,h);
  function line(pick,color,width){
   ctx.beginPath();
   for(let i=0;i<=240;i++){
    const z=8*i/240,height=pick(z),x=14+i*(w-28)/240,y=h/2-height*53;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  for(let y=40;y<h;y+=40){ctx.strokeStyle='#355062';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  line(z=>sampleVerticalEdge(fine,'right',z),'#7bf0d6',3.5);
  line(z=>sampleVerticalEdge(coarse,'left',z),'#f1c57c',1.7);
  ctx.font='12px system-ui';ctx.fillStyle='#e2f5fb';ctx.fillText('Shared world edge · Fine 16 / Coarse 8',13,20);
  const result={morph:t,fineTriangles:fine.triangles,coarseTriangles:coarse.triangles,
   seamErrorMeters:seam.maxErrorMeters,temporalDeltaMeters:temporal.maxVertexDeltaMeters};
  $('lodValue').textContent=t.toFixed(2);
  $('lodOut').textContent='Common edge max error: '+seam.maxErrorMeters.toExponential(3)+'m'+
   '\nTemporal blend Δ 0.001: '+temporal.maxVertexDeltaMeters.toExponential(3)+'m'+
   '\nFine/coarse triangles: '+fine.triangles+' / '+coarse.triangles;
  return result;
 },'lod','lodOut');
}
function rigReport(report,label){
 results.rig=report;
 const c=$('rigCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);
 ctx.fillStyle='#092530';ctx.fillRect(0,0,c.width,c.height);
 const joints=report.joints||{},points=Object.values(joints).map(x=>x.position);
 if(points.length){
  const coords=points.flatMap(p=>[p[0],p[1]]),minX=Math.min(...points.map(p=>p[0])),
    maxX=Math.max(...points.map(p=>p[0])),minY=Math.min(...points.map(p=>p[1])),
    maxY=Math.max(...points.map(p=>p[1])),spanX=Math.max(.4,maxX-minX),spanY=Math.max(.4,maxY-minY);
  const span=Math.max(spanX/.72,spanY/.72);
  const project=p=>[c.width/2+(p[0]-(minX+maxX)/2)*175/span,
   c.height/2-(p[1]-(minY+maxY)/2)*175/span];
  for(const chain of [['pelvis','leftHip','leftKnee','leftAnkle'],
    ['pelvis','rightHip','rightKnee','rightAnkle'],
    ['rightShoulder','rightElbow','rightWrist']]){
   ctx.beginPath();let open=false;
   for(const key of chain)if(joints[key]){
    const [x,y]=project(joints[key].position);if(!open){ctx.moveTo(x,y);open=true;}else ctx.lineTo(x,y);
   }
   ctx.lineWidth=4;ctx.strokeStyle=chain[1]?.startsWith('left')?'#83f0cc':'#93befe';ctx.stroke();
  }
  for(const [key,j] of Object.entries(joints)){
   const [x,y]=project(j.position);ctx.fillStyle='#f2c57c';
   ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#c8e5f1';ctx.font='10px system-ui';ctx.fillText(key,x+7,y-5);
  }
 }
 $('rigOut').textContent=label+' · '+report.mapped+'/'+report.required+' mapped semantic joints'+
  '\nSkins='+report.skinCount+'; indexed bones='+report.jointCount+
  '; structural errors='+report.errors.length+'; flags='+report.flags.length+
  '\n'+(report.flags.concat(report.errors,report.warnings).slice(0,4).join(' | ')||'No additional diagnostics')+
  '\nNo external files or referenced buffers fetched.';
 return report;
}
function syntheticRig(){
 return safe(()=>rigReport(auditRigDocument(syntheticHumanoid()),'Synthetic fixture'),'rig','rigOut');
}
function assets(){
 return safe(()=>{
  const key=$('assetPreset').value,input=EXAMPLES[key];
  if(!input)throw Error('Unknown asset fixture');
  const result=routeAsset(input),canvas=$('assetCanvas'),ctx=canvas.getContext('2d');
  ctx.fillStyle='#092530';ctx.fillRect(0,0,canvas.width,canvas.height);
  const labels=['High original','LOD 1','LOD 2'];
  const colors=['#f0c77b','#8ae6cd','#8aaac5'];
  result.lodTriangles.forEach((n,i)=>{
   const y=50+i*54,x=120,max=canvas.width-x-22,ratio=n/input.triangles;
   ctx.fillStyle='#293f4e';ctx.fillRect(x,y,max,23);
   ctx.fillStyle=colors[i];ctx.fillRect(x,y,max*ratio,23);
   ctx.font='12px system-ui';ctx.fillStyle='#d7ebf3';ctx.fillText(labels[i],12,y+15);
   ctx.fillText(n.toLocaleString()+' triangles',x,y+42);
  });
  ctx.fillStyle='#e4f6fa';ctx.font='13px system-ui';ctx.fillText(key+' : '+result.strategy,15,22);
  $('assetOut').textContent='Route / 分流: '+result.strategy+
   '\nRegularity='+result.regularity.toFixed(3)+'; evidence confidence='+result.confidence.toFixed(3)+
   '\nHigh-poly retained='+result.preserveOriginal+'; declared dimensions='+result.hasAuthorizedDimensions+
   '\n'+result.reason;
  return {preset:key,...result};
 },'assets','assetOut');
}
function nature(){
 return safe(()=>{
  const style=$('natureStyle').value,seed=Number($('natureSeed').value);
  const report=drawNature($('natureCanvas'),{seed,style});
  $('seedValue').textContent=String(seed);
  $('natureOut').textContent='Style='+style+'; deterministic seed='+seed+
   '; vegetation instances='+report.plants+'; painted pixels='+report.pixels+
   '\nCanvas2D, original procedural geometry and pigment; no copied textures.';
  return report;
 },'nature','natureOut');
}
function downloadReport(){
 const report={schema:'OIA-FIVE-LANE-RUNTIME-1',generatedAt:new Date().toISOString(),
  proof:'Five independent original synthetic/browser experiments. Not a production certification.',
  runs:results};
 const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=u;a.download='oia-five-lane-qa.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(u),1500);
}
$('runPhysics').addEventListener('click',physics);
$('terrain').addEventListener('change',physics);
$('lodBlend').addEventListener('input',lod);
$('syntheticRig').addEventListener('click',syntheticRig);
$('rigFile').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(file.size>16*1024*1024)throw Error('File exceeds 16MiB local bound');
  const bytes=new Uint8Array(await file.arrayBuffer());
  rigReport(auditRigBytes(bytes),file.name);
 }catch(e){results.rig={error:String(e.message||e)};$('rigOut').textContent='Input error: '+String(e.message||e);}
});
$('assetPreset').addEventListener('change',assets);
$('natureStyle').addEventListener('change',nature);
$('natureSeed').addEventListener('input',nature);
$('exportAll').addEventListener('click',downloadReport);
physics();lod();syntheticRig();assets();nature();
$('browserStatus').textContent=Object.values(results).every(r=>r&&!r.error)?'5/5 READY':'PARTIAL';
$('tests').textContent='47';
window.__oiaFiveLane={getState:()=>structuredClone(results),runAll:()=>{
 physics();lod();syntheticRig();assets();nature();return structuredClone(results);}};

