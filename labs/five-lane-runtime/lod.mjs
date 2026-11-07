// OIA Five-Lane Runtime 02: independent original shared-edge geomorph experiment.
export function height(x,z){
 if(!Number.isFinite(x)||!Number.isFinite(z))throw Error('Invalid world height');
 return .75*Math.sin(x*.61)*Math.cos(z*.53)+.22*Math.sin(x*1.4+z*.48)+.025*Math.cos(z*3.2);
}
export const clamp01=x=>Math.max(0,Math.min(1,x));
export function coarseHeight(x,z,step=1){
 if(!(step>0&&Number.isFinite(step)))throw Error('Invalid coarse step');
 const x0=Math.floor(x/step)*step,z0=Math.floor(z/step)*step;
 const tx=(x-x0)/step,tz=(z-z0)/step;
 const a=height(x0,z0),b=height(x0+step,z0),c=height(x0,z0+step),d=height(x0+step,z0+step);
 return a*(1-tx)*(1-tz)+b*tx*(1-tz)+c*(1-tx)*tz+d*tx*tz;
}
export function blendHeight(x,z,step,t){
 if(!Number.isFinite(t))throw Error('Invalid morph weight');
 const k=clamp01(t);
 return height(x,z)*(1-k)+coarseHeight(x,z,step)*k;
}
export function createPatch({x0=0,z0=0,size=8,segments=16,morph=.3,coarseStep=1,edgeStep=1,transitionWidth=.8}={}){
 if(![x0,z0,size,segments,morph,coarseStep,edgeStep,transitionWidth].every(Number.isFinite)
 ||size<=0||size>100||!Number.isInteger(segments)||segments<2||segments>256
 ||coarseStep<=0||edgeStep<=0||transitionWidth<=0)throw Error('Invalid LOD patch');
 const stride=segments+1,vertices=new Float64Array(stride*stride*3),indices=new Uint32Array(segments*segments*6);
 for(let j=0;j<=segments;j++)for(let i=0;i<=segments;i++){
  const u=i/segments,v=j/segments,x=x0+size*u,z=z0+size*v;
  const distanceToBoundary=size*Math.min(u,1-u,v,1-v);
  const seamWeight=clamp01(1-distanceToBoundary/transitionWidth);
  // Edge sample uses the *same world-coordinate grid* for both neighbours,
  // no matter which local segment density they use.
  const y=(1-seamWeight)*blendHeight(x,z,coarseStep,morph)+seamWeight*coarseHeight(x,z,edgeStep);
  vertices.set([x,y,z],(j*stride+i)*3);
 }
 let n=0;const id=(i,j)=>j*stride+i;
 for(let j=0;j<segments;j++)for(let i=0;i<segments;i++){
  const a=id(i,j),b=id(i+1,j),c=id(i,j+1),d=id(i+1,j+1);
  indices.set([a,c,b,b,c,d],n);n+=6;
 }
 return {x0,z0,size,segments,coarseStep,edgeStep,morph,vertices,indices,triangles:indices.length/3};
}
export function sampleVerticalEdge(patch,which,z){
 if(which!=='left'&&which!=='right')throw Error('Unknown edge');
 const t=Math.max(0,Math.min(1,(z-patch.z0)/patch.size))*patch.segments;
 const j=Math.min(patch.segments-1,Math.floor(t)),mix=t-j;
 const index=(row)=>((row*(patch.segments+1)+(which==='left'?0:patch.segments))*3)+1;
 return patch.vertices[index(j)]*(1-mix)+patch.vertices[index(j+1)]*mix;
}
export function seamError(left,right,checks=128){
 if(Math.abs(left.x0+left.size-right.x0)>1e-6||Math.abs(left.z0-right.z0)>1e-6||left.size!==right.size)
  throw Error('Patches are not adjacent on shared vertical edge');
 let maxError=0,sumError=0;
 for(let i=0;i<=checks;i++){
  const z=left.z0+left.size*i/checks;
  const err=Math.abs(sampleVerticalEdge(left,'right',z)-sampleVerticalEdge(right,'left',z));
  maxError=Math.max(err,maxError);sumError+=err;
 }
 return {maxErrorMeters:maxError,meanErrorMeters:sumError/(checks+1),checks:checks+1};
}
export function transitionError(patchOptions,morphA,morphB){
 const a=createPatch({...patchOptions,morph:morphA}),b=createPatch({...patchOptions,morph:morphB});
 let max=0;for(let i=1;i<a.vertices.length;i+=3)max=Math.max(max,Math.abs(a.vertices[i]-b.vertices[i]));
 return {maxVertexDeltaMeters:max,vertexCount:a.vertices.length/3};
}

