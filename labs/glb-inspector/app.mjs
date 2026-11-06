import {inspectModel,MAX_BYTES} from './core.mjs';
import {demoGlb,demoName} from './sample.mjs';
const $=id=>document.getElementById(id);
const input=$('file'),drop=$('drop'),status=$('status'),report=$('report'),
  metrics=$('metrics'),tags=$('tags'),issues=$('issues'),exportBtn=$('export');
let latest=null,language='zh';
const words={zh:{ready:'完成离线结构预检',bad:'检查失败',errors:'错误',warnings:'警告',
  ok:'本轮预检没有发现上述结构问题；仍需官方验证和真实渲染。',
  noBounds:'文件没有可用的 POSITION min/max；无法绘制包围盒。',demo:'原创演示样本'},
  en:{ready:'Offline structural preflight completed',bad:'Inspection failed',
  errors:'Errors',warnings:'Warnings',ok:'No structural issues detected by this limited preflight. Official and visual QA remain required.',
  noBounds:'No usable POSITION min/max; bounds unavailable.',demo:'Original demo sample'}};
const text=(tag,content,cls)=>{const el=document.createElement(tag);el.textContent=content;if(cls)el.className=cls;return el;};
const formatBytes=n=>Number.isFinite(n)?n<1048576?(n/1024).toFixed(1)+' KiB':(n/1048576).toFixed(2)+' MiB':'—';
function drawBounds(bounds){
  const canvas=$('bounds'),ctx=canvas.getContext('2d'),width=canvas.width,height=canvas.height;
  ctx.clearRect(0,0,width,height);ctx.fillStyle='#091826';ctx.fillRect(0,0,width,height);
  if(!bounds){ctx.fillStyle='#aac2ce';ctx.textAlign='center';ctx.font='15px system-ui';ctx.fillText(words[language].noBounds,width/2,height/2);return;}
  const mins=bounds.min,maxes=bounds.max;
  const ranges=maxes.map((v,i)=>v-mins[i]);const maximum=Math.max(...ranges,0.1);
  const scale=105/maximum;
  const center=mins.map((v,i)=>(v+maxes[i])/2);
  const project=p=>{const x=(p[0]-center[0])*scale,y=(p[1]-center[1])*scale,z=(p[2]-center[2])*scale;
    return[width/2+(x-z)*0.94,height/2-y*1.0+(x+z)*0.30];};
  const corners=[];
  for(let i=0;i<8;i++)corners.push(project([i&1?maxes[0]:mins[0],i&2?maxes[1]:mins[1],i&4?maxes[2]:mins[2]]));
  ctx.strokeStyle='#8de6db';ctx.lineWidth=1.8;
  const edges=[[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]];
  for(const [a,b] of edges){ctx.beginPath();ctx.moveTo(...corners[a]);ctx.lineTo(...corners[b]);ctx.stroke();}
  ctx.font='13px system-ui';ctx.textAlign='left';ctx.fillStyle='#acc4d5';
  ctx.fillText('X '+ranges[0].toFixed(3)+'  Y '+ranges[1].toFixed(3)+'  Z '+ranges[2].toFixed(3),15,22);
  ctx.fillText('Bounds derived from accessor min/max (not world-transformed) / 局部包围盒',15,height-10);
}
function show(){
  if(!latest)return;
  const t=words[language],model=latest;
  metrics.replaceChildren();tags.replaceChildren();issues.replaceChildren();
  const entries=[['Format',model.format],['File / 文件',formatBytes(model.stats.bytes)],
    ['Meshes / 网格',model.stats.meshes],['Triangles / 三角面*',model.stats.triangles],
    ['Vertices / 顶点*',model.stats.vertices],['Nodes / 节点',model.stats.nodes],
    ['Accessors',model.stats.accessors],['Materials / 材质',model.stats.materials],
    ['External / 外部',model.stats.externalBuffers]];
  for(const [label,value] of entries){
    const cell=text('div','', 'metric');cell.append(text('b',String(value)));cell.append(text('small',label));metrics.append(cell);
  }
  for(const [label,value] of [[t.errors,model.counts.errors],[t.warnings,model.counts.warnings],
    ['Status',model.status],['File',model.name]]){
    tags.append(text('span',label+': '+value,'tag'));
  }
  drawBounds(model.bounds);
  if(model.issues.length){
    for(const issue of model.issues){
      const el=text('div','','issue');el.dataset.severity=issue.severity;
      el.append(text('strong',issue.severity.toUpperCase()+' · '+issue.code));
      el.append(text('small',issue.where));
      el.append(text('p',issue[language]));issues.append(el);
    }
  }else issues.append(text('p',t.ok,'note'));
  issues.append(text('p',model.notice[language]+' * Triangle counts are estimated from primitive modes/indices; compressed geometry is not decoded. / 三角面数按元数据估算，未解码压缩几何。','note'));
  $('empty').hidden=true;report.hidden=false;
  status.textContent=t.ready+' — '+model.name;
  exportBtn.disabled=false;
}
async function inspect(data,name){
  try{latest=inspectModel(data,name);show();}
  catch(err){latest=null;exportBtn.disabled=true;report.hidden=true;$('empty').hidden=false;
    status.textContent=words[language].bad+': '+(language==='zh'?(err.zh||err.message):err.message);
    status.classList.add('danger');
    window.__oiaInspectorLastError={code:err.code||'UNKNOWN',message:err.message};
    return;}
  status.classList.remove('danger');window.__oiaInspectorLastError=null;
}
async function inspectFile(file){
  if(!file)return;
  if(file.size>MAX_BYTES){latest=null;exportBtn.disabled=true;report.hidden=true;$('empty').hidden=false;status.classList.add('danger');status.textContent=language==='zh'?'文件超过 64 MiB 限制':'File exceeds 64 MiB limit';window.__oiaInspectorLastError={code:'SIZE',message:'File exceeds 64 MiB limit'};return;}
  const data=new Uint8Array(await file.arrayBuffer());await inspect(data,file.name);
}
input.addEventListener('change',()=>inspectFile(input.files?.[0]));
for(const name of ['dragenter','dragover']){
  drop.addEventListener(name,e=>{e.preventDefault();drop.classList.add('over');});
}
for(const name of ['dragleave','drop']){
  drop.addEventListener(name,e=>{e.preventDefault();drop.classList.remove('over');});
}
drop.addEventListener('drop',e=>inspectFile(e.dataTransfer?.files?.[0]));
$('sample').addEventListener('click',()=>inspect(demoGlb(),demoName));
$('language').addEventListener('click',()=>{
  language=language==='zh'?'en':'zh';
  $('language').textContent=language==='zh'?'English':'中文';
  if(latest)show();
});
exportBtn.addEventListener('click',()=>{
  if(!latest)return;
  const blob=new Blob([JSON.stringify(latest,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='oia-glb-preflight-report.json';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
window.__oiaInspector=Object.freeze({getReport:()=>latest,getError:()=>window.__oiaInspectorLastError});
