// OIA Five-Lane Runtime 04: evidence-aware original geometry process router.
// Does not reconstruct any mesh; explicitly refuses to invent missing dimensions.
const featureNames=['triangles','planarity','cylindricity','symmetry','deformable','hasDimensions','silhouetteRisk'];
export const EXAMPLES={
 bracket:{triangles:920000,planarity:.88,cylindricity:.74,symmetry:.82,deformable:false,hasDimensions:true,silhouetteRisk:.30},
 ambiguousGear:{triangles:560000,planarity:.32,cylindricity:.9,symmetry:.95,deformable:false,hasDimensions:false,silhouetteRisk:.65},
 cloth:{triangles:170000,planarity:.12,cylindricity:.04,symmetry:.34,deformable:true,hasDimensions:false,silhouetteRisk:.7},
 rock:{triangles:260000,planarity:.15,cylindricity:.09,symmetry:.10,deformable:false,hasDimensions:false,silhouetteRisk:.3}
};
export function routeAsset(f){
 if(!f||!Number.isSafeInteger(f.triangles)||f.triangles<=0||f.triangles>1e8
 ||typeof f.deformable!=='boolean'||typeof f.hasDimensions!=='boolean'
 ||['planarity','cylindricity','symmetry','silhouetteRisk'].some(k=>!Number.isFinite(f[k])||f[k]<0||f[k]>1))
 throw Error('Invalid asset features');
 const regularity=.42*f.planarity+.28*f.cylindricity+.30*f.symmetry;
 let strategy,confidence,reason;
 if(f.deformable){strategy='topology-aware-retopology';confidence=.85;reason='Deformable joints must preserve skinning loops';}
 else if(regularity>=.68&&f.hasDimensions){
  strategy='parametric-reconstruction';confidence=.75+.2*regularity;
  reason='Planar/cylindrical evidence and authoritative dimensions support reconstruction';
 }else if(regularity>=.56&&!f.hasDimensions){
  strategy='needs-dimensional-evidence';confidence=.90;
  reason='Regular geometry detected but hole, shaft and plate dimensions are not declared';
 }else{
  strategy='error-bounded-simplification';confidence=.75;
  reason='Irregular geometry: keep high-poly original and protect silhouette/UV/material boundaries';
 }
 const ratios=f.silhouetteRisk>.65?[1,.75,.52]:[1,.52,.23];
 const lodTriangles=ratios.map(r=>Math.max(32,Math.round(f.triangles*r)));
 return {schema:'OIA-asset-router-1',strategy,confidence,regularity,reason,
  originalTriangles:f.triangles,lodTriangles,
  preserveOriginal:true,hasAuthorizedDimensions:f.hasDimensions,
  requirements:['Keep immutable high-poly source','Run official glTF Validator independently',
   'Compare fixed-camera silhouettes/normal maps','Check skeletons and colliders separately'],
  warning:'Classification is a synthetic heuristic; no geometry is generated and no real user asset is evaluated'};
}
export function evaluateLOD(original,optimized,{silhouetteError=.02,holeError=0,riggingPreserved=true}={}){
 if(!Number.isSafeInteger(original)||!Number.isSafeInteger(optimized)||original<=0||optimized<=0||
 optimized>original||![silhouetteError,holeError].every(Number.isFinite)||silhouetteError<0||holeError<0||
 typeof riggingPreserved!=='boolean')throw Error('Invalid LOD comparison');
 const removed=1-optimized/original;
 const accepted=silhouetteError<=.04&&holeError<=.001&&riggingPreserved;
 return {triangleReductionRatio:removed,accepted,
  rejectedReasons:[...(silhouetteError>.04?['Silhouette exceeds error bound']:[]),
   ...(holeError>.001?['Critical manufactured feature moved']:[]),
   ...(!riggingPreserved?['Rig deformation contract failed']:[])]};
}

