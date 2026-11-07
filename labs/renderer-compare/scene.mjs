// OIA Spatial Lab 03 — shared original geometry and camera for both APIs.
// No dependencies, source meshes or imported third-party shaders.
export const VERSION = 'oia-web3d-compare-1';
export function elevation(x,z) {
  return 1.8*Math.sin(x*.12)*Math.cos(z*.10)
    + .38*Math.sin(x*.35+z*.28)
    - .8*Math.exp(-(x*x+z*z)/90);
}
export function createGrid(segments=96,extent=38) {
  if(!Number.isInteger(segments)||segments<8||segments>256)throw Error('segments must be 8..256');
  const stride=6, n=(segments+1)**2;
  const vertices=new Float32Array(n*stride);
  const indices=new Uint32Array(segments*segments*6);
  const eps=.025;
  for(let j=0;j<=segments;j++)for(let i=0;i<=segments;i++){
    const x=extent*(i/segments-.5),z=extent*(j/segments-.5),y=elevation(x,z);
    const dx=elevation(x-eps,z)-elevation(x+eps,z);
    const dz=elevation(x,z-eps)-elevation(x,z+eps);
    const inv=1/Math.hypot(dx,2*eps,dz);
    const o=(j*(segments+1)+i)*stride;
    vertices.set([x,y,z,dx*inv,2*eps*inv,dz*inv],o);
  }
  let o=0;const id=(i,j)=>j*(segments+1)+i;
  for(let j=0;j<segments;j++)for(let i=0;i<segments;i++){
    const a=id(i,j),b=id(i+1,j),c=id(i,j+1),d=id(i+1,j+1);
    indices.set([a,c,b,b,c,d],o);o+=6;
  }
  return{segments,extent,vertices,indices,triangles:indices.length/3,vertexCount:n,
    vertexBytes:vertices.byteLength,indexBytes:indices.byteLength};
}
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const norm=a=>{const len=Math.max(1e-8,Math.hypot(...a));return a.map(x=>x/len);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
export function lookAt(eye,target) {
  const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,
    -dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
}
export function perspective(fovRadians,aspect,near=.1,far=120){
  if(!(aspect>0&&near>0&&far>near))throw Error('invalid projection');
  const f=1/Math.tan(fovRadians/2);
  return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,
    0,0,2*far*near/(near-far),0]);
}
export function multiply4(a,b) {
  const out=new Float32Array(16);
  for(let col=0;col<4;col++)for(let row=0;row<4;row++){
    out[col*4+row]=a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];
  }
  return out;
}
export function cameraFrame(yaw=.6,pitch=.95,distance=32,aspect=1) {
  const target=[0,0,0],eye=[distance*Math.sin(pitch)*Math.sin(yaw),
    distance*Math.cos(pitch)+2,
    distance*Math.sin(pitch)*Math.cos(yaw)];
  return{eye,viewProjection:multiply4(perspective(53*Math.PI/180,aspect),lookAt(eye,target))};
}
export function percentile(values,p=.95){
  if(!values.length)return 0;
  const arr=[...values].sort((a,b)=>a-b),i=Math.max(0,Math.min(arr.length-1,Math.ceil(p*arr.length)-1));
  return arr[i];
}
export function sampleSummary(values){
  return{count:values.length,p50Ms:percentile(values,.5),p95Ms:percentile(values,.95)};
}
