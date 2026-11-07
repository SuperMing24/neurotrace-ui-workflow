/* Shared resource badges for the player HUD, supply store and standings. */
function resourceIcon(kind) {
 const energy=kind==='energy';
 const shape=energy
  ? '<path d="M14.6 1.8 4.3 13.4h6.1l-1.1 8.8 10.4-13h-6z" fill="#78d9d7" stroke="#c7ffff"/><path d="m13.4 5.5-6 6.9h4.8" fill="none" stroke="#e3ffff"/>'
  : '<path d="m12 1.8 8.6 5.1v10.2L12 22.2l-8.6-5.1V6.9Z" fill="#534130" stroke="#efd499"/><path d="m12 5.3 5.4 3.2v6.9L12 18.7l-5.4-3.3V8.5Z" fill="none" stroke="#c09f70"/><path d="m12 7.5 3.5 4.5-3.5 4.5-3.5-4.5Z" fill="#ffe3a4" stroke="none"/>';
 return '<svg class="resource-icon resource-'+(energy?'energy':'points')+'" aria-hidden="true" viewBox="0 0 24 24" stroke-width="1.15" stroke-linejoin="round">'+shape+'</svg>';
}
function resourceAmount(kind,value) {
 return '<span class="resource-amount">'+resourceIcon(kind)+'<b>'+Number(value||0).toLocaleString('zh-CN')+'</b></span>';
}
const trainingRoster=[
 ['突触旅人','神经探索者',33183],
 ['皮层漫游者','高级标注员',31397],
 ['轴突追光者','高级标注员',29468],
 ['海马记忆匠','研究协作者',27450],
 ['胼胝桥守望','研究协作者',26280],
 ['小胶质星','研究协作者',25032],
 ['突触星尘','进阶标注员',23857],
 ['凋亡抑制者','进阶标注员',22587],
 ['神经节律','进阶标注员',21824],
 ['髓鞘匠人','标注贡献者',20544],
 ['认知拼图','标注贡献者',20096],
 ['皮层云图','标注贡献者',19399],
 ['突触微光','标注贡献者',18808],
 ['网络塑形者','新锐标注员',17952],
 ['神经绘图师','新锐标注员',17447],
 ['兴奋阈值','新锐标注员',17043],
 ['信息整合者','新锐标注员',16590],
 ['侧支生长','新锐标注员',16313]
].map(([name,title,points])=>({name,title,points,demo:true}));
function ranking18(){
 const periods={周榜:'weekPoints',月榜:'monthPoints',总榜:'points'}, key=periods[state.rankPeriod]||'points';
 const cloud=window.NeuroIdentity?.roster()||{status:'loading',accounts:[]}, current=window.NeuroIdentity?.session();
 const players=[...cloud.accounts,...(key==='points'&&cloud.status==='ready'?trainingRoster:[])]
  .sort((a,b)=>Number(b[key])-Number(a[key])||String(a.handle||a.name).localeCompare(String(b.handle||b.name),'zh'));
 const positions=players.map((p,i)=>i+1);
 for(let i=1;i<players.length;i++)if(Number(players[i][key])===Number(players[i-1][key]))positions[i]=positions[i-1];
 const place=i=>key!=='points'&&Number(players[i][key])===0?'—':String(positions[i]);
 const self=current?players.findIndex(p=>p.id===current.id):-1;
 const fmt=x=>resourceAmount('points',x);
 const tabs='<nav class="rank-tabs v13-rank-tabs" aria-label="排行榜周期">'+Object.keys(periods).map(name=>'<button data-period="'+name+'" aria-pressed="'+(state.rankPeriod===name)+'" class="'+(state.rankPeriod===name?'sel':'')+'">'+name+'</button>').join('')+'</nav>';
 function medal(i){
  const p=players[i],n=i+1,rank=p?place(i):'—';
  if(!p||rank==='—')return '<div class="v13-podium-card v13-podium-'+n+' nt-vacant"><div class="v13-podium-glass"><small>第 '+n+' 席</small><b>待上榜</b></div></div>';
  const img=['gold','silver','bronze'][i];
  return '<div class="v13-podium-card v13-podium-'+n+'"><span class="v13-crown">♛ '+rank+'</span><div class="v13-podium-glass"><img alt="" src="assets/medal-'+img+'.webp"><b>'+esc(p.name)+'</b><small>'+esc(p.title)+'</small><strong>'+fmt(p[key])+'</strong></div><div class="v13-podium-ring"></div></div>';
 }
 const podium=cloud.status==='ready'?'<div class="v13-podium">'+[1,0,2].map(medal).join('')+'</div>':'';
 const rows=players.map((p,i)=>'<div class="nt-rank-row'+(i===self?' is-mine':'')+'" '+(i===self?'id="nt-my-rank-row"':'')+'><span>'+place(i)+'</span><div><b>'+esc(p.name)+'</b><small>'+esc(p.title)+(p.demo?' · 演练角色':' · 正式账号')+'</small></div>'+fmt(p[key])+'</div>').join('');
 const empty=cloud.status==='error'?'<p class="nt-rank-empty">暂时无法读取积分。<button data-roster-retry>重试</button></p>':cloud.status==='ready'?'':'<p class="nt-rank-empty">正在读取积分…</p>';
 const selfLabel=self>=0&&place(self)!=='—'?'#'+place(self):(cloud.status!=='ready'&&current?'待同步':'未上榜');
 const me='<button type="button" class="v13-self nt-rank-self" id="nt-locate-me" '+(self<0?'disabled':'')+'><span>我的位置<b>'+selfLabel+'</b></span><div><b>'+esc(current?.name||'试玩观测员')+'</b><small>'+(current?'已验证的正式账号':'我的试玩积分')+'</small></div>'+fmt(current?(self>=0?players[self][key]:current.points):state.score)+(self>=0?'<i>定位 ↗</i>':'')+'</button>';
 return contentShell('<div class="nt-rank">'+tabs+podium+'<div class="nt-rank-caption"><span>排名 / 成员</span><span>'+ (key==='points'?'总积分':'本期净增')+'</span></div><div class="nt-rank-center"><div id="nt-rank-list" tabindex="0" aria-label="全部成员" class="v13-leader-list">'+empty+rows+'</div><input id="nt-rank-slider" type="range" orient="vertical" min="0" max="1000" value="0" aria-label="滚动成员列表"></div>'+me+'</div>','rank');
}
function bindRank20(){
 const list=document.getElementById('nt-rank-list'),slider=document.getElementById('nt-rank-slider');
 if(!list||!slider)return;
 const extent=()=>Math.max(0,list.scrollHeight-list.clientHeight);
 const sync=()=>{const n=extent();slider.disabled=n===0;slider.value=n?String(Math.round(1000*list.scrollTop/n)):'0';};
 list.addEventListener('scroll',sync,{passive:true});
 slider.addEventListener('input',()=>{list.scrollTop=extent()*Number(slider.value)/1000;});
 document.getElementById('nt-locate-me')?.addEventListener('click',()=>document.getElementById('nt-my-rank-row')?.scrollIntoView({block:'center',behavior:'instant'}));
 sync();
}
