// OIA Spatial Lab 04 — original native WebGL2 debug renderer.
// Colored primitive volumes visualize analytical bones, contacts, grip and terrain.
// This is NOT a skinned glTF character or motion-capture playback.
import {cameraFrame} from '../renderer-compare/scene.mjs';
import {terrainHeight} from './terrain.mjs';
import {add,sub,scale,len,normalize,cross} from './kinematics.mjs';
const colors={
  terrain:[.24,.34,.31],terrainAlt:[.20,.29,.27],trunk:[.71,.82,.88],
  left:[.58,.91,.79],right:[.40,.74,.95],foot:[.97,.76,.44],
  grip:[1,.71,.30],blade:[.74,.93,1],enemy:[.98,.42,.48],
  marker:[1,.92,.50],ground:[.46,.57,.57]
};
function shader(gl,type,source){
  const id=gl.createShader(type);gl.shaderSource(id,source);gl.compileShader(id);
  if(!gl.getShaderParameter(id,gl.COMPILE_STATUS))
    throw Error('Shader compile: '+gl.getShaderInfoLog(id));
  return id;
}
function program(gl){
  const v=shader(gl,gl.VERTEX_SHADER,
    '#version 300 es\nprecision highp float;\nlayout(location=0) in vec3 position; layout(location=1) in vec3 color;\nuniform mat4 vp; out vec3 c;\nvoid main(){c=color;gl_Position=vp*vec4(position,1.0);}');
  const f=shader(gl,gl.FRAGMENT_SHADER,
    '#version 300 es\nprecision highp float;\nin vec3 c;out vec4 frag;\nvoid main(){frag=vec4(c,1.0);}');
  const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);
  gl.deleteShader(v);gl.deleteShader(f);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  return p;
}
function geometry(){
  const vertices=[];
  const triangle=(a,b,c,color)=>{for(const point of [a,b,c])vertices.push(...point,...color);};
  const quad=(a,b,c,d,color)=>{triangle(a,b,c,color);triangle(a,c,d,color);};
  function segment(a,b,r,color){
    const axis=sub(b,a),length=len(axis);
    if(length<.001)return;
    const dir=normalize(axis),reference=Math.abs(dir[1])<.88?[0,1,0]:[1,0,0];
    const right=scale(normalize(cross(dir,reference)),r);
    const up=scale(normalize(cross(dir,right)),r);
    const corners=(p)=>[add(add(p,right),up),add(sub(p,right),up),
      sub(sub(p,right),up),add(sub(p,up),right)];
    const u=corners(a),v=corners(b),shade=[.89,1,.79,.94];
    for(let i=0;i<4;i++){
      const j=(i+1)%4,sc=shade[i],co=color.map(x=>Math.min(1,x*sc));
      quad(u[i],u[j],v[j],v[i],co);
    }
    quad(u[3],u[2],u[1],u[0],color.map(x=>x*.67));
    quad(v[0],v[1],v[2],v[3],color);
  }
  return{vertices,triangle,quad,segment};
}
export function createGroundVertices(type){
  const g=geometry(),extent=7,n=28,step=extent*2/n;
  for(let j=0;j<n;j++)for(let i=0;i<n;i++){
    const x=-extent+i*step,z=-extent+j*step;
    const y=(xx,zz)=>terrainHeight(xx,zz,type);
    const a=[x,y(x,z),z],b=[x+step,y(x+step,z),z],
      c=[x+step,y(x+step,z+step),z+step],d=[x,y(x,z+step),z+step];
    const color=(i+j)%2?colors.terrain:colors.terrainAlt;
    g.quad(a,d,c,b,color);
  }
  return new Float32Array(g.vertices);
}
export function createCharacterVertices(frame,sword,enemyDecision){
  const g=geometry(),pelvis=frame.pelvis;
  const world=(relative)=>add(frame.root,relative);
  const spine=world([0,1.68,0]),head=world([0,2.02,.01]);
  g.segment(pelvis,spine,.12,colors.trunk);
  g.segment(world([0,1.81,0]),head,.16,colors.trunk);
  for(const side of ['left','right']){
    const leg=frame.legs[side],co=colors[side];
    g.segment(leg.hip,leg.knee,.088,co);
    g.segment(leg.knee,leg.ankle,.075,co);
    const foot=frame.feet[side],ankle=leg.ankle;
    g.segment(ankle,add(ankle,[0,-.03,.19]),.058,colors.foot);
    if(foot.stance)g.segment(add(foot.position,[0,.013,0]),
      add(foot.position,[0,.105,0]),.030,colors.marker);
  }
  g.segment(world([-.33,1.70,.03]),world([-.52,1.42,.22]),.08,colors.left);
  g.segment(world([-.52,1.42,.22]),world([-.54,1.28,.35]),.065,colors.left);
  g.segment(sword.rightShoulder,sword.rightElbow,.083,colors.right);
  g.segment(sword.rightElbow,sword.wrist,.067,colors.right);
  g.segment(sword.hilt,sword.tip,.030,colors.blade);
  g.segment(sword.guardA,sword.guardB,.05,colors.grip);
  // A fixed dummy makes an explicit visual reference for AI distance/attack.
  const dummy=[1.35,terrainHeight(1.35,2.15,frame.terrain),2.15];
  const co=enemyDecision.action==='strike'?colors.grip:colors.enemy;
  g.segment(add(dummy,[0,.25,0]),add(dummy,[0,1.57,0]),.12,co);
  g.segment(add(dummy,[0,1.65,0]),add(dummy,[0,1.89,0]),.14,co);
  g.segment(add(dummy,[0,1.4,0]),add(dummy,[.27,1.12,0]),.058,co);
  g.segment(add(dummy,[0,1.4,0]),add(dummy,[-.27,1.12,0]),.058,co);
  return new Float32Array(g.vertices);
}
export function createDebugRenderer(canvas){
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:false});
  if(!gl)throw Error('WebGL2 unavailable — use the CPU-based test report');
  const p=program(gl),u=gl.getUniformLocation(p,'vp'),buf=gl.createBuffer();
  gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);
  gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
  let ground=null,lastType=null,disposed=false;
  function drawData(data){
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);
    gl.drawArrays(gl.TRIANGLES,0,data.length/6);
  }
  return{
    render(frame,sword,decision,{yaw=.6,pitch=1.05,distance=9}={}){
      if(disposed)throw Error('Renderer disposed');
      if(canvas.width!==Math.round(canvas.clientWidth*devicePixelRatio)||
         canvas.height!==Math.round(canvas.clientHeight*devicePixelRatio)){
        canvas.width=Math.max(1,Math.round(canvas.clientWidth*devicePixelRatio));
        canvas.height=Math.max(1,Math.round(canvas.clientHeight*devicePixelRatio));
      }
      if(lastType!==frame.terrain){
        lastType=frame.terrain;ground=createGroundVertices(frame.terrain);
      }
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clearColor(.045,.08,.11,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.useProgram(p);
      const vp=cameraFrame(yaw,pitch,distance,canvas.width/canvas.height).viewProjection;
      gl.uniformMatrix4fv(u,false,vp);
      drawData(ground);
      const figure=createCharacterVertices(frame,sword,decision);
      drawData(figure);
      return{drawCalls:2,groundTriangles:ground.length/18,
        debugTriangles:figure.length/18,glError:gl.getError()};
    },
    destroy(){if(disposed)return;disposed=true;gl.deleteBuffer(buf);gl.deleteProgram(p);}
  };
}
