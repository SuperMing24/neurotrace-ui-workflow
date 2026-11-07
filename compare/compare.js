(async()=>{
 const res=await fetch('/review/catalog.json',{cache:'no-cache'});if(!res.ok)throw Error();
 const {versions,current}=await res.json(),ids=new Set(versions.map(v=>v.id));
 const qs=new URLSearchParams(location.search);
 const values={a:qs.get('a'),b:qs.get('b')};
 if(!ids.has(values.a))values.a=versions[1]?.id||current;
 if(!ids.has(values.b))values.b=current;
 const addr=()=>'/compare/?'+new URLSearchParams(values);
 function draw(slot){
  const key=slot.dataset.slot,id=values[key],path='/history/'+id+'/';
  slot.querySelector('iframe').src=path+'?panel=1';slot.querySelector('.open').href=path;
  slot.querySelector('select').value=id;
 }
 function hydrate(){
  for(const [key,slot] of slots){const id=new URLSearchParams(location.search).get(key);if(ids.has(id)&&values[key]!==id){values[key]=id;draw(slot);}}
 }
 const slots=new Map();
 for(const slot of document.querySelectorAll('[data-slot]')){
  const key=slot.dataset.slot,select=slot.querySelector('select');slots.set(key,slot);
  for(const v of versions)select.add(new Option('V'+v.id+' · '+v.label,v.id));
  select.addEventListener('change',()=>{values[key]=select.value;draw(slot);history.pushState(null,'',addr());});
  draw(slot);
 }
 history.replaceState(null,'',addr());window.addEventListener('popstate',hydrate);
 const deck=document.querySelector('.panels'),tabs=document.querySelectorAll('[data-show]');
 for(const b of tabs)b.addEventListener('click',()=>{deck.dataset.visible=b.dataset.show;tabs.forEach(t=>t.setAttribute('aria-pressed',String(t===b)));});
 document.querySelector('#copy').addEventListener('click',async()=>{
  const el=document.getElementById('msg');try{await navigator.clipboard.writeText(location.href);el.textContent='已复制这两个版本的对照链接。';}catch{el.textContent='地址栏中的网址就是这组对照的固定链接。';}
 });
})().catch(()=>{document.getElementById('msg').textContent='版本目录暂未加载，请刷新重试。';});
