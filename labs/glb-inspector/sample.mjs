// Original GLB test fixture. Geometry is a handmade triangle, no third-party assets.
const align4=n=>(n+3)&~3;
export function demoGlb(){
  const positions=new Float32Array([-1,0,0,1,0,0,0,1.5,0]);
  const indices=new Uint16Array([0,1,2]);
  const bin=new Uint8Array(align4(positions.byteLength+indices.byteLength));
  bin.set(new Uint8Array(positions.buffer),0);
  bin.set(new Uint8Array(indices.buffer),positions.byteLength);
  const gltf={asset:{version:'2.0',generator:'Original Open Immersive Atlas demo'},
    scene:0,scenes:[{nodes:[0]}],nodes:[{name:'Original triangle',mesh:0}],
    meshes:[{primitives:[{attributes:{POSITION:0},indices:1,mode:4}]}],
    buffers:[{byteLength:positions.byteLength+indices.byteLength}],
    bufferViews:[{buffer:0,byteOffset:0,byteLength:positions.byteLength,target:34962},
      {buffer:0,byteOffset:positions.byteLength,byteLength:indices.byteLength,target:34963}],
    accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,0,0],max:[1,1.5,0]},
      {bufferView:1,componentType:5123,count:3,type:'SCALAR'}]};
  const raw=new TextEncoder().encode(JSON.stringify(gltf));
  const json=new Uint8Array(align4(raw.length)).fill(32);json.set(raw);
  const out=new Uint8Array(12+8+json.length+8+bin.length),v=new DataView(out.buffer);
  v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,out.length,true);
  v.setUint32(12,json.length,true);v.setUint32(16,0x4e4f534a,true);
  out.set(json,20);
  const b=20+json.length;v.setUint32(b,bin.length,true);v.setUint32(b+4,0x004e4942,true);out.set(bin,b+8);
  return out;
}
export const demoName='oia-original-triangle.glb';
