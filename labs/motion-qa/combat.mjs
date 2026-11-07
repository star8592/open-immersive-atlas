// OIA Lab 04 — three original, timed sword-gesture fixtures.
// Intentionally a procedural choreography/trajectory debugger, not real martial arts mocap.
import {add,sub,len,normalize,scale} from './kinematics.mjs';
export const TECHNIQUES=Object.freeze(['thrust','diagonal','parry']);
const ease=t=>{const q=Math.max(0,Math.min(1,t));return q*q*(3-2*q);};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
export function attackPhase(t){
  if(!Number.isFinite(t)||t<0)throw Error('Invalid attack time');
  const phase=t%1;
  const name=phase<.22?'anticipation':phase<.52?'active':phase<.84?'recovery':'guard';
  return {phase,stage:name,active:name==='active',
    normalizedActiveProgress:phase<.22?0:phase>=.52?1:(phase-.22)/.30};
}
export function swordPose(root,t,technique='thrust'){
  if(!TECHNIQUES.includes(technique)||root.length!==3||!root.every(Number.isFinite))
    throw Error('Invalid sword pose');
  const {phase,stage,active,normalizedActiveProgress}=attackPhase(t);
  const extension=ease(normalizedActiveProgress);
  // Coordinates relative to physical root. The hilt is *always* the wrist grip.
  let wrist=[.40,1.37,.37],aim=[0,1,1];
  if(technique==='thrust'){
    wrist=[.40,1.38,.28+.46*extension];
    aim=[-.06,.28,1];
  }else if(technique==='diagonal'){
    wrist=[.42,1.40,.4+.10*extension];
    aim=mix([-.72,.92,.48],[.85,-.70,.57],extension);
  }else{
    wrist=[.43,1.39,.28+.15*extension];
    aim=mix([.65,.85,.26],[-.66,.91,.42],extension);
  }
  if(stage==='recovery'){
    const r=ease((phase-.52)/.32);
    wrist=mix(wrist,[.40,1.37,.37],r);
    aim=mix(aim,[.12,.85,.6],r);
  }
  if(stage==='guard'){
    wrist=[.40,1.37,.37];aim=[.12,.85,.6];
  }
  const hilt=add(root,wrist),tip=add(hilt,scale(normalize(aim),1.22));
  // A short cross-guard is perpendicular to the blade, but the main
  // blade/hilt connection is the wrist's semantic socket.
  const guardA=add(hilt,[-.15,0,0]),guardB=add(hilt,[.15,0,0]);
  const shoulder=add(root,[.33,1.7,.03]);
  const elbow=add(root,[.55,1.47,.17+.12*extension]);
  return {technique,stage,phase,active,hilt,wrist:hilt,tip,guardA,guardB,
    rightShoulder:shoulder,rightElbow:elbow,
    gripGapMeters:len(sub(hilt,add(root,wrist))),bladeLengthMeters:len(sub(tip,hilt)),
    hitWindow:[.22,.52]};
}
export function bladeMotion(samples){
  if(!Array.isArray(samples)||samples.length===0)return{distanceMeters:0,activeFrames:0};
  let path=0,activeFrames=0;
  for(let i=0;i<samples.length;i++){
    if(samples[i].active)activeFrames++;
    if(i)path+=len(sub(samples[i].tip,samples[i-1].tip));
  }
  return {distanceMeters:path,activeFrames};
}
