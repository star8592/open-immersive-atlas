// OIA GLB Lab: original offline structural preflight, not full Khronos validation.
export const MAX_BYTES=64*1024*1024;
const ct={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const parts={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};
const arr=x=>Array.isArray(x)?x:[];
const nat=x=>Number.isSafeInteger(x)&&x>=0;
const idx=(a,i)=>nat(i)&&i<a.length;
function failure(code,zh,en){const e=new Error(en);e.code=code;e.zh=zh;throw e;}
function parse(bytes,name){
  if(bytes.length===0)failure('EMPTY','文件为空','Empty file');
  if(bytes.length>MAX_BYTES)failure('SIZE','文件超过 64 MiB 限制','File exceeds 64 MiB limit');
  const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.length);
  let jsonBytes=bytes,bin=null,format='glTF';
  if((bytes.length>=4&&dv.getUint32(0,true)===0x46546c67)||name.toLowerCase().endsWith('.glb')){
    format='GLB';
    if(bytes.length<20||dv.getUint32(0,true)!==0x46546c67)failure('MAGIC','GLB 文件头无效','Invalid GLB header');
    if(dv.getUint32(4,true)!==2)failure('VERSION','仅支持 GLB v2','GLB v2 required');
    if(dv.getUint32(8,true)!==bytes.length)failure('LENGTH','GLB 文件长度不一致','GLB header length mismatch');
    let offset=12,chunk=0;
    while(offset<bytes.length){
      if(offset+8>bytes.length)failure('CHUNK','GLB 块头不完整','Truncated GLB chunk');
      const size=dv.getUint32(offset,true),type=dv.getUint32(offset+4,true);offset+=8;
      if(size%4||offset+size>bytes.length)failure('CHUNK_BOUNDS','GLB 分块越界','GLB chunk out of bounds');
      if(chunk===0&&type!==0x4e4f534a)failure('JSON_FIRST','GLB 第一块必须为 JSON','JSON chunk must be first');
      if(type===0x4e4f534a){if(chunk!==0)failure('JSON_ORDER','GLB JSON 块顺序错误','Unexpected GLB JSON chunk');jsonBytes=bytes.subarray(offset,offset+size);}
      if(type===0x004e4942){if(bin)failure('BIN_DUP','GLB 有重复 BIN 块','Duplicate BIN chunk');bin=bytes.subarray(offset,offset+size);}
      chunk++;offset+=size;
    }
  }
  if(jsonBytes.length>8*1024*1024)failure('JSON_SIZE','JSON 超过 8 MiB','JSON exceeds 8 MiB');
  let doc;
  try{doc=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(jsonBytes).replace(/\u0000+$/g,'').trimEnd());}
  catch{failure('JSON_PARSE','JSON 无法解析','Cannot parse glTF JSON');}
  if(!doc||typeof doc!=='object'||Array.isArray(doc))failure('ROOT','GLTF 根必须是对象','glTF root must be object');
  return {doc,bin,format};
}
export function inspectModel(data,name='file.glb'){
  const bytes=data instanceof Uint8Array?data:new Uint8Array(data);
  const {doc,bin,format}=parse(bytes,name);
  const issues=[],add=(severity,code,zh,en,where='asset')=>issues.push({severity,code,zh,en,where});
  const buffers=arr(doc.buffers),views=arr(doc.bufferViews),accessors=arr(doc.accessors),
    meshes=arr(doc.meshes),nodes=arr(doc.nodes),materials=arr(doc.materials),scenes=arr(doc.scenes);
  for(const [key,a] of [['buffers',buffers],['bufferViews',views],['accessors',accessors],['meshes',meshes],['nodes',nodes]])
    if(a.length>100000)failure('COUNT','对象数量超过安全上限','Too many asset objects');
  if(doc.asset?.version!=='2.0')add('error','VERSION','asset.version 必须是 2.0','asset.version must be 2.0','asset');
  const known=[];
  let external=0,triangles=0,vertices=0,primitives=0,compressed=0;
  buffers.forEach((b,i)=>{
    const at='buffers['+i+']';
    if(!nat(b?.byteLength))add('error','BUFFER_LENGTH','buffer 长度无效','Invalid buffer length',at);
    if(typeof b?.uri==='string'){
      if(b.uri.startsWith('data:')){
        const m=/^data:[^,]*;base64,([a-z0-9+/=\s]+)$/i.exec(b.uri);
        if(!m)add('warning','DATA_URI','嵌入式 URI 格式未验证','Embedded URI format not validated',at);
        else try{known[i]=atob(m[1].replace(/\s/g,'')).length;}
        catch{add('error','DATA_URI','base64 数据无效','Invalid base64 data',at);}
      } else {external++;add('warning','EXTERNAL','不会抓取外部 buffer，数据未校验','External buffer is never fetched; unverified',at);}
    }else if(format==='GLB'&&i===0&&bin)known[i]=bin.length;
    else if(b?.byteLength)add('error','MISSING_DATA','buffer 缺少实际数据','Missing buffer data',at);
    if(known[i]!==undefined&&nat(b?.byteLength)&&
      (known[i]<b.byteLength||(format==='GLB'&&i===0&&known[i]-b.byteLength>3)))
      add('error','BUFFER_MISMATCH','buffer 声明长度与实际不符','Declared buffer length mismatch',at);
  });
  views.forEach((v,i)=>{
    const at='bufferViews['+i+']',offset=v?.byteOffset??0;
    if(!idx(buffers,v?.buffer))add('error','VIEW_BUFFER','引用不存在的 buffer','Missing referenced buffer',at);
    if(!nat(v?.byteLength)||!nat(offset))add('error','VIEW_RANGE','bufferView 范围无效','Invalid bufferView range',at);
    if(idx(buffers,v?.buffer)&&nat(v?.byteLength)&&nat(offset)){
      if(offset+v.byteLength>buffers[v.buffer].byteLength)
        add('error','VIEW_BOUNDS','bufferView 超出声明边界','bufferView exceeds buffer length',at);
      if(known[v.buffer]!==undefined&&offset+v.byteLength>known[v.buffer])
        add('error','VIEW_BYTES','bufferView 超出真实字节','bufferView exceeds available bytes',at);
    }
    if(v?.byteStride!==undefined&&(!nat(v.byteStride)||v.byteStride<4||v.byteStride>252||v.byteStride%4))
      add('error','STRIDE','byteStride 越界或未对齐','Invalid byteStride alignment',at);
  });
  accessors.forEach((a,i)=>{
    const at='accessors['+i+']',elem=parts[a?.type],size=ct[a?.componentType];
    if(!nat(a?.count)||a.count>100000000)add('error','ACCESSOR_COUNT','accessor.count 无效','Invalid accessor count',at);
    if(!elem||!size)add('error','ACCESSOR_TYPE','accessor 类型无效','Invalid accessor format',at);
    if(a?.bufferView!==undefined&&!idx(views,a.bufferView))add('error','ACCESSOR_VIEW','引用无效 bufferView','Invalid bufferView reference',at);
    if(a?.sparse)add('warning','SPARSE','稀疏 accessor 内容需官方完整验证','Sparse accessors need full Khronos validation',at);
    if(idx(views,a?.bufferView)&&elem&&size&&nat(a?.count)&&nat(a.byteOffset??0)){
      const v=views[a.bufferView],packed=elem*size,stride=v.byteStride??packed;
      const end=(a.byteOffset??0)+(a.count?(a.count-1)*stride+packed:0);
      if(stride<packed||end>v.byteLength)add('error','ACCESSOR_BOUNDS','accessor 超出 bufferView','Accessor exceeds bufferView',at);
      if((a.byteOffset??0)%size)add('error','ACCESSOR_ALIGN','accessor 字节偏移未对齐','Accessor offset misaligned',at);
      if(a.type.startsWith('MAT')&&size<4)add('warning','MAT_PADDING','整数矩阵需要特殊填充检查','Non-float matrix padding needs official validation',at);
    }
    if(a?.min||a?.max){
      if(!Array.isArray(a.min)||!Array.isArray(a.max)||a.min.length!==elem||a.max.length!==elem||
        ![...a.min,...a.max].every(Number.isFinite)||a.min.some((v,j)=>v>a.max[j]))
        add('error','MIN_MAX','accessor min/max 无效','Invalid accessor min/max',at);
    }
  });
  let min=null,max=null;
  meshes.forEach((m,i)=>arr(m?.primitives).forEach((p,j)=>{
    const at='meshes['+i+'].primitives['+j+']';primitives++;
    const position=p?.attributes?.POSITION;
    if(!idx(accessors,position))add('warning','POSITION','图元缺少 POSITION','Primitive lacks POSITION',at);
    else {
      const a=accessors[position];vertices+=nat(a?.count)?a.count:0;
      if(Array.isArray(a.min)&&Array.isArray(a.max)&&a.min.length===3&&a.max.length===3&&
        [...a.min,...a.max].every(Number.isFinite)){
        if(!min){min=a.min.slice();max=a.max.slice();}
        else for(let k=0;k<3;k++){min[k]=Math.min(min[k],a.min[k]);max[k]=Math.max(max[k],a.max[k]);}
      }
    }
    if(p?.indices!==undefined&&!idx(accessors,p.indices))add('error','INDICES','图元索引不存在','Missing indices accessor',at);
    if(idx(accessors,p?.indices)){
      const a=accessors[p.indices];
      if(a.type!=='SCALAR'||![5121,5123,5125].includes(a.componentType))
        add('error','INDEX_TYPE','indices 必须是无符号标量','Indices must use unsigned scalar format',at);
    }
    if(p?.material!==undefined&&!idx(materials,p.material))add('error','MATERIAL','引用不存在的材质','Missing referenced material',at);
    const count=idx(accessors,p?.indices)?accessors[p.indices].count:
      idx(accessors,position)?accessors[position].count:0;
    if((p.mode??4)===4)triangles+=Math.floor(count/3);
    if([5,6].includes(p.mode)&&count>=3)triangles+=count-2;
    if(p?.extensions?.KHR_draco_mesh_compression){compressed++;add('warning','DRACO','Draco 数据未解码','Draco geometry not decoded',at);}
  }));
  const parents=new Set(),state=new Uint8Array(nodes.length);
  nodes.forEach((n,i)=>{
    const at='nodes['+i+']',v=n||{};
    if(v.matrix!==undefined&&[v.translation,v.rotation,v.scale].some(x=>x!==undefined))
      add('error','MATRIX_TRS','不能同时声明 matrix 和 TRS','matrix and TRS must not coexist',at);
    for(const [key,len] of [['matrix',16],['translation',3],['rotation',4],['scale',3]])
      if(v[key]!==undefined&&(!Array.isArray(v[key])||v[key].length!==len||!v[key].every(Number.isFinite)))
        add('error','TRANSFORM','节点 '+key+' 无效','Invalid node '+key,at);
    if(Array.isArray(v.rotation)&&v.rotation.length===4&&v.rotation.every(Number.isFinite)&&
      Math.abs(Math.hypot(...v.rotation)-1)>0.001)
      add('warning','QUATERNION','旋转四元数长度不是 1','Non-unit rotation quaternion',at);
    if(v.mesh!==undefined&&!idx(meshes,v.mesh))add('error','NODE_MESH','节点引用无效 mesh','Node references invalid mesh',at);
    for(const child of arr(v.children)){
      if(!idx(nodes,child))add('error','NODE_CHILD','节点引用无效 child','Node references invalid child',at);
      else{if(parents.has(child))add('error','MULTI_PARENT','节点存在重复父级','Node has multiple parents',at);parents.add(child);}
    }
  });
  function visit(i){
    if(state[i]===1){add('error','CYCLE','节点层级存在循环','Node hierarchy contains cycle','nodes['+i+']');return;}
    if(state[i]===2)return;
    state[i]=1;for(const c of arr(nodes[i]?.children))if(idx(nodes,c))visit(c);state[i]=2;
  }
  if(nodes.length<=3000)for(let i=0;i<nodes.length;i++)visit(i);
  else add('warning','CYCLE_LIMIT','大规模节点图未执行环检测','Cycle check skipped for large graph','nodes');
  if(doc.scene!==undefined&&!idx(scenes,doc.scene))add('error','SCENE_INDEX','默认场景索引无效','Invalid default scene index','scene');
  for(const [i,s] of scenes.entries())for(const n of arr(s?.nodes))
    if(!idx(nodes,n))add('error','SCENE_NODE','场景根节点无效','Invalid scene root','scenes['+i+']');
  for(const ext of arr(doc.extensionsRequired))if(['KHR_draco_mesh_compression','EXT_meshopt_compression','KHR_texture_basisu'].includes(ext))
    add('warning','EXTENSION','必需扩展 '+ext+' 未解码','Required extension not decoded: '+ext,'extensionsRequired');
  const errors=issues.filter(x=>x.severity==='error').length,warnings=issues.filter(x=>x.severity==='warning').length;
  return {name:String(name).slice(0,250),format,status:errors?'issues':warnings?'review':'basic-ok',
    counts:{errors,warnings,info:issues.length-errors-warnings},
    stats:{bytes:bytes.length,meshes:meshes.length,primitives,triangles,vertices,nodes:nodes.length,
      materials:materials.length,animations:arr(doc.animations).length,accessors:accessors.length,
      bufferViews:views.length,buffers:buffers.length,externalBuffers:external,dracoPrimitives:compressed},
    bounds:min&&max?{min,max}:null,issues,
    notice:{zh:'仅限离线结构与元数据预检；不是 Khronos glTF 官方完整验证器，也没有实际渲染外观。外部 URI 从不获取。',
      en:'Offline structural and metadata preflight only; not a Khronos conformance validator or visual renderer. External URIs are never fetched.'}};
}
