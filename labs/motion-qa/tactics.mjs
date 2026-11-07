// OIA Spatial Lab 04 — transparent, deterministic NPC utility AI + FSM.
// No machine learning, no combat engine, no online telemetry.
export function decideEnemy(situation){
  const {distance,health,cooldown=0,visible=true,previous='guard'}=situation||{};
  if(![distance,health,cooldown].every(Number.isFinite)||distance<0||health<0||health>1||cooldown<0)
    throw Error('Invalid NPC world state');
  const actions=['guard','approach','strike','retreat','search'];
  const utilities={
    guard:.16 + (cooldown>0?.19:0),
    approach:visible?Math.max(0,1-Math.abs(distance-1.6)/4)*.65:0,
    strike:visible&&distance<=1.8&&cooldown===0?.78 + .10*(1-health):0,
    retreat:distance<3?Math.max(0,(.47-health))*1.8 + (distance<.6?.12:0):0,
    search:visible?0:.72
  };
  // No strike on cooldown; force search when target not visible.
  if(!visible)utilities.strike=utilities.approach=0;
  if(health<.2&&visible&&distance<2.8)utilities.retreat=Math.max(utilities.retreat,.96);
  // Small hysteresis avoids rapid flip-flops between nearly equal choices.
  if(actions.includes(previous))utilities[previous]+= .025;
  const ranked=actions.map(action=>({action,score:utilities[action]}))
    .sort((a,b)=>b.score-a.score||actions.indexOf(a.action)-actions.indexOf(b.action));
  return {action:ranked[0].action,utilities,ranked,reason:ranked[0].score.toFixed(3)+
    ' > '+ranked[1].score.toFixed(3),inputs:{distance,health,cooldown,visible,previous}};
}
export function tickEnemy(state,dt,situation){
  if(!Number.isFinite(dt)||dt<0||dt>.5)throw Error('Invalid AI step');
  const remaining=Math.max(0,(state.cooldown||0)-dt);
  const decision=decideEnemy({...situation,cooldown:remaining,previous:state.action||'guard'});
  const cooldown=decision.action==='strike'?1.2:remaining;
  return {action:decision.action,cooldown,score:decision.utilities[decision.action],decision};
}
export function deterministicTrace(initial,events){
  let state={action:'guard',cooldown:0},time=0;
  const rows=[];
  for(const event of events){
    state=tickEnemy(state,event.dt,event.world);
    time+=event.dt;
    rows.push({time,action:state.action,cooldown:state.cooldown,utilities:state.decision.utilities});
  }
  return rows;
}
