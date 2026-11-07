// OIA Five-Lane Runtime 05: original deterministic CPU painterly nature study.
// These are 2D pixel/foliage techniques, not a production PBR or water simulation.
function fract(x){return x-Math.floor(x);}
export function hash(x,y,seed=1){return fract(Math.sin(x*127.1+y*311.7+seed*79.13)*43758.5453123);}
export const clamp=x=>Math.max(0,Math.min(1,x));
export function noise(x,y,seed=1){
 const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;
 const s=t=>t*t*(3-2*t),a=hash(ix,iy,seed),b=hash(ix+1,iy,seed);
 const c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);
 const k=s(u),l=s(v);return (a*(1-k)+b*k)*(1-l)+(c*(1-k)+d*k)*l;
}
export function fbm(x,y,seed=1){
 let total=0,amp=.5,frequency=1,norm=0;
 for(let i=0;i<4;i++){total+=amp*noise(x*frequency,y*frequency,seed+i*13);norm+=amp;amp*=.5;frequency*=2;}
 return total/norm;
}
export function pigment(x,y,{seed=7,style='watercolor',distance=.4}={}){
 if(!['natural','watercolor','ink'].includes(style)||!Number.isFinite(distance)||!Number.isFinite(seed))
 throw Error('Invalid painter style');
 const d=clamp(distance),n=fbm(x*.045,y*.035,seed),fine=noise(x*.4,y*.4,seed+45)-.5;
 const wash=style==='watercolor'?(n-.5)*48+fine*10:style==='ink'?(n-.5)*65:(n-.5)*19;
 const base=style==='ink'?[57,68,69]:style==='watercolor'?[74,128,99]:[63,119,78];
 const sky=[169,187,193],fog=d*.63;
 return base.map((c,i)=>Math.round(Math.max(0,Math.min(255,c+wash*(i===1?.65:1.1)+(sky[i]-c)*fog))));
}
function prng(seed){let n=seed>>>0;return()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};}
export function vegetation(seed=7,count=90){
 if(!Number.isSafeInteger(seed)||count<1||count>5000||!Number.isInteger(count))throw Error('Invalid vegetation fixture');
 const rand=prng(seed),plants=[];
 for(let i=0;i<count;i++){
  const cluster=Math.floor(rand()*7);
  const cx=(cluster*67.9+13)%400,cy=85+((cluster*31.4)%85);
  const x=cx+(rand()-.5)*115,y=cy+(rand()-.5)*48;
  const height=9+rand()*36,lean=(rand()-.5)*12;
  plants.push({x,y,height,lean,type:rand()>.78?'tree':'bush'});
 }
 return plants;
}
export function drawNature(canvas,{seed=7,style='watercolor'}={}){
 const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('2D canvas unavailable');
 const W=canvas.width,H=canvas.height;
 const bg=ctx.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,style==='ink'?'#e0e4dc':'#a9cadd');
 bg.addColorStop(.62,style==='ink'?'#bbc6b9':'#b6cab5');
 bg.addColorStop(1,'#395d50');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const ridge=(t,layer)=>{
  const y0=H*(.42+layer*.12);
  return y0+H*.08*Math.sin(t*7+layer*.8)+H*.03*Math.sin(t*26+layer*2.7);
 };
 for(let layer=0;layer<3;layer++){
  ctx.beginPath();ctx.moveTo(0,H);
  for(let x=0;x<=W;x+=3)ctx.lineTo(x,ridge(x/W,layer));
  ctx.lineTo(W,H);ctx.closePath();
  ctx.fillStyle=layer===0?'#9eb7b0':layer===1?'#648c7c':'#3c6b5b';ctx.fill();
 }
 const img=ctx.getImageData(0,0,W,H),data=img.data;
 for(let y=Math.floor(H*.5);y<H;y++)for(let x=0;x<W;x++){
  const k=(y*W+x)*4;
  const n=noise(x*.21,y*.21,seed)-.5;
  const wash=style==='watercolor'?n*34:style==='ink'?n*50:n*11;
  for(let c=0;c<3;c++)data[k+c]=Math.max(0,Math.min(255,data[k+c]+wash));
 }
 ctx.putImageData(img,0,0);
 const plants=vegetation(seed,105);
 for(const plant of plants){
  const x=(plant.x/400)*W,y=(plant.y/200)*H+H*.25;
  if(y<0||y>H)continue;
  const scale=Math.max(.45,y/H),h=plant.height*scale;
  ctx.strokeStyle=style==='ink'?'#34423d':'#344e3e';ctx.lineWidth=Math.max(1,1.5*scale);
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+plant.lean*scale,y-h);ctx.stroke();
  ctx.fillStyle=style==='ink'?'#3a4841':style==='watercolor'?'#658878':'#427b52';
  ctx.beginPath();ctx.ellipse(x+plant.lean*scale,y-h,h*.32,h*.42,plant.lean*.01,0,Math.PI*2);ctx.fill();
 }
 return {schema:'OIA-nature-1',seed,style,plants:plants.length,pixels:W*H,
  limitation:'Synthetic 2D watercolor/pigment study; no true volumetric foliage or production GPU pass'};
}

