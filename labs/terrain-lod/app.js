// Open Immersive Atlas: original, dependency-free WebGL2 spatial study.
const canvas=document.getElementById('scene'),error=document.getElementById('error');
const status=document.getElementById('renderStatus'),mode=document.getElementById('mode');
const wire=document.getElementById('wireframe'),fog=document.getElementById('fog'),rocks=document.getElementById('rocks');
const fps=document.getElementById('fps'),p95=document.getElementById('p95');
const trianglesEl=document.getElementById('triangles'),lodsEl=document.getElementById('lods');
const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,depth:true});
function fail(message){error.hidden=false;error.textContent=message;status.textContent='UNAVAILABLE';}
if(!gl){fail('WebGL2 unavailable / 当前浏览器没有可用的 WebGL2 图形环境。');}
else{try{start(gl);}catch(e){console.error(e);fail('WebGL2 setup failed / 初始化失败: '+e.message);}}
function start(gl){
  const vs=[
  '#version 300 es','precision highp float;',
  'layout(location=0) in vec3 aPosition;','layout(location=1) in vec3 aNormal;',
  'uniform mat4 uVP;','out vec3 vPosition;','out vec3 vNormal;',
  'void main(){vPosition=aPosition;vNormal=aNormal;gl_Position=uVP*vec4(aPosition,1.0);}'
  ].join('\n');
  const fs=[
  '#version 300 es','precision highp float;',
  'in vec3 vPosition;','in vec3 vNormal;',
  'uniform vec3 uEye;','uniform int uKind;','uniform bool uFog;','uniform bool uWire;',
  'out vec4 outColor;',
  'float hash2(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
  'float noise2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
  'return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x),mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x),f.y);}',
  'void main(){',
  'if(uWire){outColor=vec4(0.37,0.96,0.87,1.0);return;}',
  'vec3 n=normalize(vNormal),light=normalize(vec3(0.52,0.84,0.33));',
  'float diff=max(dot(n,light),0.0);',
  'float band=clamp((vPosition.y+2.0)/7.0,0.0,1.0);',
  'vec3 base=mix(vec3(0.21,0.21,0.195),vec3(0.47,0.40,0.29),band);',
  'float grain=hash2(floor(vPosition.xz*32.0));',
  'base=mix(base,vec3(0.63,0.58,0.47),smoothstep(0.83,0.99,grain)*0.22);',
  'base+=noise2(vPosition.xz*1.7)*0.14+noise2(vPosition.xz*9.0)*0.055-0.095;',
  'if(uKind==1){base=mix(vec3(0.22,0.24,0.25),vec3(0.43,0.39,0.33),noise2(vPosition.xz*4.0));}',
  'if(uKind==2){base=vec3(0.12,0.21,0.24);}',
  'if(uKind==3){base=vec3(0.12,0.89,0.78);}',
  'vec3 col=base*(0.40+0.87*diff);',
  'col+=vec3(0.085,0.11,0.12)*pow(max(dot(reflect(-light,n),normalize(uEye-vPosition)),0.0),26.0);',
  'if(uKind==3){col+=vec3(0.04,0.38,0.36);}',
  'float dist=distance(vPosition,uEye);',
  'float f=uFog?1.0-exp(-pow(dist*0.014,1.8)):0.0;',
  'col=mix(col,vec3(0.17,0.255,0.28),clamp(f,0.0,0.88));',
  'outColor=vec4(pow(max(col,vec3(0.0)),vec3(1.0/2.2)),1.0);}'
  ].join('\n');
  const svs=['#version 300 es','void main(){','vec2 uv=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));',
    'gl_Position=vec4(uv*2.0-1.0,1.0,1.0);','}'].join('\n');
  const sfs=['#version 300 es','precision highp float;','uniform vec2 uResolution;','out vec4 outColor;',
   'void main(){','vec2 uv=gl_FragCoord.xy/uResolution;',
   'vec3 horizon=vec3(0.24,0.34,0.37),high=vec3(0.025,0.087,0.13);',
   'vec3 c=mix(horizon,high,pow(smoothstep(0.01,1.0,uv.y),1.25));',
   'float sun=exp(-pow(distance(uv,vec2(0.75,0.69))*6.2,2.0));',
   'c+=sun*vec3(0.21,0.16,0.10);','outColor=vec4(pow(c,vec3(1.0/2.2)),1.0);','}'].join('\n');
  function shader(type,src){
    const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('GLSL: '+gl.getShaderInfoLog(s));
    return s;
  }
  function program(v,f){
    const p=gl.createProgram(),a=shader(gl.VERTEX_SHADER,v),b=shader(gl.FRAGMENT_SHADER,f);
    gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);
    gl.deleteShader(a);gl.deleteShader(b);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error('Link: '+gl.getProgramInfoLog(p));
    return p;
  }
  const mat=program(vs,fs),sky=program(svs,sfs),skyVAO=gl.createVertexArray();
  const u={vp:gl.getUniformLocation(mat,'uVP'),eye:gl.getUniformLocation(mat,'uEye'),
    kind:gl.getUniformLocation(mat,'uKind'),fog:gl.getUniformLocation(mat,'uFog'),
    wire:gl.getUniformLocation(mat,'uWire')};
  const uResolution=gl.getUniformLocation(sky,'uResolution');
  function height(x,z){
    return 1.45*Math.sin(x*.10+z*.065)*Math.cos(z*.105)+.70*Math.sin(x*.19-z*.085)
      +.31*Math.sin(x*.44+z*.22)*Math.cos(z*.36-x*.10)
      -1.15*Math.exp(-(x*x+z*z)/155);
  }
  function normAt(x,z){
    const e=.085,a=height(x-e,z)-height(x+e,z),b=height(x,z-e)-height(x,z+e);
    const q=1/Math.hypot(a,2*e,b);return[a*q,2*e*q,b*q];
  }
  function mesh(positions,normals,indices,lineIndices=[]){
    const data=new Float32Array(positions.length*2);
    for(let i=0;i<positions.length/3;i++){
      for(let j=0;j<3;j++){data[6*i+j]=positions[3*i+j];data[6*i+3+j]=normals[3*i+j];}
    }
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const vbo=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vbo);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
    const triangles=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangles);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(indices),gl.STATIC_DRAW);
    let lines=null;
    if(lineIndices.length){lines=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,lines);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(lineIndices),gl.STATIC_DRAW);}
    gl.bindVertexArray(null);
    return{vao,triangles,lines,count:indices.length,lineCount:lineIndices.length,triangleCount:indices.length/3};
  }
  const GRID=7,TILE=12,HALF=GRID*TILE/2,RES=[10,21,42],cache=new Map(),tiles=[];
  function terrain(cx,cz,detail){
    const r=RES[detail],p=[],n=[],ids=[],lines=[];
    const ox=-HALF+cx*TILE,oz=-HALF+cz*TILE,idx=(i,j)=>j*(r+1)+i;
    const push=(x,y,z,normal)=>{p.push(x,y,z);n.push(...normal)};
    for(let j=0;j<=r;j++)for(let i=0;i<=r;i++){
      const x=ox+i*TILE/r,z=oz+j*TILE/r;
      push(x,height(x,z),z,normAt(x,z));
    }
    for(let j=0;j<r;j++)for(let i=0;i<r;i++){
      const a=idx(i,j),b=idx(i+1,j),c=idx(i,j+1),d=idx(i+1,j+1);
      ids.push(a,c,b,b,c,d);
    }
    for(let j=0;j<=r;j++)for(let i=0;i<r;i++)lines.push(idx(i,j),idx(i+1,j));
    for(let j=0;j<r;j++)for(let i=0;i<=r;i++)lines.push(idx(i,j),idx(i,j+1));
    // Edge skirts cover T-junctions; deliberate limitation: no LOD geomorph yet.
    function skirt(edge){
      const start=p.length/3;
      for(const v of edge)push(p[v*3],p[v*3+1]-.95,p[v*3+2],[0,.35,.94]);
      for(let k=0;k<edge.length-1;k++)ids.push(edge[k],edge[k+1],start+k,
        edge[k+1],start+k+1,start+k);
    }
    skirt(Array.from({length:r+1},(_,i)=>idx(i,0)));
    skirt(Array.from({length:r+1},(_,i)=>idx(r,i)));
    skirt(Array.from({length:r+1},(_,i)=>idx(r-i,r)));
    skirt(Array.from({length:r+1},(_,i)=>idx(0,r-i)));
    return mesh(p,n,ids,lines);
  }
  for(let z=0;z<GRID;z++)for(let x=0;x<GRID;x++)tiles.push({x,z,lod:-1,m:null});
  function rng(seed){return()=>{let t=seed+=0x6D2B79F5;
    t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);
    return((t^t>>>14)>>>0)/4294967296;};}
  const rand=rng(220711);
  function rock(p,n,ix,x,z,s){
    const y=height(x,z),a=p.length/3,stretch=.55+rand()*.6;
    const v=[[0,s*.75,0],[s,0,0],[0,0,s*stretch],[-s,0,0],[0,0,-s*stretch],[0,-s*.11,0]];
    for(const w of v){p.push(x+w[0],y+w[1],z+w[2]);n.push(...normAt(x+w[0],z+w[2]));}
    for(let i=1;i<=4;i++){const j=i===4?1:i+1;ix.push(a,a+i,a+j,a+5,a+j,a+i);}
  }
  function rocksMesh(){
    const p=[],n=[],ix=[];
    for(let i=0;i<460;i++){const x=(rand()-.5)*80,z=(rand()-.5)*80;
      if(Math.hypot(x,z)<3.1)continue;
      rock(p,n,ix,x,z,.065+Math.pow(rand(),3)*.22);
    }
    for(let i=0;i<14;i++){const x=(rand()-.5)*79,z=(rand()-.5)*79;
      if(Math.hypot(x,z)<5)continue;
      rock(p,n,ix,x,z,.45+rand()*.9);
    }
    return mesh(p,n,ix);
  }
  const stones=rocksMesh();
  function cylinder(p,n,ix,x,z,r,h,y,segs){
    const a=p.length/3;
    for(let i=0;i<segs;i++){
      const theta=i/segs*Math.PI*2,c=Math.cos(theta),s=Math.sin(theta);
      p.push(x+r*c,y,z+r*s,x+r*c,y+h,z+r*s);n.push(c,0,s,c,0,s);
    }
    for(let i=0;i<segs;i++){
      const v=a+i*2,w=a+((i+1)%segs)*2;ix.push(v,v+1,w,w,v+1,w+1);
    }
    const top=p.length/3;p.push(x,y+h,z);n.push(0,1,0);
    for(let i=0;i<segs;i++)ix.push(top,a+i*2+1,a+((i+1)%segs)*2+1);
  }
  function beaconMesh(){
    const p=[],n=[],ix=[],lp=[],ln=[],li=[],cy=height(0,0);
    cylinder(p,n,ix,0,0,.94,.18,cy-.05,18);
    cylinder(p,n,ix,0,0,.16,2.7,cy+.12,12);
    cylinder(lp,ln,li,0,0,.25,.42,cy+2.80,12);
    for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*4,z=Math.sin(a)*4;
      cylinder(p,n,ix,x,z,.095,.62,height(x,z)-.03,9);}
    return{metal:mesh(p,n,ix),tip:mesh(lp,ln,li)};
  }
  const beacon=beaconMesh();
  const subtract=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const normalize=a=>{const l=Math.max(Math.hypot(...a),1e-7);return a.map(v=>v/l);};
  function lookAt(eye,target){
    const z=normalize(subtract(eye,target)),x=normalize(cross([0,1,0],z)),y=cross(z,x);
    return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,
      -dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
  }
  function perspective(fov,aspect,near,far){
    const f=1/Math.tan(fov/2),a=(far+near)/(near-far),b=2*far*near/(near-far);
    return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,a,-1,0,0,b,0]);
  }
  function mul(a,b){
    const c=new Float32Array(16);
    for(let col=0;col<4;col++)for(let row=0;row<4;row++)
      c[col*4+row]=a[row]*b[col*4]+a[4+row]*b[col*4+1]+a[8+row]*b[col*4+2]+a[12+row]*b[col*4+3];
    return c;
  }
  const camera={yaw:.55,pitch:.95,distance:35,target:[0,height(0,0)+.75,0]};
  const resetCamera=()=>{camera.yaw=.55;camera.pitch=.95;camera.distance=35;};
  function cameraPos(){const cp=Math.cos(camera.pitch),sp=Math.sin(camera.pitch);
    return[camera.target[0]+camera.distance*sp*Math.sin(camera.yaw),
      camera.target[1]+camera.distance*cp,camera.target[2]+camera.distance*sp*Math.cos(camera.yaw)];
  }
  let lodCounts=[0,0,0],triangleCount=0;
  function updateLOD(eye){
    let counts=[0,0,0],tri=0;
    for(const t of tiles){
      const x=-HALF+(t.x+.5)*TILE,z=-HALF+(t.z+.5)*TILE;
      const d=Math.hypot(eye[0]-x,eye[1]-height(x,z),eye[2]-z);
      const next=mode.value==='high'?2:mode.value==='low'?0:d<23?2:d<47?1:0;
      if(next!==t.lod){const key=t.x+'/'+t.z+'/'+next;
        if(!cache.has(key))cache.set(key,terrain(t.x,t.z,next));
        t.m=cache.get(key);t.lod=next;}
      counts[next]++;tri+=t.m.triangleCount;
    }
    if(rocks.checked)tri+=stones.triangleCount+beacon.metal.triangleCount+beacon.tip.triangleCount;
    lodCounts=counts;triangleCount=tri;
  }
  let width=1,heightPx=1;
  function resize(){const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,1.5);
    width=Math.max(1,Math.floor(rect.width*dpr));heightPx=Math.max(1,Math.floor(rect.height*dpr));
    if(canvas.width!==width||canvas.height!==heightPx){canvas.width=width;canvas.height=heightPx;}
    gl.viewport(0,0,width,heightPx);
  }
  function draw(m,kind,outline=false){
    gl.uniform1i(u.kind,kind);gl.uniform1i(u.wire,0);
    gl.bindVertexArray(m.vao);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.triangles);
    gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);
    if(outline&&m.lines){
      gl.depthMask(false);gl.uniform1i(u.wire,1);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.lines);
      gl.drawElements(gl.LINES,m.lineCount,gl.UNSIGNED_INT,0);
      gl.uniform1i(u.wire,0);gl.depthMask(true);
    }
  }
  let last=performance.now(),sampleStart=last,frameCount=0,lastFPS=0,lastP95=0;
  const intervals=[];
  function frame(now){
    resize();
    const dt=now-last;last=now;
    if(dt>0&&dt<400){intervals.push(dt);if(intervals.length>150)intervals.shift();}
    const eye=cameraPos();updateLOD(eye);
    gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.useProgram(sky);
    gl.bindVertexArray(skyVAO);gl.uniform2f(uResolution,width,heightPx);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
    gl.useProgram(mat);gl.uniformMatrix4fv(u.vp,false,
      mul(perspective(57*Math.PI/180,width/heightPx,.05,250),lookAt(eye,camera.target)));
    gl.uniform3fv(u.eye,eye);gl.uniform1i(u.fog,fog.checked?1:0);
    gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
    for(const t of tiles)draw(t.m,0,wire.checked);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    if(rocks.checked){draw(stones,1);draw(beacon.metal,2);draw(beacon.tip,3);}
    gl.bindVertexArray(null);frameCount++;
    if(now-sampleStart>650){
      lastFPS=Math.round(frameCount/((now-sampleStart)/1000));
      const sorted=[...intervals].sort((a,b)=>a-b);
      lastP95=sorted.length?sorted[Math.min(sorted.length-1,Math.ceil(.95*sorted.length)-1)]:0;
      fps.textContent=String(lastFPS);p95.textContent=lastP95.toFixed(1);
      trianglesEl.textContent=triangleCount.toLocaleString();lodsEl.textContent=lodCounts.join(' / ');
      sampleStart=now;frameCount=0;
    }
    requestAnimationFrame(frame);
  }
  let pointer=null;
  canvas.addEventListener('pointerdown',e=>{
    pointer={id:e.pointerId,x:e.clientX,y:e.clientY};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!pointer||pointer.id!==e.pointerId)return;
    camera.yaw-=(e.clientX-pointer.x)*.008;
    camera.pitch=Math.max(.25,Math.min(1.42,camera.pitch+(e.clientY-pointer.y)*.006));
    pointer.x=e.clientX;pointer.y=e.clientY;
  });
  canvas.addEventListener('pointerup',e=>{if(pointer&&pointer.id===e.pointerId)pointer=null;});
  canvas.addEventListener('pointercancel',()=>pointer=null);
  canvas.addEventListener('wheel',e=>{
    e.preventDefault();camera.distance=Math.max(5,Math.min(95,camera.distance*Math.exp(e.deltaY*.0011)));
  },{passive:false});
  let pinch=null;
  canvas.addEventListener('touchmove',e=>{
    if(e.touches.length!==2)return;
    const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    if(pinch!==null)camera.distance=Math.max(5,Math.min(95,camera.distance*pinch/d));
    pinch=d;
  },{passive:true});
  canvas.addEventListener('touchend',()=>pinch=null);
  document.getElementById('reset').addEventListener('click',resetCamera);
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='r'&&e.target.tagName!=='SELECT')resetCamera();});
  status.textContent='WebGL2 · original geometry · no external assets';
  window.__oiaTerrainLab=Object.freeze({getStats:()=>({
    renderer:'WebGL2',initialized:true,mode:mode.value,wireframe:wire.checked,
    fog:fog.checked,pebbles:rocks.checked,triangleCount,lodCounts:[...lodCounts],
    terrainTiles:tiles.length,frameIntervalP95Ms:lastP95,fps:lastFPS,width,height:heightPx,cameraDistance:camera.distance,cameraYaw:camera.yaw,glErrorCode:gl.getError()
  })});
  requestAnimationFrame(frame);
}