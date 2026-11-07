window.NeuroSky=(()=>{
 const modes={focus:'金牛取景',taurus:'星座全貌',hubei:'武汉广角'};
 let mode='focus';
 try{const v=localStorage.getItem('nt-sky21');if(Object.hasOwn(modes,v))mode=v;}catch{}
 function paint(){document.documentElement.dataset.skyView=mode;}
 function controls(){
  return '<section class="sky20-tools"><strong>观星方向</strong><small>深圳 · 4 月 23 日 19:40</small><div>'+
   Object.entries(modes).map(([id,text])=>'<button type="button" data-sky-view="'+id+'" aria-pressed="'+(id===mode)+'">'+text+'</button>').join('')+
   '</div><p>'+({focus:'沿着银河弧光，可以找到金牛的双角与牛眼。',taurus:'由武汉方向左转约 82°，近看牛脸、双角与靠近地平的后部。',hubei:'正前方指向武汉，金牛座在左侧西方低空。'}[mode])+'</p></section>';
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest?.('button[data-sky-view]');
  if(!b||!Object.hasOwn(modes,b.dataset.skyView))return;
  mode=b.dataset.skyView;paint();try{localStorage.setItem('nt-sky21',mode)}catch{}
  b.closest('.sky20-tools').outerHTML=controls();
  document.querySelector('.sky20-tools [aria-pressed="true"]')?.focus({preventScroll:true});
 });
 paint();return{controls};
})();
