// OIA Lab 04 — original analytical two-segment limb solver and rig audits.
// World convention: +Y up, +Z forward, +X right, metres.
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const scale=(a,s)=>a.map(v=>v*s);
export const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const len=a=>Math.hypot(...a);
export function normalize(a){
  const L=len(a);
  if(L<1e-9)throw Error('Zero-length direction');
  return scale(a,1/L);
}
export function solveTwoBone(hip,target,{upper=.59,lower=.59,pole=[0,0,1]}={}){
  if(![...hip,...target,upper,lower,...pole].every(Number.isFinite) ||
    upper<=0||lower<=0)throw Error('Invalid IK input');
  const delta=sub(target,hip),distance=len(delta);
  const direction=distance<1e-8?[0,-1,0]:scale(delta,1/distance);
  // Avoid hyperextension and exact singularity. Preserve physical segment lengths.
  const maxReach=(upper+lower)*.998;
  const minReach=Math.abs(upper-lower)+.002;
  const clamped=Math.max(minReach,Math.min(maxReach,distance));
  const ankle=add(hip,scale(direction,clamped));
  const along=(upper*upper-lower*lower+clamped*clamped)/(2*clamped);
  const kneeHeight=Math.sqrt(Math.max(0,upper*upper-along*along));
  let perpendicular=sub(pole,scale(direction,dot(pole,direction)));
  if(len(perpendicular)<1e-7) {
    perpendicular=sub([1,0,0],scale(direction,dot([1,0,0],direction)));
    if(len(perpendicular)<1e-7)perpendicular=cross(direction,[0,1,0]);
  }
  const knee=add(add(hip,scale(direction,along)),scale(normalize(perpendicular),kneeHeight));
  const error=len(sub(target,ankle));
  return {hip,knee,ankle,target,requestedDistance:distance,achievedDistance:clamped,
    reachErrorMeters:error,clamped:Math.abs(distance-clamped)>1e-7,
    upperLength:len(sub(knee,hip)),lowerLength:len(sub(ankle,knee)),
    poleProjection:dot(sub(knee,add(hip,scale(direction,along))),normalize(perpendicular))};
}
export function auditRig(definition){
  if(!Array.isArray(definition?.joints))throw Error('Expected joint definitions');
  const errors=[],jointMap=new Map(),required=['pelvis','leftHip','leftKnee','leftAnkle',
    'rightHip','rightKnee','rightAnkle','rightShoulder','rightElbow','rightWrist'];
  for(const j of definition.joints){
    if(!j||typeof j.name!=='string'||!Array.isArray(j.position)||j.position.length!==3||
      !j.position.every(Number.isFinite)){errors.push('Invalid joint data');continue;}
    if(jointMap.has(j.name))errors.push('Duplicate joint '+j.name);
    jointMap.set(j.name,j.position);
  }
  for(const name of required)if(!jointMap.has(name))errors.push('Missing semantic joint '+name);
  if(jointMap.has('leftHip')&&jointMap.has('rightHip')){
    const left=jointMap.get('leftHip'),right=jointMap.get('rightHip');
    if(!(left[0]<right[0]))errors.push('Left/right hip handedness inverted (+X must be right)');
  }
  for(const side of ['left','right']){
    const hip=jointMap.get(side+'Hip'),knee=jointMap.get(side+'Knee'),
      ankle=jointMap.get(side+'Ankle');
    if(hip&&knee&&ankle){
      if(!(hip[1]>knee[1]&&knee[1]>ankle[1]))errors.push(side+' leg y order invalid');
      if(len(sub(hip,knee))<.05||len(sub(knee,ankle))<.05)errors.push(side+' degenerate limb');
    }
  }
  const wrist=jointMap.get('rightWrist'),shoulder=jointMap.get('rightShoulder');
  if(wrist&&shoulder&&len(sub(wrist,shoulder))<.1)errors.push('Invalid right arm length');
  return {valid:errors.length===0,errors,jointCount:jointMap.size,handedness:'+X right, +Y up, +Z forward'};
}
export function syntheticRig(){
  return {joints:[
    {name:'pelvis',position:[0,1.1,0]},
    {name:'leftHip',position:[-.18,1.1,0]},
    {name:'leftKnee',position:[-.18,.58,.1]},
    {name:'leftAnkle',position:[-.18,.08,0]},
    {name:'rightHip',position:[.18,1.1,0]},
    {name:'rightKnee',position:[.18,.58,.1]},
    {name:'rightAnkle',position:[.18,.08,0]},
    {name:'rightShoulder',position:[.31,1.68,0]},
    {name:'rightElbow',position:[.42,1.41,.18]},
    {name:'rightWrist',position:[.44,1.25,.35]}
  ]};
}
