/* NeuroTrace V1.4: synthetic 3D multi-case tracing, no science truth claims.
   Endpoints are references to actual segment terminal vertices. User-created
   edges use stable endpoint IDs and can be selected with projected edge hit-tests.
   UI-only illustration: no microscopy measurements or expert validation. */
(()=>{'use strict';
const T=[
{id:'C-101',name:'皮层主干断点',condition:'清晰 / 单处断裂',hint:'观察两个主干末端和邻近支路。连线结果只是你的推测，非系统给出的标准答案。',camera:[-.35,.22],segments:[
['a',[[-3.3,-.4,-.5],[-2.5,-.35,-.32],[-1.8,-.08,-.18],[-1.1,.12,-.08],[-.46,.23,.08]]],['b',[[.43,.27,.18],[1.1,.35,.04],[1.8,.55,-.35],[2.6,.82,-.47],[3.18,1.08,-.7]]],
['c',[[-1.8,-.08,-.18],[-1.95,.7,-.65],[-1.72,1.38,-1.1]]],['d',[[1.8,.55,-.35],[2.05,1.3,-.7],[2.32,1.85,-1.2]]],['e',[[-2.5,-.35,-.32],[-2.8,-1.1,-.55],[-3.05,-1.7,-.9]]],['f',[[1.1,.35,.04],[1.3,-.55,.58],[1.65,-1.3,.89]]]],candidates:['a:end','b:start','c:end','d:end','e:end','f:end']},
{id:'H-204',name:'海马分叉重建',condition:'多分叉 / 多候选',hint:'三个分支末端并不意味着只有一种配对方式。比较空间走向、端点距离及分支纹理。',camera:[-.52,.32],segments:[
['a',[[-3.0,.6,-.9],[-2.3,.35,-.6],[-1.5,.1,-.3],[-.65,-.2,0]]],['b',[[.16,-.33,.2],[.72,-.55,.6],[1.6,-.95,.7],[2.7,-1.45,.9]]],['c',[[-1.5,.1,-.3],[-1.3,.9,-.65],[-.75,1.55,-1.1],[-.32,2.05,-1.35]]],['d',[[.62,1.7,-1.05],[1.0,1.1,-.8],[1.2,.65,-.5]]],['e',[[-2.3,.35,-.6],[-2.55,-.5,-1.1],[-2.85,-1.3,-1.4]]],['f',[[2.9,.8,1.35],[2.2,.6,.9],[1.55,.36,.38]]],['g',[[.5,-1.7,-1.45],[.85,-1.12,-.98],[1.22,-.55,-.5]]]],candidates:['a:end','b:start','c:end','d:start','f:end','g:end']},
{id:'T-315',name:'丘脑交叉歧义',condition:'投影交叉 / 深度差',hint:'两条纤维在屏幕上可能相交，但三维空间中距离很远。建议切换侧视与俯视比较。',camera:[.22,.12],segments:[
['a',[[-3,-1.3,-1.1],[-2,-.7,-.8],[-1.1,.05,-.3],[-.26,.48,.35]]],['b',[[.65,.78,.64],[1.35,1.25,.87],[2.35,1.6,1.2]]],['c',[[-2.7,1.8,1.6],[-1.8,.95,1.25],[-.72,-.05,1.55],[.24,-.92,1.9]]],['d',[[1.2,-1.5,1.92],[1.94,-.82,1.62],[2.75,-.14,1.3]]],['e',[[-2.2,-1.75,-.5],[-1.15,-1.1,-.8],[-.28,-.56,-1.15]]],['f',[[.62,-.17,-1.48],[1.5,.23,-1.26],[2.3,.85,-1.1]]]],candidates:['a:end','b:start','c:end','d:start','e:end','f:start']},
{id:'V-426',name:'低信噪比片段',condition:'弱信号 / 局部缺失',hint:'弱信号区域仅作为视觉模拟。观察亮度差异及邻近拓扑，不要仅凭亮度判断连通。',camera:[-.58,.23],segments:[
['a',[[-3.0,-.7,-.7],[-2.1,-.42,-.5],[-1.3,-.2,-.21],[-.68,.04,.1]]],['b',[[.4,.12,.18],[1.1,.45,.26],[2.1,.75,.45],[3,1,.63]]],['c',[[-1.3,-.2,-.21],[-1.54,.48,.28],[-1.8,1.18,.7]]],['d',[[1.1,.45,.26],[1.38,-.4,.12],[1.55,-1.2,-.05]]],['e',[[-3,1.6,1.5],[-2.1,1.35,1.4],[-1.2,1.08,1.1]]],['f',[[.1,1.22,1.02],[.9,1.4,.9],[1.7,1.6,.7]]],['g',[[-.8,-1.6,-1.0],[-.25,-1.1,-.72],[.28,-.65,-.45]]]],candidates:['a:end','b:start','c:end','d:end','e:end','f:start','g:end']},
{id:'D-537',name:'致密神经末梢',condition:'高密度 / 多重干扰',hint:'背景纤维密集、候选端点多。建议先调整对比度再绕转三维视角，不要求把所有端点两两连接。',camera:[-.3,.45],segments:[
['a',[[-3,-.4,-1],[-2.15,-.3,-.55],[-1.35,-.2,-.1],[-.52,-.02,.25]]],['b',[[.18,.12,.42],[1,.42,.68],[1.7,.85,.83],[2.62,1.22,1.0]]],['c',[[-2.1,1.8,-1.25],[-1.42,1.3,-.94],[-.7,.92,-.58]]],['d',[[.23,.67,-.42],[.85,.3,-.6],[1.66,-.36,-.92],[2.58,-.95,-1.3]]],['e',[[-2.6,-1.7,1.38],[-1.8,-1.1,.95],[-.88,-.72,.7]]],['f',[[.18,-.42,.85],[.85,-.98,.9],[1.53,-1.62,.96]]],['g',[[-2.82,.8,.75],[-2.05,.62,.46],[-1.42,.55,.13]]],['h',[[1.5,1.9,-.6],[2,1.55,-.5],[2.65,1.15,-.3]]],['i',[[-.8,-1.88,-1.35],[.1,-1.53,-1.2],[1.03,-1.3,-1.09]]]],candidates:['a:end','b:start','c:end','d:start','e:end','f:start','g:end','h:start','i:end']}
];
const boundaryTerminalMap={
  'C-101':['a:start','b:end','e:end'],
  'H-204':['a:start','b:end','c:end'],
  'T-315':['a:start','c:start','d:end'],
  'V-426':['a:start','b:end','e:start'],
  'D-537':['a:start','b:end','e:start','h:end']
};
const TASKS=T.map(o=>({...o,segments:o.segments.map(([id,p])=>({id,p})),gap:[o.candidates[0],o.candidates[1]],boundaryTerminals:boundaryTerminalMap[o.id]||[]}));
function isBoundaryTerminal(taskIndex,endpointId){return taskAt(taskIndex).boundaryTerminals.includes(endpointId);}

function taskAt(n){return TASKS[Math.min(Math.max(n||0,0),TASKS.length-1)];}
function endpointsFor(n){const t=taskAt(n);return t.candidates.map(ref=>{const [id,terminal]=ref.split(':');const s=t.segments.find(x=>x.id===id);const p=terminal==='start'?s.p[0]:s.p[s.p.length-1];return {id:ref,segment:id,terminal,xyz:[...p],boundary:isBoundaryTerminal(n,ref)};});}
function allEndpointsFor(n){const t=taskAt(n);return t.segments.flatMap(s=>[{id:s.id+':start',segment:s.id,terminal:'start',xyz:[...s.p[0]],boundary:isBoundaryTerminal(n,s.id+':start')},{id:s.id+':end',segment:s.id,terminal:'end',xyz:[...s.p[s.p.length-1]],boundary:isBoundaryTerminal(n,s.id+':end')}]);}
function endpointData(n){const e=endpointsFor(n);return {a:e[0],b:e[1]};}
function catmull(a,b,c,d,t){return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}
function resample(pts,steps=9){let o=[];for(let i=0;i<pts.length-1;i++){for(let j=0;j<steps;j++){let u=j/steps,p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(i+2,pts.length-1)];o.push([0,1,2].map(k=>catmull(p0[k],p1[k],p2[k],p3[k],u)));}}o.push([...pts.at(-1)]);return o;}
function pointSegmentDistance(px,py,x1,y1,x2,y2){const vx=x2-x1,vy=y2-y1,den=vx*vx+vy*vy;const t=den?Math.max(0,Math.min(1,((px-x1)*vx+(py-y1)*vy)/den)):0;return Math.hypot(px-(x1+t*vx),py-(y1+t*vy));}
// Topological path connectivity: original polyline vertices are joined only when
// the same 3D vertex is shared; projected 2D crossings do NOT imply connections.
function originalConnected(taskIndex,from,to){
 const task=taskAt(taskIndex),parent=new Map();
 const key=v=>v.map(n=>Math.round(n*10000)).join(':');
 function root(x){if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,root(parent.get(x)));return parent.get(x)}
 function join(a,b){const ra=root(a),rb=root(b);if(ra!==rb)parent.set(ra,rb)}
 for(const seg of task.segments)for(let i=1;i<seg.p.length;i++)join(key(seg.p[i-1]),key(seg.p[i]));
 const refs=Object.fromEntries(allEndpointsFor(taskIndex).map(e=>[e.id,e]));
 if(!refs[from]||!refs[to])return false;
 return root(key(refs[from].xyz))===root(key(refs[to].xyz));
}
function connectionExists(taskIndex,edges,from,to){
 if(isBoundaryTerminal(taskIndex,from)||isBoundaryTerminal(taskIndex,to))return 'boundary';
 if(originalConnected(taskIndex,from,to))return 'original';
 const taskId=taskAt(taskIndex).id;
 if(edges.some(e=>e.taskId===taskId&&((e.from===from&&e.to===to)||(e.from===to&&e.to===from))))return 'added';
 return null;
}
function create(container,appState,onPick){
if(!container)return null;const canvas=document.createElement('canvas');canvas.className='nerve-canvas';canvas.setAttribute('aria-label','三维合成神经骨架，点击端点连线，点击高亮的新增连边选中删除');container.appendChild(canvas);const ctx=canvas.getContext('2d');if(!ctx)return null;
const task=taskAt(appState.taskIndex),endpoints=allEndpointsFor(appState.taskIndex),refs=Object.fromEntries(endpoints.map(e=>[e.id,e]));
const preset=task.camera||[-.38,.25];const cam=appState.camera3d||{yaw:preset[0],pitch:preset[1],panX:0,panY:0,zoom:1};appState.camera3d=cam;
const segments=task.segments.map(s=>({id:s.id,p:resample(s.p),main:s.id==='a'||s.id==='b'}));
let size={w:380,h:430},active=true,frameId=0;const listeners=[],pointers=new Map();let start=null,gesture=null,dragged=false;
function listen(k,target,fn,opt){target.addEventListener(k,fn,opt);listeners.push(()=>target.removeEventListener(k,fn,opt));}
function resize(){size={w:Math.max(1,container.clientWidth),h:Math.max(1,container.clientHeight)};let dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(size.w*dpr);canvas.height=Math.round(size.h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);canvas.style.width=size.w+'px';canvas.style.height=size.h+'px';}
function project(p){let a=Math.cos(cam.yaw),b=Math.sin(cam.yaw),c=Math.cos(cam.pitch),d=Math.sin(cam.pitch);let x=a*p[0]-b*p[2],z=b*p[0]+a*p[2],y=c*p[1]-d*z,zz=d*p[1]+c*z;let f=Math.min(size.w/8.2,size.h/8.2)*1.05*cam.zoom*(8.8/(8.8+zz));return {x:size.w*.5+cam.panX+x*f,y:size.h*.49+cam.panY-y*f,z:zz};}
const projectedEndpoints=()=>Object.fromEntries(endpoints.map(e=>[e.id,project(e.xyz)]));
function drawAxis(){
 const ox=31,oy=size.h-34,scale=26;
 const vectors=[['X',[1,0,0],'#f87879'],['Y',[0,1,0],'#8be8b0'],['Z',[0,0,1],'#77bdff']];
 ctx.save();ctx.globalAlpha=.9;
 for(const [label,v,color] of vectors){const a=Math.cos(cam.yaw),b=Math.sin(cam.yaw),c=Math.cos(cam.pitch),d=Math.sin(cam.pitch);
 const xx=a*v[0]-b*v[2],zz=b*v[0]+a*v[2],yy=c*v[1]-d*zz;
 const x=ox+xx*scale,y=oy-yy*scale;
 ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(x,y);ctx.lineWidth=1.7;ctx.strokeStyle=color;ctx.stroke();
 ctx.fillStyle=color;ctx.font='bold 10px system-ui';ctx.fillText(label,x+Math.sign(xx||1)*5,y-3);
 }
 dot({x:ox,y:oy},3,'#dbeaff',4);ctx.restore();
}

function stroke(pts,color,width,blur=0,dash=[]){ctx.save();ctx.beginPath();pts.forEach((p,i)=>{let q=project(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.setLineDash(dash);ctx.stroke();ctx.restore();}
function dot(p,r,color,glow=0){ctx.save();ctx.beginPath();ctx.arc(p.x,p.y,r,0,2*Math.PI);ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=glow;ctx.fill();ctx.restore();}
function draw(t){if(!active)return;const {w,h}=size;ctx.clearRect(0,0,w,h);
const themes={cyan:{line:'#58d3ff',soft:'#157bc2',edge:'#ffcb80',bg:'#041830'},violet:{line:'#c69cff',soft:'#6f59bd',edge:'#ffd392',bg:'#140e35'},contrast:{line:'#f4faff',soft:'#3486c6',edge:'#ffbb40',bg:'#020911'},mint:{line:'#7ff1b8',soft:'#2c9d91',edge:'#f4cf8c',bg:'#031c18'},amber:{line:'#ffbd75',soft:'#92601c',edge:'#79eaff',bg:'#231409'}};
const theme=themes[appState.palette]||themes.cyan;let contrast=(appState.contrast||100)/100;const imaging=appState.renderStyle==='imaging';
let gradient=ctx.createRadialGradient(w*.5,h*.53,0,w*.5,h*.5,w*.74);gradient.addColorStop(0,theme.bg);gradient.addColorStop(1,'rgba(2,8,20,.18)');ctx.globalAlpha=Math.min(.43,.18+.13*contrast);ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
const box=[[-3.7,-2.4,-2.3],[3.7,-2.4,-2.3],[3.7,2.4,-2.3],[-3.7,2.4,-2.3],[-3.7,-2.4,2.3],[3.7,-2.4,2.3],[3.7,2.4,2.3],[-3.7,2.4,2.3]];
if(!imaging)[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(([a,b])=>stroke([box[a],box[b]],'rgba(56,172,240,.28)',1));
if(imaging){for(let j=0;j<130;j++){const x=((j*91.31)%w),y=((j*71.13)%h);dot({x,y},.35+((j*7)%4)*.24,'rgba(76,190,246,.13)',1.4);}}
if(task.id==='D-537')for(let i=0;i<44;i++){const z=(i*.618%1)*3.4-1.7,x=(i*1.417%1)*7-3.5,y=(i*.729%1)*4-2;dot(project([x,y,z]),.95,'rgba(45,145,227,.35)',4)}
segments.sort((a,b)=>project(a.p[Math.floor(a.p.length/2)]).z-project(b.p[Math.floor(b.p.length/2)]).z).forEach(s=>{let weak=task.id==='V-426'&&['c','e','f'].includes(s.id);let alpha=weak?(.16+.20*contrast):Math.min(1,.43+.42*contrast);ctx.globalAlpha=alpha;
if(imaging){stroke(s.p,theme.soft,s.main?23:14,28);stroke(s.p,theme.line,s.main?5.8:3.8,17);stroke(s.p,'rgba(211,241,255,.54)',s.main?1.9:.9,8);}else{stroke(s.p,theme.soft,s.main?8:4,7);stroke(s.p,theme.line,s.main?3.5:2,3);stroke(s.p,'rgba(237,251,255,.85)',s.main?1:.5,0);}
if(appState.selectedOriginalSegmentId===s.id){ctx.globalAlpha=1;stroke(s.p,'#ffe0a0',5.2,14);stroke(s.p,'#fff4d6',1.5,0);}ctx.globalAlpha=1;});
const lookup=projectedEndpoints();const currentEdges=appState.addedEdges.filter(e=>e.taskId===task.id);currentEdges.forEach(e=>{const a=refs[e.from],b=refs[e.to];if(!a||!b)return;const sel=appState.selectedEdgeId===e.id;stroke([a.xyz,b.xyz],sel?'#fff1ad':theme.edge,sel?6.5:4.5,sel?20:12);stroke([a.xyz,b.xyz],sel?'#f3faff':'#fff5d9',1.25,4);let aP=lookup[e.from],bP=lookup[e.to];dot({x:(aP.x+bP.x)/2,y:(aP.y+bP.y)/2},sel?5:3,sel?'#fff3b0':theme.edge,9);});
if(appState.selectedNodes.length===1){const a=refs[appState.selectedNodes[0]];if(a)dot(lookup[a.id],11,'rgba(255,205,124,.28)',16);}
endpoints.forEach((e,i)=>{
 const p=lookup[e.id],boundary=e.boundary, selected=appState.selectedNodes.includes(e.id),hoverBoundary=appState.selectedBoundaryEndpointId===e.id;
 const linked=currentEdges.some(x=>x.from===e.id||x.to===e.id);
 const revealed=(boundary&&appState.endpointsVisible)||selected||hoverBoundary;
 const baseColor=boundary?'#ff7e86':selected?'#ffd784':'rgba(129,231,255,.72)';
 dot(p,selected?7.5:boundary&&appState.endpointsVisible?5.2:3.2,baseColor,selected?14:5);
 if(revealed){
  dot(p,hoverBoundary?12:8,boundary?'rgba(244,91,109,.20)':linked?'rgba(112,247,174,.34)':'rgba(65,218,250,.3)',14);
  ctx.save();ctx.strokeStyle=boundary?'#ff8f96':selected?'#ffda8d':'#86e7ff';ctx.lineWidth=selected?3:1.8;
  ctx.beginPath();ctx.arc(p.x,p.y,selected?13:11,0,Math.PI*2);ctx.stroke();
  if(boundary){ctx.beginPath();ctx.moveTo(p.x-6,p.y+6);ctx.lineTo(p.x+6,p.y-6);ctx.stroke();}
  if(!boundary){
   ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillStyle='#e4faff';
   ctx.fillText(e.terminal==='start'?'S':'E',p.x,p.y-18);
  }
  ctx.restore();
 }
});

drawAxis();frameId=requestAnimationFrame(draw);}
function pick(x,y){
 const pts=projectedEndpoints();const current=appState.addedEdges.filter(e=>e.taskId===task.id);
 // Direct endpoint selection, no "末端" mode required. Larger invisible hit region for touch.
 let node=null;for(const e of endpoints){const p=pts[e.id],dist=Math.hypot(p.x-x,p.y-y);
 const radius=(appState.selectedOriginalSegmentId===e.segment||appState.selectedNodes.includes(e.id))?26:21;
 if(dist<radius&&(!node||dist<node.dist))node={type:'node',id:e.id,dist};}
 if(node&&node.dist<16)return node;
 let edge=null;for(const e of current){const a=pts[e.from],b=pts[e.to];if(!a||!b)continue;
 const dist=pointSegmentDistance(x,y,a.x,a.y,b.x,b.y);
 if(dist<13&&(!edge||dist<edge.dist))edge={type:'edge',id:e.id,dist};}
 if(edge&&(!node||edge.dist<node.dist*.8))return edge;
 if(node)return node;
 let segment=null;for(const s of segments)for(let i=1;i<s.p.length;i++){
 const a=project(s.p[i-1]),b=project(s.p[i]),dist=pointSegmentDistance(x,y,a.x,a.y,b.x,b.y);
 if(dist<14&&(!segment||dist<segment.dist))segment={type:'original-segment',id:s.id,dist};
 }
 return edge||segment;
}
const local=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*size.w/r.width,y:(e.clientY-r.top)*size.h/r.height};};
listen('pointerdown',canvas,e=>{let p=local(e);canvas.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{...p,prev:p});if(pointers.size===1){start=p;dragged=false}if(pointers.size===2){let z=[...pointers.values()];gesture={dist:Math.hypot(z[0].x-z[1].x,z[0].y-z[1].y),center:{x:(z[0].x+z[1].x)/2,y:(z[0].y+z[1].y)/2}}}});
listen('pointermove',canvas,e=>{if(!pointers.has(e.pointerId))return;const p=local(e),v=pointers.get(e.pointerId),dx=p.x-v.prev.x,dy=p.y-v.prev.y;v.prev=p;v.x=p.x;v.y=p.y;if(Math.hypot(dx,dy)>1.4)dragged=true;if(pointers.size>=2){let z=[...pointers.values()],dist=Math.hypot(z[0].x-z[1].x,z[0].y-z[1].y),center={x:(z[0].x+z[1].x)/2,y:(z[0].y+z[1].y)/2};if(gesture){cam.zoom=Math.max(.45,Math.min(3.7,cam.zoom*dist/Math.max(1,gesture.dist)));cam.panX+=center.x-gesture.center.x;cam.panY+=center.y-gesture.center.y;}gesture={dist,center};return;}if(e.shiftKey||(e.buttons&2)){cam.panX+=dx;cam.panY+=dy}else{cam.yaw+=dx*.008;cam.pitch=((cam.pitch-dy*.008+Math.PI)%(Math.PI*2)+(Math.PI*2))%(Math.PI*2)-Math.PI;}});
listen('pointerup',canvas,e=>{let p=local(e),click=start&&pointers.size===1&&Math.hypot(p.x-start.x,p.y-start.y)<7&&!dragged;if(click){let selected=pick(p.x,p.y);if(selected)onPick(selected);}pointers.delete(e.pointerId);if(!pointers.size)start=null;if(pointers.size<2)gesture=null;});
listen('pointercancel',canvas,e=>pointers.delete(e.pointerId));listen('wheel',canvas,e=>{e.preventDefault();cam.zoom=Math.max(.45,Math.min(3.7,cam.zoom*Math.exp(-e.deltaY*.001)));},{passive:false});listen('contextmenu',canvas,e=>e.preventDefault());
const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(container);resize();frameId=requestAnimationFrame(draw);
return {canvas,task,endpoints,projectedEndpoints,projectPoint:project,camera:cam,pick,reset(){Object.assign(cam,{yaw:preset[0],pitch:preset[1],panX:0,panY:0,zoom:1});},dispose(){active=false;cancelAnimationFrame(frameId);observer?.disconnect();listeners.forEach(x=>x());canvas.remove();}};
}
window.NeuroTrace3D={TASKS,taskAt,endpointsFor,allEndpointsFor,endpointData,isBoundaryTerminal,originalConnected,connectionExists,pointSegmentDistance,create};
})();
