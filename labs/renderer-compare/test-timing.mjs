import test from 'node:test';
import assert from 'node:assert/strict';
import {nanosecondsToMs,elapsedNanosecondsToMs,timingSummary} from './timing.mjs';
test('WebGPU 64-bit nanosecond delta maps to milliseconds',()=>{
  assert.equal(nanosecondsToMs(1000000000000n,1000350000000n),350);
  assert.equal(nanosecondsToMs(10n,1000010n),1);
  assert.equal(nanosecondsToMs(1000n,1000n),0);
});
test('Reject wraparound, reverse time, impossible spans or mixed numeric types',()=>{
  assert.equal(nanosecondsToMs(9n,4n),null);
  assert.equal(nanosecondsToMs(0n,60000000001n),null);
  assert.equal(nanosecondsToMs(3n,10000000),null);
  assert.equal(nanosecondsToMs(-3,200),1e-6*203);
});
test('WebGL2 elapsed nanoseconds validate finite nonnegative and bounded values',()=>{
  assert.equal(elapsedNanosecondsToMs(1000000),1);
  assert.equal(elapsedNanosecondsToMs(250000),.25);
  for(const n of [-1,NaN,Infinity,-Infinity,'2000',6e10+1])
    assert.equal(elapsedNanosecondsToMs(n),null);
});
test('A missing timer sample is unambiguously unavailable, not 0 ms',()=>{
  const r=timingSummary([],24);
  assert.deepEqual(r,{collected:0,requested:24,p50Ms:null,p95Ms:null,units:'ms',
    quantity:'GPU render pass elapsed',validation:'unavailable'});
});
test('Percentiles of valid GPU samples never include rejected results',()=>{
  const r=timingSummary([.3,NaN,Infinity,-2,.8,1.2,.5,null],4);
  assert.equal(r.collected,4);assert.equal(r.validation,'complete');
  assert.equal(r.p50Ms,.5);assert.equal(r.p95Ms,1.2);
});
test('Partial sampling is explicitly marked partial',()=>{
  const r=timingSummary([.2,.6],24);
  assert.equal(r.validation,'partial');assert.equal(r.collected,2);
});
test('Max accepted WebGPU nanosecond span is 60 seconds',()=>{
  assert.equal(nanosecondsToMs(2n,60000000002n),60000);
  assert.equal(elapsedNanosecondsToMs(60000000000),60000);
});
