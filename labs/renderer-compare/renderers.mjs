// OIA Spatial Lab 03 — original renderers with the exact same packed terrain mesh.
// Does not claim that WebGL command calls equal WebGPU queue submission timings.
const VS=[
'#version 300 es',
'precision highp float;',
'layout(location=0) in vec3 position;',
'layout(location=1) in vec3 normal;',
'uniform mat4 uVP;',
'out vec3 vWorld; out vec3 vNormal;',
'void main(){vWorld=position;vNormal=normal;gl_Position=uVP*vec4(position,1.0);}'
].join('\n');
const FS=[
'#version 300 es','precision highp float;',
'in vec3 vWorld; in vec3 vNormal;',
'uniform vec3 uEye; uniform float uFog;',
'out vec4 frag;',
'void main(){',
'  vec3 n=normalize(vNormal);',
'  float light=.36+max(dot(n,normalize(vec3(.55,.82,.30))),0.0)*.86;',
'  float h=clamp((vWorld.y+2.0)/6.0,0.0,1.0);',
'  vec3 base=mix(vec3(.17,.235,.22),vec3(.43,.37,.275),h);',
'  float grain=fract(sin(dot(floor(vWorld.xz*8.0),vec2(12.9898,78.233)))*43758.5453);',
'  base+=.045*(grain-.5);',
'  float fog=clamp(uFog*(1.0-exp(-distance(vWorld,uEye)*.032)),0.0,.82);',
'  vec3 color=mix(base*light,vec3(.20,.31,.34),fog);',
'  frag=vec4(pow(max(color,vec3(0.0)),vec3(1.0/2.2)),1.0);',
'}'
].join('\n');
const WGSL=[
'struct Uniforms { vp:mat4x4<f32>, eye:vec4<f32>, params:vec4<f32> };',
'@group(0) @binding(0) var<uniform> u:Uniforms;',
'struct VertexOut {',
' @builtin(position) pos:vec4<f32>,',
' @location(0) world:vec3<f32>,',
' @location(1) norm:vec3<f32>',
'};',
'@vertex fn vs(@location(0) pos:vec3<f32>, @location(1) normal:vec3<f32>)->VertexOut{',
' var o:VertexOut;',
' o.pos=u.vp*vec4<f32>(pos,1.0); o.world=pos; o.norm=normal;',
' return o;',
'}',
'@fragment fn fs(@location(0) world:vec3<f32>,@location(1) normal:vec3<f32>)->@location(0) vec4<f32>{',
' let n=normalize(normal);',
' let lighting=.36+max(dot(n,normalize(vec3<f32>(.55,.82,.30))),0.0)*.86;',
' let h=clamp((world.y+2.0)/6.0,0.0,1.0);',
' var base=mix(vec3<f32>(.17,.235,.22),vec3<f32>(.43,.37,.275),h);',
' let cell=floor(world.xz*8.0);',
' let grain=fract(sin(dot(cell,vec2<f32>(12.9898,78.233)))*43758.5453);',
' base+=vec3<f32>(.045*(grain-.5));',
' let amount=clamp(u.params.x*(1.0-exp(-distance(world,u.eye.xyz)*.032)),0.0,.82);',
' let color=mix(base*lighting,vec3<f32>(.20,.31,.34),amount);',
' return vec4<f32>(pow(max(color,vec3<f32>(0.0)),vec3<f32>(1.0/2.2)),1.0);',
'}'
].join('\n');
function compile(gl,type,code){
  const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    const msg=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error('GLSL: '+msg);
  }
  return shader;
}
export function createWebGL2(canvas,geometry){
  const gl=canvas.getContext('webgl2',{antialias:false,alpha:false,depth:true});
  if(!gl)throw Error('WebGL2 not available');
  const vertex=compile(gl,gl.VERTEX_SHADER,VS),fragment=compile(gl,gl.FRAGMENT_SHADER,FS);
  const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
  gl.deleteShader(vertex);gl.deleteShader(fragment);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL2 program: '+gl.getProgramInfoLog(program));
  const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);
  gl.bufferData(gl.ARRAY_BUFFER,geometry.vertices,gl.STATIC_DRAW);
  gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gl.enableVertexAttribArray(1);
  const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,geometry.indices,gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  const loc={vp:gl.getUniformLocation(program,'uVP'),
    eye:gl.getUniformLocation(program,'uEye'),fog:gl.getUniformLocation(program,'uFog')};
  let disposed=false;
  return{
    api:'WebGL2',
    render(frame,flags){
      if(disposed)throw Error('WebGL2 renderer destroyed');
      gl.viewport(0,0,canvas.width,canvas.height);
      gl.clearColor(.07,.14,.18,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
      gl.useProgram(program);gl.uniformMatrix4fv(loc.vp,false,frame.viewProjection);
      gl.uniform3fv(loc.eye,frame.eye);gl.uniform1f(loc.fog,flags.fog?1:0);
      gl.bindVertexArray(vao);gl.drawElements(gl.TRIANGLES,geometry.indices.length,gl.UNSIGNED_INT,0);
      gl.bindVertexArray(null);
    },
    getError:()=>gl.getError(),
    destroy(){if(disposed)return;disposed=true;gl.deleteBuffer(vb);gl.deleteBuffer(ib);gl.deleteVertexArray(vao);gl.deleteProgram(program);}
  };
}
export function convertClipToWebGPU(glVP){
  // WebGL NDC depth [-1,1] -> WebGPU NDC depth [0,1].
  const out=new Float32Array(glVP);
  for(let col=0;col<4;col++){
    const i=col*4+2;
    out[i]=.5*(glVP[i]+glVP[i+1]);
  }
  return out;
}
export async function createWebGPU(canvas,geometry){
  if(!navigator.gpu)throw Error('WebGPU API unavailable (HTTPS and a supported browser are required)');
  const adapter=await navigator.gpu.requestAdapter({powerPreference:'high-performance'});
  if(!adapter)throw Error('Browser provided no compatible WebGPU adapter');
  const info=adapter.info||{};
  const rendererName=[info.vendor,info.architecture,info.description].filter(Boolean).join(' ');
  const software=/swiftshader|llvmpipe|lavapipe|software/i.test(rendererName);
  if(software&&!new URL(location.href).searchParams.has('allowSoftwareWebGPU')){
    throw Error('Only a software WebGPU adapter is available ('+rendererName+'). Comparison disabled to protect WebGL2; open on hardware or use ?allowSoftwareWebGPU for diagnostic-only testing.');
  }
  const device=await adapter.requestDevice();
  const ctx=canvas.getContext('webgpu');
  if(!ctx){device.destroy();throw Error('WebGPU canvas unavailable');}
  const format=navigator.gpu.getPreferredCanvasFormat();
  ctx.configure({device,format,alphaMode:'opaque'});
  const shader=device.createShaderModule({code:WGSL});
  const compilation=await shader.getCompilationInfo();
  const errors=compilation.messages.filter(m=>m.type==='error');
  if(errors.length){device.destroy();throw Error('WGSL: '+errors.map(x=>x.message).join(' | '));}
  const pipeline=device.createRenderPipeline({
    layout:'auto',
    vertex:{module:shader,entryPoint:'vs',buffers:[{
      arrayStride:24,attributes:[
        {shaderLocation:0,offset:0,format:'float32x3'},
        {shaderLocation:1,offset:12,format:'float32x3'}
      ]}]},
    fragment:{module:shader,entryPoint:'fs',targets:[{format}]},
    primitive:{topology:'triangle-list',cullMode:'none'},
    depthStencil:{format:'depth24plus',depthWriteEnabled:true,depthCompare:'less'}
  });
  const vb=device.createBuffer({size:geometry.vertices.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST});
  const ib=device.createBuffer({size:geometry.indices.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST});
  const ub=device.createBuffer({size:96,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
  device.queue.writeBuffer(vb,0,geometry.vertices);
  device.queue.writeBuffer(ib,0,geometry.indices);
  const bind=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:ub}}]});
  const uniforms=new Float32Array(24);
  let depth=null,w=0,h=0,lost=false,disposed=false,lostReason='',deviceError='';
  device.addEventListener('uncapturederror',event=>{deviceError=event.error?.message||'Uncaptured GPU error';});
  device.lost.then(info=>{lost=true;lostReason=(info?.reason||'unknown')+': '+(info?.message||'device lost');})
    .catch(e=>{lost=true;lostReason=e?.message||'device lost';});
  return{
    api:'WebGPU',
    getAdapterInfo:()=>({vendor:String(info.vendor||''),architecture:String(info.architecture||''),device:String(info.device||''),description:String(info.description||'')}),
    render(frame,flags){
      if(disposed||lost||deviceError)throw Error('WebGPU unavailable: '+(lostReason||deviceError||'renderer destroyed'));
      if(w!==canvas.width||h!==canvas.height){
        depth?.destroy();w=canvas.width;h=canvas.height;
        depth=device.createTexture({size:[w,h],format:'depth24plus',usage:GPUTextureUsage.RENDER_ATTACHMENT});
      }
      uniforms.set(convertClipToWebGPU(frame.viewProjection),0);
      uniforms.set([frame.eye[0],frame.eye[1],frame.eye[2],0],16);
      uniforms.set([flags.fog?1:0,0,0,0],20);
      device.queue.writeBuffer(ub,0,uniforms);
      const encoder=device.createCommandEncoder();
      const pass=encoder.beginRenderPass({
        colorAttachments:[{view:ctx.getCurrentTexture().createView(),clearValue:{r:.07,g:.14,b:.18,a:1},loadOp:'clear',storeOp:'store'}],
        depthStencilAttachment:{view:depth.createView(),depthClearValue:1,depthLoadOp:'clear',depthStoreOp:'store'}
      });
      pass.setPipeline(pipeline);pass.setBindGroup(0,bind);
      pass.setVertexBuffer(0,vb);pass.setIndexBuffer(ib,'uint32');
      pass.drawIndexed(geometry.indices.length);pass.end();
      device.queue.submit([encoder.finish()]);
    },
    getError:()=>lost?lostReason||'DEVICE_LOST':deviceError||0,
    destroy(){if(disposed)return;disposed=true;depth?.destroy();vb.destroy();ib.destroy();ub.destroy();ctx.unconfigure();device.destroy();}
  };
}
