// OIA Five-Lane Runtime 03: local-only glTF/GLB semantic rig preflight.
// Does not decrypt, fetch external buffers, apply skin deformation or certify rigs.
const LIMIT=16*1024*1024;
function glbObject(bytes){
 if(bytes.byteLength>LIMIT)throw Error('Input exceeds 16 MiB rig-check limit');
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 const dv=new DataView(b.buffer,b.byteOffset,b.byteLength);
 if(b.byteLength>=12&&dv.getUint32(0,true)===0x46546c67){
  if(dv.getUint32(4,true)!==2||dv.getUint32(8,true)!==b.byteLength)
   throw Error('Invalid GLB v2 header');
  if(b.byteLength<20)throw Error('Truncated GLB JSON');
  const n=dv.getUint32(12,true),t=dv.getUint32(16,true);
  if(t!==0x4e4f534a||n%4||20+n>b.byteLength||n>LIMIT)throw Error('Invalid first GLB JSON chunk');
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b.subarray(20,20+n)).trim());
 }
 return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b));
}
const canon=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/^mixamorig/,'');
const MATCH={
 pelvis:['hips','pelvis','roothips'],
 leftHip:['leftupleg','leftthigh','lthigh'],leftKnee:['leftleg','leftshin','lshin'],
 leftAnkle:['leftfoot','leftankle','lfoot'],
 rightHip:['rightupleg','rightthigh','rthigh'],rightKnee:['rightleg','rightshin','rshin'],
 rightAnkle:['rightfoot','rightankle','rfoot'],
 rightShoulder:['rightarm','rightupperarm','rupperarm'],rightElbow:['rightforearm','rightlowerarm','rforearm'],
 rightWrist:['righthand','rightwrist','rhand']
};
function qrotate(q,v){
 const [x,y,z,w]=q;const u=[x,y,z];
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const uv=cross(u,v),uuv=cross(u,uv);
 return v.map((n,i)=>n+2*(w*uv[i]+uuv[i]));
}
function localTransform(node){
 if(node.matrix){
  if(!Array.isArray(node.matrix)||node.matrix.length!==16||!node.matrix.every(Number.isFinite))
   throw Error('Invalid node matrix');
  const m=node.matrix;
  return {origin:[m[12],m[13],m[14]],axes:[[m[0],m[1],m[2]],[m[4],m[5],m[6]],[m[8],m[9],m[10]]]};
 }
 const t=node.translation||[0,0,0],s=node.scale||[1,1,1],q=node.rotation||[0,0,0,1];
 if(t.length!==3||s.length!==3||q.length!==4||![...t,...s,...q].every(Number.isFinite))
  throw Error('Invalid node TRS');
 const norm=Math.hypot(...q);if(norm<1e-8)throw Error('Invalid rotation quaternion');
 const unit=q.map(v=>v/norm);
 return {origin:t,axes:[[s[0],0,0],[0,s[1],0],[0,0,s[2]]].map(v=>qrotate(unit,v))};
}
const apply=(m,v)=>m.origin.map((n,i)=>n+v.reduce((acc,a,k)=>acc+a*m.axes[k][i],0));
const compose=(a,b)=>({origin:apply(a,b.origin),axes:b.axes.map(v=>
 a.axes[0].map((_,i)=>a.axes[0][i]*v[0]+a.axes[1][i]*v[1]+a.axes[2][i]*v[2]))});
export function auditRigDocument(doc){
 if(!doc||typeof doc!=='object'||!Array.isArray(doc.nodes))throw Error('Missing glTF nodes');
 if(doc.nodes.length>10000)throw Error('Too many nodes');
 const nodes=doc.nodes,skins=Array.isArray(doc.skins)?doc.skins:[];
 const errors=[],warnings=[],parents=new Array(nodes.length).fill(-1);
 nodes.forEach((n,i)=>{
  if(!n||typeof n!=='object'){errors.push('Invalid node '+i);return;}
  if(n.children!==undefined&&!Array.isArray(n.children)){errors.push('Invalid children at '+i);return;}
  for(const child of n.children||[]){
   if(!Number.isInteger(child)||child<0||child>=nodes.length){errors.push('Invalid node reference '+child);continue;}
   if(parents[child]!==-1)errors.push('Duplicate parent '+child);
   parents[child]=i;
  }
 });
 const transforms=[],visiting=new Set();
 function world(i){
  if(transforms[i])return transforms[i];
  if(visiting.has(i))throw Error('Node hierarchy cycle');
  visiting.add(i);
  const loc=localTransform(nodes[i]);transforms[i]=parents[i]<0?loc:compose(world(parents[i]),loc);
  visiting.delete(i);return transforms[i];
 }
 try{for(let i=0;i<nodes.length;i++)world(i);}catch(e){errors.push(e.message);}
 const skin=skins[0],indices=Array.isArray(skin?.joints)?skin.joints:[];
 if(!indices.length)warnings.push('No skin joints: cannot certify a skinned humanoid');
 const joints={},flags=[];
 for(const [semantic,aliases] of Object.entries(MATCH)){
  const candidates=indices.filter(i=>Number.isInteger(i)&&i>=0&&i<nodes.length&&aliases.includes(canon(nodes[i]?.name)));
  if(candidates.length===1&&transforms[candidates[0]])joints[semantic]={node:candidates[0],name:nodes[candidates[0]]?.name,position:transforms[candidates[0]].origin};
  else if(candidates.length>1)errors.push('Ambiguous semantic joint '+semantic);
  else warnings.push('Unmapped '+semantic);
 }
 indices.forEach(i=>{
  if(!Number.isInteger(i)||i<0||i>=nodes.length){errors.push('Out-of-range joint '+i);return;}
  const m=transforms[i];if(!m)return;
  const a=m.axes;
  const determinant=a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])
    -a[1][0]*(a[0][1]*a[2][2]-a[0][2]*a[2][1])
    +a[2][0]*(a[0][1]*a[1][2]-a[0][2]*a[1][1]);
  if(Math.abs(determinant)<1e-8)errors.push('Degenerate transform on joint '+i);
  if(determinant<0)flags.push('Mirrored joint '+i+' (inspect handedness)');
 });
 if(joints.leftHip&&joints.rightHip){
  const dx=joints.rightHip.position[0]-joints.leftHip.position[0];
  if(dx<0)flags.push('Hip X ordering reversed in current world axes; verify facing/axes');
 }
 return {schema:'OIA-rig-preflight-1',skinCount:skins.length,jointCount:indices.length,
   mapped:Object.keys(joints).length,required:Object.keys(MATCH).length,joints,
   errors,warnings,flags,ok:errors.length===0&&indices.length>0,
   limitation:'Name-based single-skin preflight only; no inverse bind matrix/deformation validation or imported animation QA'};
}
export function auditRigBytes(bytes){return auditRigDocument(glbObject(bytes));}
export function syntheticHumanoid(){
 const names=['Hips','LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot',
   'RightArm','RightForeArm','RightHand'];
 const coords=[[0,1.2,0],[-.2,1.1,0],[-.2,.6,.1],[-.2,.1,0],
   [.2,1.1,0],[.2,.6,.1],[.2,.1,0],[.38,1.7,0],[.47,1.4,.16],[.49,1.2,.3]];
 return {asset:{version:'2.0'},nodes:names.map((name,i)=>({name,translation:coords[i]})),
 skins:[{joints:names.map((_,i)=>i)}]};
}

