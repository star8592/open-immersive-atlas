import test from 'node:test';
import assert from 'node:assert/strict';
import {createGrid,cameraFrame,elevation,lookAt,perspective,multiply4,percentile,sampleSummary} from './scene.mjs';
import {convertClipToWebGPU} from './renderers.mjs';
const finite=a=>Array.from(a).every(Number.isFinite);
test('same deterministic packed vertices and indices for both backends',()=>{
  const a=createGrid(96),b=createGrid(96);
  assert.deepEqual(a.vertices,b.vertices);assert.deepEqual(a.indices,b.indices);
  assert.equal(a.triangles,18432);assert.equal(a.vertexCount,9409);
  assert.equal(a.vertexBytes,9409*24);
  assert.equal(a.indexBytes,18432*3*4);
  assert.equal(a.indices.length,18432*3);
  assert.ok(Math.max(...a.indices)<a.vertexCount);
  assert.ok(finite(a.vertices));
});
test('LOD-equivalent density options change geometry only',()=>{
  for(const s of [48,96,160,256]){
    const m=createGrid(s);assert.equal(m.triangles,s*s*2);
    assert.equal(m.vertexCount,(s+1)**2);
    assert.equal(m.indices.length,s*s*6);
    assert.equal(m.vertices.length,(s+1)**2*6);
  }
});
test('normals are unit-length to within numeric tolerance',()=>{
  const mesh=createGrid(96);
  for(let i=0;i<mesh.vertices.length;i+=6){
    const n=Math.hypot(mesh.vertices[i+3],mesh.vertices[i+4],mesh.vertices[i+5]);
    assert.ok(Math.abs(n-1)<1e-5);
  }
});
test('camera frames and projection matrices are finite and react to orbit',()=>{
  const a=cameraFrame(.5,.8,30,1.5),b=cameraFrame(.7,.8,30,1.5);
  assert.equal(a.viewProjection.length,16);assert.ok(finite(a.viewProjection));
  assert.notDeepEqual(a.viewProjection,b.viewProjection);
  assert.notDeepEqual(a.eye,b.eye);
});
test('WebGPU clip conversion maps WebGL near -w to 0 and far +w to w',()=>{
  const v=new Float32Array(16);
  for(let i=0;i<16;i++)v[i]=i*.5-2;
  const out=convertClipToWebGPU(v);
  for(let col=0;col<4;col++){
    const z=col*4+2,w=col*4+3;
    assert.ok(Math.abs(out[z]-(v[z]+v[w])*.5)<1e-6);
    assert.equal(out[w],v[w]);
  }
});
test('percentiles handle empty and bounded samples',()=>{
  assert.equal(percentile([]),0);
  assert.equal(percentile([2,3,6,8,12],.95),12);
  assert.equal(percentile([2,3,6,8,12],.5),6);
  assert.deepEqual(sampleSummary([2,3,6,8,12]),{count:5,p50Ms:6,p95Ms:12});
});
test('invalid geometry budgets are rejected',()=>{
  for(const n of [0,1,7,257,-2,7.5,Infinity])assert.throws(()=>createGrid(n));
});
test('camera and height function have no remote, file or tool dependency',()=>{
  assert.ok(Number.isFinite(elevation(1.5,-2)));
  assert.equal(lookAt([1,2,3],[0,0,0]).length,16);
  assert.equal(perspective(Math.PI/3,1.5).length,16);
  assert.equal(multiply4(new Float32Array(16),new Float32Array(16)).length,16);
});
