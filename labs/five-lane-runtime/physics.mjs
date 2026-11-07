// OIA Five-Lane Runtime 01: bounded 2.5D kinematic contact and A*.
// Original educational implementation, NOT a Rapier physics replacement.
const MODES=['flat','slope','steep','stairs','hills'];
export function terrainY(x,z,mode='hills'){
 if(!Number.isFinite(x)||!Number.isFinite(z)||!MODES.includes(mode))throw Error('Invalid terrain query');
 if(mode==='flat')return 0;
 if(mode==='slope')return Math.tan(22*Math.PI/180)*z;
 if(mode==='steep')return Math.tan(55*Math.PI/180)*z;
 if(mode==='stairs')return .22*Math.floor(Math.max(0,z+2)/1);
 return .38*Math.sin(x*.47)*Math.cos(z*.32)+.08*Math.sin(z*.9);
}
export function terrainNormal(x,z,mode='hills'){
 const e=.01,dx=(terrainY(x+e,z,mode)-terrainY(x-e,z,mode))/(2*e);
 const dz=(terrainY(x,z+e,mode)-terrainY(x,z-e,mode))/(2*e);
 const n=Math.hypot(dx,1,dz);
 return [-dx/n,1/n,-dz/n];
}
export function circleRect(x,z,r,rect){
 if(!Array.isArray(rect)||rect.length!==4||!rect.every(Number.isFinite)||rect[0]>rect[2]||rect[1]>rect[3])
  throw Error('Invalid obstacle');
 const cx=Math.max(rect[0],Math.min(x,rect[2])),cz=Math.max(rect[1],Math.min(z,rect[3]));
 return (x-cx)**2+(z-cz)**2<r*r;
}
export function sweepCharacter(start,move,{mode='hills',radius=.28,stepHeight=.26,maxSlopeDeg=35,obstacles=[]}={}){
 if(!start||!move||![start.x,start.z,move.x,move.z,radius,stepHeight,maxSlopeDeg].every(Number.isFinite)
 ||radius<=0||radius>2||stepHeight<0||maxSlopeDeg<0||maxSlopeDeg>89||!Array.isArray(obstacles))
 throw Error('Invalid controller input');
 const distance=Math.hypot(move.x,move.z);
 if(distance>12)throw Error('Controller move exceeds bounded fixture');
 const iterations=Math.max(1,Math.ceil(distance/Math.min(.085,radius*.3)));
 let x=start.x,z=start.z,blocked=0,wallContacts=0,groundY=terrainY(x,z,mode);
 const walkable=(nx,nz,oldY)=>{
  const nextY=terrainY(nx,nz,mode);
  if(obstacles.some(o=>circleRect(nx,nz,radius,o))) {wallContacts++;return false;}
  if(nextY-oldY>stepHeight+1e-7)return false;
  const normal=terrainNormal(nx,nz,mode);
  const slope=Math.acos(Math.max(-1,Math.min(1,normal[1])))*180/Math.PI;
  if(mode!=='stairs'&&slope>maxSlopeDeg+1e-7)return false;
  return true;
 };
 for(let i=0;i<iterations;i++){
  const dx=move.x/iterations,dz=move.z/iterations;
  const targetX=x+dx,targetZ=z+dz;
  if(walkable(targetX,targetZ,groundY)){x=targetX;z=targetZ;groundY=terrainY(x,z,mode);continue;}
  blocked++;
  // Resolve one axis at a time, bounding side-slip by requested displacement.
  if(walkable(targetX,z,groundY)){x=targetX;groundY=terrainY(x,z,mode);}
  if(walkable(x,targetZ,groundY)){z=targetZ;groundY=terrainY(x,z,mode);}
 }
 return {x,z,y:groundY,grounded:true,blockedSteps:blocked,wallContacts,
   iterations,requestedDistance:distance,movedDistance:Math.hypot(x-start.x,z-start.z)};
}
export function planGridPath(start,goal,{width=12,height=12,blocked=[]}={}){
 const integer=x=>Number.isInteger(x);
 if(![width,height,start?.x,start?.z,goal?.x,goal?.z].every(integer)||width<1||height<1||width*height>10000
 ||!Array.isArray(blocked)||blocked.length>10000)throw Error('Invalid navigation grid');
 const valid=(x,z)=>x>=0&&z>=0&&x<width&&z<height;
 if(!valid(start.x,start.z)||!valid(goal.x,goal.z))throw Error('Start or goal outside grid');
 const key=(x,z)=>x+':'+z,forbidden=new Set(blocked.map(p=>key(p.x,p.z)));
 if(forbidden.has(key(start.x,start.z))||forbidden.has(key(goal.x,goal.z)))return {reachable:false,path:[],expanded:0};
 const open=[{x:start.x,z:start.z,g:0,f:Math.abs(start.x-goal.x)+Math.abs(start.z-goal.z)}];
 const best=new Map([[key(start.x,start.z),0]]),parent=new Map(),closed=new Set();
 let expanded=0;
 while(open.length){
  open.sort((a,b)=>a.f-b.f||a.g-b.g||a.z-b.z||a.x-b.x);
  const n=open.shift(),k=key(n.x,n.z);
  if(closed.has(k))continue;
  closed.add(k);expanded++;
  if(n.x===goal.x&&n.z===goal.z){
   const path=[{x:n.x,z:n.z}];let cursor=k;
   while(parent.has(cursor)){const p=parent.get(cursor);path.push({x:p.x,z:p.z});cursor=key(p.x,p.z);}
   path.reverse();return {reachable:true,path,expanded,cost:path.length-1};
  }
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=n.x+dx,z=n.z+dz,nk=key(x,z),g=n.g+1;
   if(!valid(x,z)||forbidden.has(nk)||closed.has(nk)||g>=(best.get(nk)??Infinity))continue;
   best.set(nk,g);parent.set(nk,{x:n.x,z:n.z});
   open.push({x,z,g,f:g+Math.abs(x-goal.x)+Math.abs(z-goal.z)});
  }
 }
 return {reachable:false,path:[],expanded};
}

