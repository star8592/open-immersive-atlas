// OIA Lab 04 — cross-component deterministic acceptance in metre-scale world units.
import {walkSample,stanceDrift,TERRAIN_TYPES} from './terrain.mjs';
import {solveTwoBone,auditRig,syntheticRig,add} from './kinematics.mjs';
import {swordPose,bladeMotion,TECHNIQUES} from './combat.mjs';
import {deterministicTrace} from './tactics.mjs';
export function buildFrame(time,{speed=.7,terrain='flat'}={}){
  const frame=walkSample(time,{speed,terrain}),legs={};
  for(const side of ['left','right']){
    const lateral=side==='left'?-.18:.18;
    const hip=add(frame.pelvis,[lateral,0,0]);
    legs[side]=solveTwoBone(hip,frame.feet[side].position,{upper:.59,lower:.59,pole:[0,0,1]});
  }
  return {...frame,legs};
}
export function runAcceptance({speed=.7,terrain='flat',technique='thrust',samples=241}={}){
  if(!TERRAIN_TYPES.includes(terrain)||!TECHNIQUES.includes(technique)||
     !Number.isInteger(samples)||samples<24||samples>1200)
    throw Error('Invalid QA fixture');
  const frames=[],poses=[],issues=[];
  let worstLegError=0,worstGripGap=0,kneeInversionCount=0,clampedFrames=0;
  for(let i=0;i<samples;i++){
    const time=i/60,frame=buildFrame(time,{speed,terrain}),sword=swordPose(frame.root,time%1,technique);
    frames.push(frame);poses.push(sword);
    worstGripGap=Math.max(worstGripGap,sword.gripGapMeters);
    for(const side of ['left','right']){
      const leg=frame.legs[side];
      worstLegError=Math.max(worstLegError,leg.reachErrorMeters);
      if(leg.clamped)clampedFrames++;
      if(!(leg.poleProjection>0))kneeInversionCount++;
      if(![...leg.hip,...leg.knee,...leg.ankle].every(Number.isFinite))
        issues.push('Nonfinite '+side+' leg pose');
    }
  }
  const driftLeft=stanceDrift(frames,'left'),driftRight=stanceDrift(frames,'right');
  const maxPlantedStepDriftMeters=Math.max(driftLeft.maxStepMeters,driftRight.maxStepMeters);
  const motion=bladeMotion(poses);
  const rig=auditRig(syntheticRig());
  const npcTrace=deterministicTrace({action:'guard',cooldown:0},[
    {dt:.1,world:{distance:4,health:1,visible:true}},
    {dt:.1,world:{distance:1.2,health:1,visible:true}},
    {dt:.1,world:{distance:1.2,health:.15,visible:true}},
    {dt:.1,world:{distance:4,health:.8,visible:false}}
  ]);
  const results={
    rigAudit:{pass:rig.valid,errors:rig.errors},
    plantedFoot:{pass:maxPlantedStepDriftMeters<=.001,
      maxStepDriftMeters:maxPlantedStepDriftMeters,contactPairs:driftLeft.contactPairs+driftRight.contactPairs},
    kneePole:{pass:kneeInversionCount===0,invertedSamples:kneeInversionCount},
    twoBone:{pass:Number.isFinite(worstLegError)&&worstLegError<.2,
      worstTargetErrorMeters:worstLegError,clampedLegSamples:clampedFrames},
    swordGrip:{pass:worstGripGap<1e-8,maxGapMeters:worstGripGap,
      activeFrames:motion.activeFrames,tipTravelMeters:motion.distanceMeters},
    tactics:{pass:npcTrace[0].action==='approach'&&npcTrace[1].action==='strike'&&
      npcTrace[2].action==='retreat'&&npcTrace[3].action==='search',
      actions:npcTrace.map(x=>x.action)}
  };
  const passed=Object.values(results).filter(x=>x.pass).length;
  return {schema:'OIA-MOTION-QA-1',version:'2026-11-07',fixture:{speed,terrain,technique,samples,
    worldUnits:'metres',worldAxes:'+X right,+Y up,+Z forward',
    testDurationSeconds:(samples-1)/60},
    passed,total:Object.keys(results).length,results,issues,
    limitations:[
      'Synthetic procedural bones and analytic IK only; not an imported human rig or licensed mocap.',
      'Stance drift is measured between sampled contact poses, not independent walking-foot video quality.',
      'IK leg target may clamp when unreachable; clipping against a real 3D mesh is not tested.',
      'Sword hilt is deliberately attached to semantic wrist; grip success alone does not prove natural sword technique.',
      'NPC utility rules are a fixed toy decision fixture, not human-quality tactical AI.',
      'Browser screenshot appearance, collision/animation integration and hardware GPU cost need separate testing.'
    ]};
}
