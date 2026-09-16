const els={
tree:document.getElementById('tree'), search:document.getElementById('search'),
json:document.getElementById('jsonEditor'), file:document.getElementById('fileInput'),
screen:document.getElementById('screen'), stage:document.getElementById('stage'),
empty:document.getElementById('emptyInspector'), inspector:document.getElementById('inspector'),
name:document.getElementById('propName'),x:document.getElementById('propX'),y:document.getElementById('propY'),
w:document.getElementById('propW'),h:document.getElementById('propH'),text:document.getElementById('propText'),
type:document.getElementById('propType'),selection:document.getElementById('selectionLabel')
};
let model={screen:{width:1280,height:720},elements:[]}, selected=null, zoom=1;

const demo={
  "screen":{"width":1280,"height":720},
  "elements":[
    {"id":"status","name":"STATUS","type":"Label","x":640,"y":75,"w":220,"h":45,"text":"STATUS"},
    {"id":"health","name":"HEALTH","type":"Button","x":285,"y":210,"w":480,"h":58,"text":"HEALTH  20"},
    {"id":"str","name":"STR","type":"Button","x":285,"y":280,"w":480,"h":58,"text":"STR  0"},
    {"id":"speed","name":"SPEED","type":"Button","x":285,"y":350,"w":480,"h":58,"text":"SPEED  0"},
    {"id":"multi","name":"MULTI","type":"Button","x":285,"y":420,"w":480,"h":58,"text":"MULTI  0"},
    {"id":"regen","name":"REGEN","type":"Button","x":285,"y":490,"w":480,"h":58,"text":"REGEN  0"},
    {"id":"tp","name":"TP","type":"Button","x":285,"y":560,"w":480,"h":58,"text":"TP  0"},
    {"id":"close","name":"FECHAR","type":"Button","x":1215,"y":35,"w":40,"h":40,"text":"×"}
  ]
};

function loadObject(obj){
  if(!obj||!Array.isArray(obj.elements)) throw new Error("Este V1 espera um JSON de preview com {screen,elements[]}.");
  model=structuredClone(obj); selected=null; render(); syncJson();
}
function syncJson(){els.json.value=JSON.stringify(model,null,2)}
function renderTree(){
  const q=els.search.value.toLowerCase(); els.tree.innerHTML='';
  model.elements.filter(e=>(e.name+e.id+e.type+e.text).toLowerCase().includes(q)).forEach(e=>{
    const d=document.createElement('div'); d.className='tree-item'+(selected?.id===e.id?' selected':'');
    d.textContent=(e.type==='Button'?'🔘 ':e.type==='Label'?'🔤 ':e.type==='Image'?'🖼️ ':'⬜ ')+e.name;
    d.onclick=()=>select(e.id); els.tree.appendChild(d);
  });
}
function renderCanvas(){
  els.screen.querySelectorAll('.editor-el').forEach(n=>n.remove());
  model.elements.forEach(e=>{
    const n=document.createElement('div'); n.className='editor-el '+(e.type==='Button'?'ui-button':'');
    n.dataset.id=e.id; n.textContent=e.text||e.name;
    if(e.type==='Label'){n.style.fontWeight='800';n.style.fontSize='28px';n.style.letterSpacing='2px';n.style.textAlign='center';n.style.padding='5px'}
    if(e.type==='Image'){n.style.background='#333'}
    n.style.left=(e.x/model.screen.width*100)+'%'; n.style.top=(e.y/model.screen.height*100)+'%';
    n.style.width=(e.w/model.screen.width*100)+'%'; n.style.height=(e.h/model.screen.height*100)+'%';
    n.style.transform='translate(-50%,-50%)';
    n.style.minHeight='0'; n.style.cursor='grab'; n.style.zIndex=e.type==='Label'?5:3;
    n.onpointerdown=startDrag; els.screen.appendChild(n);
  });
  const n=els.screen.querySelector(`[data-id="${selected?.id}"]`); if(n)n.classList.add('selected-el');
}
function render(){renderTree();renderCanvas();updateInspector()}
function select(id){selected=model.elements.find(e=>e.id===id)||null;render()}
function updateInspector(){
  if(!selected){els.empty.hidden=false;els.inspector.hidden=true;els.selection.textContent='Nenhum elemento selecionado';return}
  els.empty.hidden=true;els.inspector.hidden=false;els.selection.textContent='Selecionado: '+selected.name;
  els.name.value=selected.name;els.x.value=Math.round(selected.x);els.y.value=Math.round(selected.y);
  els.w.value=Math.round(selected.w);els.h.value=Math.round(selected.h);els.text.value=selected.text||'';els.type.value=selected.type||'Label';
}
function bindProp(input,key,parser=v=>v){input.addEventListener('input',()=>{if(!selected)return;selected[key]=parser(input.value);renderCanvas();renderTree()})}
bindProp(els.name,'name');bindProp(els.x,'x',Number);bindProp(els.y,'y',Number);bindProp(els.w,'w',Number);bindProp(els.h,'h',Number);bindProp(els.text,'text');bindProp(els.type,'type');

document.querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{
 if(!selected)return; const d=b.dataset.nudge;
 if(d==='up')selected.y-=1;if(d==='down')selected.y+=1;if(d==='left')selected.x-=1;if(d==='right')selected.x+=1;
 updateInspector();renderCanvas();syncJson();
});
document.getElementById('deleteBtn').onclick=()=>{if(selected){model.elements=model.elements.filter(e=>e.id!==selected.id);selected=null;render();syncJson()}};
function startDrag(ev){
 const id=ev.currentTarget.dataset.id; select(id); const e=selected; const start={x:ev.clientX,y:ev.clientY,ex:e.x,ey:e.y};
 ev.currentTarget.setPointerCapture(ev.pointerId);
 const move=mv=>{const r=els.screen.getBoundingClientRect();e.x=start.ex+(mv.clientX-start.x)*(model.screen.width/r.width);e.y=start.ey+(mv.clientY-start.y)*(model.screen.height/r.height);updateInspector();renderCanvas()};
 const up=()=>{ev.currentTarget.removeEventListener('pointermove',move);ev.currentTarget.removeEventListener('pointerup',up);syncJson()};
 ev.currentTarget.addEventListener('pointermove',move);ev.currentTarget.addEventListener('pointerup',up);
}
document.getElementById('applyJson').onclick=()=>{try{loadObject(JSON.parse(els.json.value))}catch(e){alert(e.message)}};
document.getElementById('copyJson').onclick=async()=>{await navigator.clipboard.writeText(els.json.value);alert('JSON copiado!')};
els.file.onchange=async ev=>{const f=ev.target.files[0];if(!f)return;try{loadObject(JSON.parse(await f.text()))}catch(e){alert('Não consegui abrir: '+e.message)}};
document.getElementById('exportBtn').onclick=()=>{const b=new Blob([JSON.stringify(model,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='menus-preview.json';a.click();URL.revokeObjectURL(a.href)};
document.getElementById('loadDemo').onclick=()=>loadObject(demo);
els.search.oninput=renderTree;
document.getElementById('zoomIn').onclick=()=>setZoom(zoom+.1);
document.getElementById('zoomOut').onclick=()=>setZoom(Math.max(.5,zoom-.1));
document.getElementById('resetView').onclick=()=>setZoom(1);
function setZoom(z){zoom=Math.round(z*10)/10;els.stage.style.transform=`scale(${zoom})`;document.getElementById('zoomLabel').textContent=Math.round(zoom*100)+'%'}
document.getElementById('resolution').onchange=ev=>{const [w,h]=ev.target.value.split('x').map(Number);model.screen={width:w,height:h};render();syncJson()};

loadObject(demo);