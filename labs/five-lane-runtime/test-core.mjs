import test from 'node:test';
import assert from 'node:assert/strict';
import {terrainY,terrainNormal,circleRect,sweepCharacter,planGridPath} from './physics.mjs';
import {height,coarseHeight,blendHeight,createPatch,seamError,transitionError} from './lod.mjs';
import {auditRigDocument,auditRigBytes,syntheticHumanoid} from './rig.mjs';
import {routeAsset,evaluateLOD,EXAMPLES} from './assets.mjs';
import {hash,noise,fbm,pigment,vegetation} from './nature.mjs';
const close=(x,y,e=1e-7)=>assert.ok(Math.abs(x-y)<=e,String(x)+' != '+String(y));
test('physics flat ground',()=>close(terrainY(8,9,'flat'),0));
test('terrain slope and steep gradient',()=>assert.ok(terrainY(0,2,'steep')>terrainY(0,2,'slope')));
test('ground normal unit length',()=>close(Math.hypot(...terrainNormal(.2,.8,'hills')),1));
test('circle AABB intersection near boundary',()=>{assert.ok(circleRect(.92,0,.2,[1,-1,2,1]));assert.equal(circleRect(0,0,.2,[1,-1,2,1]),false);});
test('swept-substep controller does not tunnel through wall',()=>{
 const s=sweepCharacter({x:0,z:0},{x:4,z:0},{mode:'flat',obstacles:[[1,-1,1.2,1]]});
 assert.ok(s.x<.73);assert.ok(s.wallContacts>0);assert.ok(s.blockedSteps>0);
});
test('controller traverses acceptable 22-degree slope',()=>{
 const s=sweepCharacter({x:0,z:0},{x:0,z:2},{mode:'slope',maxSlopeDeg:35});
 close(s.z,2,1e-5);close(s.y,terrainY(0,2,'slope'),1e-5);
});
test('controller rejects 55-degree slope',()=>{
 const s=sweepCharacter({x:0,z:0},{x:0,z:2},{mode:'steep',maxSlopeDeg:35});
 close(s.z,0);
});
test('controller auto-steps 22cm stair with 26cm limit',()=>{
 const s=sweepCharacter({x:0,z:-2.5},{x:0,z:2.7},{mode:'stairs',stepHeight:.26});
 assert.ok(s.z>.15);assert.ok(s.y>.22);
});
test('controller rejects too-high stair',()=>{
 const s=sweepCharacter({x:0,z:-2.5},{x:0,z:2.7},{mode:'stairs',stepHeight:.1});
 assert.ok(s.z<-1);assert.equal(s.y,0);assert.ok(s.blockedSteps>0);
});
test('controller rejects invalid unbounded displacement',()=>assert.throws(()=>sweepCharacter({x:0,z:0},{x:30,z:0})));
test('A* shortest unblocked 5x5 path length 8',()=>{
 const p=planGridPath({x:0,z:0},{x:4,z:4},{width:5,height:5});
 assert.equal(p.reachable,true);assert.equal(p.cost,8);assert.deepEqual(p.path[0],{x:0,z:0});
});
test('A* navigates barrier via opening',()=>{
 const blocked=[0,1,2,3].map(z=>({x:2,z}));
 const p=planGridPath({x:0,z:0},{x:4,z:0},{width:5,height:5,blocked});
 assert.ok(p.reachable);assert.ok(p.cost>4);assert.ok(p.path.some(q=>q.z===4));
});
test('A* returns unreachable for full barrier',()=>{
 const blocked=[0,1,2,3,4].map(z=>({x:2,z}));
 assert.equal(planGridPath({x:0,z:0},{x:4,z:0},{width:5,height:5,blocked}).reachable,false);
});
test('controller motion replay is deterministic',()=>{
 const a=sweepCharacter({x:0,z:0},{x:1,z:3},{mode:'hills'});
 assert.deepEqual(a,sweepCharacter({x:0,z:0},{x:1,z:3},{mode:'hills'}));
});
test('LOD heightfield and interpolated samples finite',()=>assert.ok([height(2,3),coarseHeight(2.2,3.2,1),blendHeight(2,3,1,.6)].every(Number.isFinite)));
test('LOD parent sampler matches exact global grid nodes',()=>close(coarseHeight(2,3,1),height(2,3)));
test('LOD morph endpoints are well defined',()=>{
 close(blendHeight(2.3,4.8,1,0),height(2.3,4.8));
 close(blendHeight(2.3,4.8,1,1),coarseHeight(2.3,4.8,1));
});
test('LOD patch mesh triangle budget and valid indices',()=>{
 const p=createPatch({segments:16});
 assert.equal(p.triangles,512);assert.equal(p.vertices.length,17*17*3);assert.equal(p.indices.length,512*3);
});
test('LOD unequal-density neighbour patch edges coincide continuously',()=>{
 const a=createPatch({x0:-8,z0:0,size:8,segments:16,edgeStep:1,morph:.12});
 const b=createPatch({x0:0,z0:0,size:8,segments:8,edgeStep:1,morph:.92});
 const e=seamError(a,b,256);assert.ok(e.maxErrorMeters<1e-8,JSON.stringify(e));
});
test('LOD temporal morph does not jump for small weight changes',()=>{
 const err=transitionError({segments:16,coarseStep:1},.4,.401);
 assert.ok(err.maxVertexDeltaMeters<.01);
});
test('LOD rejects nonadjacent patches',()=>{
 const a=createPatch({x0:-8}),b=createPatch({x0:9});
 assert.throws(()=>seamError(a,b));
});
test('LOD rejects nonfinite blend',()=>assert.throws(()=>blendHeight(1,2,1,NaN)));
test('rig synthetic semantic bone mapping covers all required joints',()=>{
 const r=auditRigDocument(syntheticHumanoid());
 assert.equal(r.ok,true);assert.equal(r.mapped,r.required);assert.equal(r.jointCount,10);
});
test('rig detects negative determinant / mirrored right hand',()=>{
 const d=syntheticHumanoid();d.nodes[9].scale=[-1,1,1];
 const r=auditRigDocument(d);assert.ok(r.flags.some(x=>x.includes('Mirrored joint 9')));
});
test('rig distinguishes unskinned scene from a verified humanoid',()=>{
 const r=auditRigDocument({nodes:[{name:'Hips'}]});assert.equal(r.ok,false);
 assert.ok(r.warnings.some(x=>x.includes('No skin')));
});
test('rig discovers missing wrist without making up joints',()=>{
 const d=syntheticHumanoid();d.nodes[9].name='unknownJoint';
 const r=auditRigDocument(d);assert.equal(r.mapped,9);
 assert.ok(r.warnings.some(x=>x.includes('rightWrist')));
});
test('rig hierarchical world-space node origin is composed correctly',()=>{
 const d=syntheticHumanoid();d.nodes[0].children=[1];d.nodes[1].translation=[-.2,-.1,0];
 const r=auditRigDocument(d);close(r.joints.leftHip.position[1],1.1);
});
test('rig reports invalid node cycle',()=>{
 const d=syntheticHumanoid();d.nodes[0].children=[1];d.nodes[1].children=[0];
 const r=auditRigDocument(d);assert.ok(r.errors.some(x=>x.includes('cycle')));
});
test('rig accepts offline glTF JSON bytes',()=>{
 const bytes=new TextEncoder().encode(JSON.stringify(syntheticHumanoid()));
 assert.equal(auditRigBytes(bytes).mapped,10);
});
test('rig accepts GLB v2 with first JSON chunk',()=>{
 const raw=new TextEncoder().encode(JSON.stringify(syntheticHumanoid()));
 const pad=(raw.length+3)&~3,b=new Uint8Array(20+pad).fill(32),dv=new DataView(b.buffer);
 dv.setUint32(0,0x46546c67,true);dv.setUint32(4,2,true);dv.setUint32(8,b.length,true);
 dv.setUint32(12,pad,true);dv.setUint32(16,0x4e4f534a,true);b.set(raw,20);
 assert.equal(auditRigBytes(b).mapped,10);
});
test('rig GLB fails invalid length and refuses oversized files',()=>{
 const raw=new Uint8Array(20),d=new DataView(raw.buffer);d.setUint32(0,0x46546c67,true);
 d.setUint32(4,2,true);d.setUint32(8,100,true);assert.throws(()=>auditRigBytes(raw));
 assert.throws(()=>auditRigBytes(new Uint8Array(16*1024*1024+1)));
});
test('asset bracket routes to dimension-evidenced parametric reconstruction',()=>{
 assert.equal(routeAsset(EXAMPLES.bracket).strategy,'parametric-reconstruction');
});
test('asset ambiguous manufactured part refuses invented dimensions',()=>{
 assert.equal(routeAsset(EXAMPLES.ambiguousGear).strategy,'needs-dimensional-evidence');
});
test('asset cloth routes to topology-aware retopology',()=>{
 assert.equal(routeAsset(EXAMPLES.cloth).strategy,'topology-aware-retopology');
});
test('asset rock routes to error bounded simplification',()=>{
 assert.equal(routeAsset(EXAMPLES.rock).strategy,'error-bounded-simplification');
});
test('asset always retains high-poly and ordered LOD tiers',()=>{
 for(const item of Object.values(EXAMPLES)){
 const o=routeAsset(item);assert.ok(o.preserveOriginal);assert.equal(o.lodTriangles[0],item.triangles);
 assert.ok(o.lodTriangles[1]<=o.lodTriangles[0]&&o.lodTriangles[2]<=o.lodTriangles[1]);
 }
});
test('asset rejects hole-damaging simplification despite reduction',()=>{
 const a=evaluateLOD(900000,60000,{silhouetteError:.01,holeError:.02});
 assert.equal(a.accepted,false);assert.ok(a.rejectedReasons.some(x=>x.includes('Critical')));
});
test('asset rejects lost rig deformation',()=>assert.equal(evaluateLOD(1000,200,{riggingPreserved:false}).accepted,false));
test('asset accepts low-error geometry only as numerical fixture',()=>assert.equal(evaluateLOD(10000,2500,{silhouetteError:.01,holeError:0}).accepted,true));
test('asset refuses invalid out-of-range confidence inputs',()=>assert.throws(()=>routeAsset({...EXAMPLES.rock,planarity:1.5})));
test('nature hashes are deterministic and bounded',()=>{close(hash(2,4,7),hash(2,4,7));assert.ok(hash(2,4,7)>=0&&hash(2,4,7)<1);});
test('nature fractional noise continuous at grid boundary',()=>{
 assert.ok(Math.abs(noise(.9999,1.2,4)-noise(1.0001,1.2,4))<.01);
});
test('nature multiple noise octaves remain bounded',()=>{for(let i=0;i<50;i++)assert.ok(fbm(i*.1,i*.3,13)>=0&&fbm(i*.1,i*.3,13)<=1)});
test('nature three styles have bounded and distinct pigment',()=>{
 const arr=['natural','watercolor','ink'].map(style=>pigment(23,67,{style,seed:7}));
 assert.equal(new Set(arr.map(x=>x.join(','))).size,3);
 arr.forEach(c=>assert.ok(c.every(x=>Number.isInteger(x)&&x>=0&&x<=255)));
});
test('nature increasing distance blends toward atmospheric sky color',()=>{
 const near=pigment(12,8,{style:'natural',distance:0}),far=pigment(12,8,{style:'natural',distance:1});
 const sky=[169,187,193],distance=a=>a.reduce((n,v,i)=>n+Math.abs(v-sky[i]),0);
 assert.ok(distance(far)<distance(near));
});
test('nature vegetation random seeds give reproducible non-grid distribution',()=>{
 const a=vegetation(12,100),b=vegetation(12,100);assert.deepEqual(a,b);
 assert.ok(new Set(a.map(x=>x.x.toFixed(2))).size>90);
});
test('nature rejects invalid style/seed/count',()=>{
 assert.throws(()=>pigment(1,2,{style:'unknown'}));assert.throws(()=>vegetation(1,6000));
});

