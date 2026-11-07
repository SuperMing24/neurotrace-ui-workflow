window.NeuroSky=(()=>{
 const modes={hubei:'朝武汉 · 广角',taurus:'金牛座 · 近景'};
 let mode='hubei';
 try{const v=localStorage.getItem('nt-sky20');if(Object.hasOwn(modes,v))mode=v;}catch{}
 function paint(){document.documentElement.dataset.skyView=mode;}
 function controls(){
  return '<section class="sky20-tools"><strong>观星方向</strong><small>深圳 · 4 月 23 日 19:40</small><div>'+
   Object.entries(modes).map(([id,text])=>'<button type="button" data-sky-view="'+id+'" aria-pressed="'+(id===mode)+'">'+text+'</button>').join('')+
   '</div><p>'+(mode==='hubei'?'正前方指向武汉，金牛座在左侧西方低空。':'由武汉方向左转约 82°，近看牛脸、双角与靠近地平的后部。')+'</p></section>';
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('button[data-sky-view]');
  if(!b||!Object.hasOwn(modes,b.dataset.skyView))return;
  mode=b.dataset.skyView;paint();try{localStorage.setItem('nt-sky20',mode)}catch{}
  b.closest('.sky20-tools').outerHTML=controls();
  document.querySelector('.sky20-tools [aria-pressed="true"]')?.focus({preventScroll:true});
 });
 paint();return{controls};
})();
