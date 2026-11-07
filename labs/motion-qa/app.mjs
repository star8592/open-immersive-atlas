import {buildFrame,runAcceptance} from './acceptance.mjs';
import {swordPose} from './combat.mjs';
import {decideEnemy,tickEnemy} from './tactics.mjs';
import {createDebugRenderer} from './visual.mjs';
const $=id=>document.getElementById(id);
const canvas=$('view'),state={terrain:'slope',speed:.7,technique:'thrust',
  time:.2,playing:true,health:.9,distance:2.2,visible:true,
  yaw:.6,pitch:1.05,cameraDistance:9,frames:0,renderError:null,stats:null,
  aiState:{action:'guard',cooldown:0},acceptance:null};
let renderer=null;
try{renderer=createDebugRenderer(canvas);}catch(e){state.renderError=String(e.message||e);}
function updateFields(){
 $('speed-value').textContent=state.speed.toFixed(2)+' m/s';
 $('time-value').textContent=state.time.toFixed(2)+' s';
 $('distance-value').textContent=state.distance.toFixed(1)+' m';
 $('health-value').textContent=Math.round(state.health*100)+'%';
 $('play').textContent=state.playing?'Pause / 暂停':'Play / 播放';
}
function on(id,event,fn){$(id).addEventListener(event,fn);}
for(const id of ['terrain','technique'])on(id,'change',()=>{state[id]=$(id).value;state.acceptance=null;$('report').textContent='Parameters changed; re-run audit / 参数已更改，请重新验收';$('export').disabled=true;});
for(const id of ['speed','distance','health'])on(id,'input',()=>{
 state[id]=Number($(id).value);updateFields();
 if(id==='speed'){state.acceptance=null;$('export').disabled=true;}
});
on('visible','change',()=>{state.visible=$('visible').checked;});
on('time','input',()=>{state.time=Number($('time').value);state.playing=false;updateFields();});
on('play','click',()=>{state.playing=!state.playing;updateFields();});
on('reset','click',()=>{
 state.time=.2;state.playing=true;state.aiState={action:'guard',cooldown:0};
 state.yaw=.6;state.pitch=1.05;state.cameraDistance=9;
 $('time').value=state.time;updateFields();
});
on('audit','click',()=>{
 try{
  state.acceptance=runAcceptance({speed:state.speed,terrain:state.terrain,
    technique:state.technique,samples:241});
  const r=state.acceptance;
  const lines=[
    'OIA MOTION QA / 动作质量实验',
    r.passed+'/'+r.total+' fixtures PASS / 本地夹具通过',
    'Terrain: '+r.fixture.terrain+' · Speed: '+r.fixture.speed.toFixed(2)+'m/s',
    'Rig handedness: '+(r.results.rigAudit.pass?'PASS':'FAIL'),
    'Planted foot drift: '+r.results.plantedFoot.maxStepDriftMeters.toFixed(6)+'m',
    'IK knee pole inversion: '+r.results.kneePole.invertedSamples,
    'Worst IK reach error: '+r.results.twoBone.worstTargetErrorMeters.toFixed(5)+'m',
    'IK clamped samples: '+r.results.twoBone.clampedLegSamples,
    'Grip gap: '+r.results.swordGrip.maxGapMeters.toFixed(7)+'m',
    'NPC decisions: '+r.results.tactics.actions.join(' → '),
    '',
    'Not an imported character or professional martial arts test. / 非真实模型或专业武术动作验收'
  ];
  $('report').textContent=lines.join('\n');
  $('drift').textContent=(r.results.plantedFoot.maxStepDriftMeters*100).toFixed(3)+' cm';
  $('export').disabled=false;
 }catch(e){$('report').textContent='QA failed: '+String(e.message||e);$('export').disabled=true;}
});
on('export','click',()=>{
 if(!state.acceptance)return;
 const data=JSON.stringify(state.acceptance,null,2);
 const blob=new Blob([data],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const link=document.createElement('a');link.href=url;link.download='oia-motion-qa-report.json';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});
let dragging=false,x0=0,y0=0;
canvas.addEventListener('pointerdown',e=>{dragging=true;x0=e.clientX;y0=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
 if(!dragging)return;
 const dx=e.clientX-x0,dy=e.clientY-y0;x0=e.clientX;y0=e.clientY;
 state.yaw+=dx*.007;state.pitch=Math.max(.30,Math.min(1.55,state.pitch+dy*.006));
});
canvas.addEventListener('pointerup',()=>{dragging=false;});
canvas.addEventListener('pointercancel',()=>{dragging=false;});
canvas.addEventListener('wheel',e=>{
 e.preventDefault();state.cameraDistance=Math.max(5,Math.min(16,state.cameraDistance+e.deltaY*.012));
},{passive:false});
let prev=0;
function loop(now){
 const dt=prev?Math.min(.05,Math.max(0,(now-prev)/1000)):0;prev=now;
 if(state.playing){
   state.time+=dt;
   if(state.time>3.9)state.time=0;
   $('time').value=state.time;
   state.aiState=tickEnemy(state.aiState,dt,{
     distance:state.distance,health:state.health,visible:state.visible});
 }else{
   const d=decideEnemy({distance:state.distance,health:state.health,
     visible:state.visible,cooldown:state.aiState.cooldown,previous:state.aiState.action});
   state.aiState.action=d.action;state.aiState.decision=d;
 }
 try{
  const frame=buildFrame(state.time,{speed:state.speed,terrain:state.terrain});
  const sword=swordPose(frame.root,(state.time*.9)%1,state.technique);
  const decision=state.aiState.decision||decideEnemy({distance:state.distance,
    health:state.health,visible:state.visible,cooldown:state.aiState.cooldown});
  if(renderer){state.stats=renderer.render(frame,sword,decision,{yaw:state.yaw,
    pitch:state.pitch,distance:state.cameraDistance});}
  const error=Math.max(frame.legs.left.reachErrorMeters,frame.legs.right.reachErrorMeters);
  if((state.frames++%9)===0){
    $('reach').textContent=(error*100).toFixed(2)+' cm';
    $('grip').textContent=(sword.gripGapMeters*100).toFixed(3)+' cm';
    $('attack').textContent=sword.stage+' / '+state.technique;
    $('npc').textContent=decision.action;
    $('decision').textContent=decision.ranked.slice(0,3).map(x=>
      x.action+': '+x.score.toFixed(3)).join(' · ');
    $('gpu').textContent=state.stats?.glError===0?'WebGL2 OK':
      (renderer?'WebGL error '+state.stats?.glError:'CPU only');
    $('state').textContent='Frames '+state.frames+' · 3D primitives '+(state.stats?.debugTriangles||0)+
      ' triangles · '+(state.terrain)+' · '+(state.playing?'playing':'paused');
    updateFields();
  }
 }catch(e){
  state.renderError=String(e.message||e);
  $('gpu').textContent='ERROR';
  $('state').textContent=state.renderError;
  state.playing=false;
 }
 requestAnimationFrame(loop);
}
window.__oiaMotionQA={
  getState:()=>({ready:!!renderer,frames:state.frames,playing:state.playing,
    terrain:state.terrain,speed:state.speed,technique:state.technique,time:state.time,
    ai:state.aiState.decision,stats:state.stats,renderError:state.renderError,
    acceptance:state.acceptance}),
  runAcceptance:(options)=>runAcceptance(options)
};
updateFields();requestAnimationFrame(loop);
