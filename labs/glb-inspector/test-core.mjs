import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectModel,MAX_BYTES} from './core.mjs';
import {demoGlb,demoName} from './sample.mjs';
const json=obj=>new TextEncoder().encode(JSON.stringify(obj));
const base=()=>({asset:{version:'2.0'},scene:0,scenes:[{nodes:[0]}],
  nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0}}]}],
  buffers:[{byteLength:36,uri:'sample.bin'}],
  bufferViews:[{buffer:0,byteOffset:0,byteLength:36}],
  accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3',min:[-1,0,0],max:[1,1,0]}]});
const codes=r=>r.issues.map(i=>i.code);
test('original GLB has a valid 2.0 header and readable stats',()=>{
  const r=inspectModel(demoGlb(),demoName);
  assert.equal(r.format,'GLB');assert.equal(r.status,'basic-ok');
  assert.equal(r.stats.meshes,1);assert.equal(r.stats.triangles,1);
  assert.equal(r.stats.vertices,3);assert.equal(r.counts.errors,0);
  assert.deepEqual(r.bounds.min,[-1,0,0]);assert.deepEqual(r.bounds.max,[1,1.5,0]);
});
test('reject truncated GLB and mismatched header length',()=>{
  assert.throws(()=>inspectModel(demoGlb().subarray(0,9),'t.glb'),{code:'TRUNCATED'});
});
test('reject wrong GLB version',()=>{
  const b=demoGlb();new DataView(b.buffer).setUint32(4,1,true);
  assert.throws(()=>inspectModel(b,'t.glb'),{code:'VERSION'});
});
test('reject declared GLB length mismatch',()=>{
  const b=demoGlb();new DataView(b.buffer).setUint32(8,b.length+4,true);
  assert.throws(()=>inspectModel(b,'t.glb'),{code:'LENGTH'});
});
test('reject invalid binary chunk bounds',()=>{
  const b=demoGlb();new DataView(b.buffer).setUint32(12,0xfffffffc,true);
  assert.throws(()=>inspectModel(b,'t.glb'),{code:'CHUNK_BOUNDS'});
});
test('detect invalid bufferView boundary',()=>{
  const d=base();d.bufferViews[0].byteLength=120;
  const r=inspectModel(json(d),'x.gltf');
  assert.ok(codes(r).includes('VIEW_BOUNDS'));assert.ok(r.counts.errors>0);
});
test('detect out-of-bounds accessor',()=>{
  const d=base();d.accessors[0].count=5;
  const r=inspectModel(json(d),'x.gltf');
  assert.ok(codes(r).includes('ACCESSOR_BOUNDS'));
});
test('external URI is never fetched, but explicitly warned',()=>{
  const d=base();d.buffers[0].uri='https://example.invalid/private.bin';
  const r=inspectModel(json(d),'x.gltf');
  assert.equal(r.stats.externalBuffers,1);assert.ok(codes(r).includes('EXTERNAL'));
});
test('warn non-unit quaternion',()=>{
  const d=base();d.nodes[0].rotation=[0,0,0,2];
  const r=inspectModel(json(d),'x.gltf');
  assert.ok(codes(r).includes('QUATERNION'));
});
test('detect node cycles',()=>{
  const d=base();d.nodes[0].children=[1];d.nodes.push({children:[0]});
  const r=inspectModel(json(d),'x.gltf');
  assert.ok(codes(r).includes('CYCLE'));
});
test('reject matrix plus TRS',()=>{
  const d=base();d.nodes[0].matrix=Array.from({length:16},(_,i)=>i%5===0?1:0);d.nodes[0].translation=[0,0,0];
  const r=inspectModel(json(d),'x.gltf');
  assert.ok(codes(r).includes('MATRIX_TRS'));
});
test('decode base64 buffer and compare declared lengths',()=>{
  const d=base();d.buffers[0].uri='data:application/octet-stream;base64,AAAAAA==';
  const r=inspectModel(json(d),'x.gltf');
  assert.ok(codes(r).includes('BUFFER_MISMATCH'));
});
test('flag unsupported Draco contents without claiming geometry validated',()=>{
  const d=base();d.meshes[0].primitives[0].extensions={KHR_draco_mesh_compression:{bufferView:0,attributes:{POSITION:0}}};
  const r=inspectModel(json(d),'x.gltf');
  assert.equal(r.stats.dracoPrimitives,1);assert.ok(codes(r).includes('DRACO'));
});
test('missing external files are not requested by the module',()=>{
  const d=base();d.buffers[0].uri='file:///sensitive/local.bin';
  const r=inspectModel(json(d),'x.gltf');
  assert.ok(codes(r).includes('EXTERNAL'));
});
test('size cap is enforced before JSON parsing',()=>{
  assert.throws(()=>inspectModel(new Uint8Array(MAX_BYTES+1),'huge.glb'),{code:'SIZE'});
});
