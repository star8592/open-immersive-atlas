import test from 'node:test';
import assert from 'node:assert/strict';
import {terrainHeight,groundNormal,footContact,walkSample,stanceDrift,rootPosition,smoothstep} from './terrain.mjs';
import {solveTwoBone,auditRig,syntheticRig,len} from './kinematics.mjs';
import {attackPhase,swordPose,TECHNIQUES,bladeMotion} from './combat.mjs';
import {decideEnemy,tickEnemy,deterministicTrace} from './tactics.mjs';
import {buildFrame,runAcceptance} from './acceptance.mjs';
import {createGroundVertices,createCharacterVertices} from './visual.mjs';
const near=(x,y,tol=1e-6)=>assert.ok(Math.abs(x-y)<=tol,String(x)+' != '+String(y));
test('world terrain flat is exactly zero',()=>near(terrainHeight(3,4,'flat'),0));
test('slope elevation increases with forward travel',()=>assert.ok(terrainHeight(0,2,'slope')>terrainHeight(0,-2,'slope')));
test('stair fixture has measurable discontinuities',()=>assert.notEqual(terrainHeight(0,-.01,'steps'),terrainHeight(0,.01,'steps')));
test('ground normals are unit length',()=>{for(const m of ['flat','slope','steps'])near(len(groundNormal(0,0,m)),1)});
test('invalid terrain query fails closed',()=>assert.throws(()=>terrainHeight(Infinity,2,'flat')));
test('smoothstep is clipped and deterministic',()=>{near(smoothstep(-1),0);near(smoothstep(2),1);near(smoothstep(.5),.5)});
test('root moves forward at declared speed',()=>near(rootPosition(3,.7)[2],2.1));
test('both feet alternate stance at first sample',()=>assert.notEqual(footContact(.05,'left').stance,footContact(.05,'right').stance));
test('foot trajectory never underground at swing',()=>{
 for(let i=0;i<=200;i++){const t=i/60;for(const side of ['left','right']){
 const foot=footContact(t,side,.7,'slope');assert.ok(foot.position[1]>=terrainHeight(foot.position[0],foot.position[2],'slope')+.064)}}
});
test('contact anchor does not follow moving root within a stance',()=>{
 const a=footContact(.1,'left'),b=footContact(.4,'left');
 assert.equal(a.cycleIndex,b.cycleIndex);assert.deepEqual(a.position,b.position);
});
test('planted-foot drift zero in flat and slope fixtures',()=>{
 for(const terrain of ['flat','slope','steps']){
 const samples=Array.from({length:225},(_,i)=>walkSample(i/60,{speed:.7,terrain}));
 for(const side of ['left','right']){
 const d=stanceDrift(samples,side);near(d.maxStepMeters,0);assert.ok(d.contactPairs>30);
 }}
});
test('IK left and right limb length preserved',()=>{
 const hip=[-.18,1.1,0],target=[-.18,.05,.2];
 const x=solveTwoBone(hip,target,{upper:.59,lower:.59});
 near(x.upperLength,.59);near(x.lowerLength,.59);assert.ok(x.poleProjection>0);
});
test('IK reaches feasible target within numerical tolerance',()=>{
 const x=solveTwoBone([0,1,0],[0,.1,.1]);
 near(x.reachErrorMeters,0);assert.equal(x.clamped,false);
});
test('IK clamps unreachable far target instead of extending knees backwards',()=>{
 const x=solveTwoBone([0,1,0],[0,-10,0]);
 assert.equal(x.clamped,true);assert.ok(x.reachErrorMeters>9);
 near(x.upperLength,.59);near(x.lowerLength,.59);assert.ok(x.poleProjection>0);
});
test('IK clamps physically impossible folded target',()=>{
 const x=solveTwoBone([0,0,0],[0,0,0],{upper:.70,lower:.45});
 assert.equal(x.clamped,true);near(x.upperLength,.70);near(x.lowerLength,.45);
});
test('IK pole parallel to target uses safe fallback',()=>{
 const x=solveTwoBone([0,1,0],[0,.1,0],{pole:[0,-1,0]});
 assert.ok(x.knee.every(Number.isFinite));assert.ok(x.poleProjection>0);
});
test('IK rejects degenerate bones',()=>assert.throws(()=>solveTwoBone([0,0,0],[0,0,1],{upper:0})));
test('semantic synthetic rig has valid hands and hips',()=>assert.equal(auditRig(syntheticRig()).valid,true));
test('semantic audit detects wrong left/right hip',()=>{
 const rig=syntheticRig();rig.joints.find(x=>x.name==='leftHip').position[0]=.4;
 assert.equal(auditRig(rig).valid,false);
});
test('semantic audit detects missing right wrist',()=>{
 const rig=syntheticRig();rig.joints=rig.joints.filter(x=>x.name!=='rightWrist');
 assert.ok(auditRig(rig).errors.some(x=>x.includes('rightWrist')));
});
test('sword phases have explicit active hit window',()=>{
 assert.equal(attackPhase(.10).stage,'anticipation');
 assert.equal(attackPhase(.40).stage,'active');
 assert.equal(attackPhase(.75).stage,'recovery');
 assert.equal(attackPhase(.95).stage,'guard');
});
test('all three sword techniques preserve wrist-hilt attachment',()=>{
 for(const t of TECHNIQUES)for(let i=0;i<100;i++){
  const p=swordPose([0,0,0],i/100,t);
  near(p.gripGapMeters,0);near(p.bladeLengthMeters,1.22);
  assert.ok(p.tip.every(Number.isFinite));
 }
});
test('three techniques produce genuinely distinct trajectories',()=>{
 const tips=TECHNIQUES.map(t=>swordPose([0,0,0],.46,t).tip.map(n=>n.toFixed(3)).join(':'));
 assert.equal(new Set(tips).size,3);
});
test('blade tracks travel and hit-active frames',()=>{
 const p=Array.from({length:80},(_,i)=>swordPose([0,0,0],i/80,'thrust'));
 const s=bladeMotion(p);assert.ok(s.distanceMeters>.2);assert.ok(s.activeFrames>0);
});
test('unrecognized sword technique fails closed',()=>assert.throws(()=>swordPose([0,0,0],.4,'spin-1000')));
test('AI approaches target from far away',()=>assert.equal(decideEnemy({distance:4,health:1}).action,'approach'));
test('AI chooses attack only in range and off cooldown',()=>assert.equal(decideEnemy({distance:1.2,health:1}).action,'strike'));
test('AI does not strike through cooldown',()=>assert.notEqual(decideEnemy({distance:1.2,health:1,cooldown:1}).action,'strike'));
test('AI protects critically wounded unit',()=>assert.equal(decideEnemy({distance:1.2,health:.1}).action,'retreat'));
test('AI searches for hidden target',()=>assert.equal(decideEnemy({distance:2,health:1,visible:false}).action,'search'));
test('AI refuses invalid world state',()=>assert.throws(()=>decideEnemy({distance:-1,health:1})));
test('AI ticks consume cooldown deterministically',()=>{
 const s=tickEnemy({action:'strike',cooldown:1},.2,{distance:1,health:1});
 near(s.cooldown,.8);assert.notEqual(s.action,'strike');
});
test('identical NPC event traces produce bytewise equal decisions',()=>{
 const events=[{dt:.1,world:{distance:4,health:1}},{dt:.1,world:{distance:1,health:1}}];
 assert.deepEqual(deterministicTrace(null,events),deterministicTrace(null,events));
});
test('frame builder gives finite analytical limb coordinates',()=>{
 for(const terrain of ['flat','slope','steps'])for(const t of [.01,.75,1.8,3.6]){
 const frame=buildFrame(t,{terrain,speed:.7});
 for(const leg of Object.values(frame.legs))assert.ok([...leg.hip,...leg.knee,...leg.ankle].every(Number.isFinite));
 }
});
test('WebGL2 ground geometry triangles and normals are finite',()=>{
 const g=createGroundVertices('steps');
 assert.equal(g.length/18,28*28*2);assert.ok(g.every(Number.isFinite));
});
test('3D rig build returns finite, non-empty geometric volumes',()=>{
 const frame=buildFrame(.4),blade=swordPose(frame.root,.4,'diagonal');
 const mesh=createCharacterVertices(frame,blade,decideEnemy({distance:1.2,health:1}));
 assert.ok(mesh.length>300);assert.equal(mesh.length%18,0);assert.ok(mesh.every(Number.isFinite));
});
test('six acceptance blocks pass on flat, slope and stair terrain',()=>{
 for(const terrain of ['flat','slope','steps']){
 const r=runAcceptance({terrain,speed:.7});
 assert.equal(r.total,6);assert.equal(r.passed,6,JSON.stringify({terrain,results:r.results}));
 }
});
test('self-test remains deterministic',()=>{
 assert.deepEqual(runAcceptance({samples:61}),runAcceptance({samples:61}));
});
