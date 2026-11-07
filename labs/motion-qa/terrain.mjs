// OIA Spatial Lab 04 — deterministic terrain and walk-cycle grounding fixture.
// This is a deliberate educational rig, not a general character controller.
export const TERRAIN_TYPES=Object.freeze(['flat','slope','steps']);
export function terrainHeight(x,z,type='flat'){
  if(!Number.isFinite(x)||!Number.isFinite(z)||!TERRAIN_TYPES.includes(type))
    throw Error('Invalid terrain query');
  if(type==='slope')return .10*z+.025*Math.sin(x*1.2);
  if(type==='steps')return .10*Math.floor((z+2.4)/1.2);
  return 0;
}
export function groundNormal(x,z,type='flat'){
  const e=.005,dx=(terrainHeight(x+e,z,type)-terrainHeight(x-e,z,type))/(2*e);
  const dz=(terrainHeight(x,z+e,type)-terrainHeight(x,z-e,type))/(2*e);
  const q=Math.hypot(dx,1,dz);
  return [-dx/q,1/q,-dz/q];
}
export const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
export const smoothstep=t=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
export function footContact(time,side,speed=0.7,terrain='flat'){
  if(!Number.isFinite(time)||time<0||!Number.isFinite(speed)||speed<0||speed>1.5)
    throw Error('Invalid locomotion sample');
  if(side!=='left'&&side!=='right')throw Error('Invalid foot side');
  const offset=side==='left'?0:.5,period=1.08,stanceFraction=.62;
  const cycle=time/period+offset,index=Math.floor(cycle),phase=cycle-index;
  const x=side==='left'?-0.18:.18;
  // Contact anchors are derived from cycle boundaries, not the moving pelvis.
  const anchorZ=index*speed*period-offset*speed*period+.31*speed*period;
  const nextZ=anchorZ+speed*period;
  const stance=phase<stanceFraction||speed===0;
  const swingU=clamp((phase-stanceFraction)/(1-stanceFraction),0,1);
  const z=stance?anchorZ:anchorZ+(nextZ-anchorZ)*smoothstep(swingU);
  const y=terrainHeight(x,z,terrain)+.065+(stance?0:.19*Math.sin(Math.PI*swingU));
  return {position:[x,y,z],stance,phase,cycleIndex:index,anchor:[x,terrainHeight(x,anchorZ,terrain)+.065,anchorZ],speed};
}
export function rootPosition(time,speed=0.7,terrain='flat'){
  const z=time*speed,ground=terrainHeight(0,z,terrain);
  return [0,ground,z];
}
export function walkSample(time,{speed=.7,terrain='flat'}={}){
  if(!Number.isFinite(time)||time<0)throw Error('Invalid time');
  const root=rootPosition(time,speed,terrain);
  const bob=speed>0?.012*Math.sin(time/1.08*4*Math.PI):0;
  const pelvis=[root[0],root[1]+1.095+bob,root[2]];
  const feet={left:footContact(time,'left',speed,terrain),
    right:footContact(time,'right',speed,terrain)};
  return {time,speed,terrain,root,pelvis,feet};
}
// Measure world-space planted-foot displacement, ignoring swing samples.
export function stanceDrift(samples,side){
  let previous=null,max=0,events=0;
  for(const s of samples){
    const foot=s.feet[side];
    if(foot?.stance){
      if(previous&&previous.cycleIndex===foot.cycleIndex){
        const a=foot.position,b=previous.position;
        max=Math.max(max,Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]));
        events++;
      }
      previous=foot;
    }else previous=null;
  }
  return {maxStepMeters:max,contactPairs:events};
}
