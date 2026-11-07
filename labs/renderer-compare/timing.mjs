// Open Immersive Atlas — GPU timing normalization and evidence-quality helpers.
// WebGPU timestamp queries and WebGL EXT_disjoint_timer_query_webgl2 report nanoseconds.
// Convert only nonnegative finite spans; do not fabricate unavailable GPU timings.
export function nanosecondsToMs(start,end) {
  if(typeof start==='bigint' && typeof end==='bigint') {
    if(end<start || end-start>60000000000n) return null;
    return Number(end-start)/1000000;
  }
  if(typeof start==='number' && typeof end==='number') {
    if(!Number.isFinite(start)||!Number.isFinite(end)||end<start||end-start>6e10) return null;
    return (end-start)/1000000;
  }
  return null;
}
export function elapsedNanosecondsToMs(ns){
  return typeof ns==='number' && Number.isFinite(ns) && ns>=0 && ns<=6e10 ? ns/1e6 : null;
}
export function timingSummary(values,requested=24) {
  const clean=values.filter(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0);
  const sorted=[...clean].sort((a,b)=>a-b);
  const at=p=>sorted.length?sorted[Math.min(sorted.length-1,Math.ceil(p*sorted.length)-1)]:null;
  return {
    collected:clean.length,
    requested,
    p50Ms:at(.5),
    p95Ms:at(.95),
    units:'ms',
    quantity:'GPU render pass elapsed',
    validation:clean.length===requested?'complete':clean.length?'partial':'unavailable'
  };
}
