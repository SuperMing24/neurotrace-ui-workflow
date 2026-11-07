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
const rankPeriods22={
 周榜:{id:'week',points:'weekPoints'},
 月榜:{id:'month',points:'monthPoints'},
 总榜:{id:'all',points:'points'}
};
let performance22={}, rankScreenOpen=false;
function rankDates22(period,now=Date.now()){
 if(period==='all')return '全部记录';
 const day=86400000, today=new Date(now+8*3600000);
 const y=today.getUTCFullYear(),m=today.getUTCMonth(),d=today.getUTCDate();
 const start=period==='week'?Date.UTC(y,m,d-((today.getUTCDay()+6)%7)):Date.UTC(y,m,1);
 const end=period==='week'?start+6*day:Date.UTC(y,m+1,0);
 const fmt=n=>new Date(n).toISOString().slice(0,10).replaceAll('-','.');
 return fmt(start)+' — '+fmt(end);
}
async function loadPerformance22(period){
 const item={status:'loading',players:[]};
 performance22[period]=item;
 try{
  const res=await fetch('/api/rankings?period='+period,{cache:'no-store'});
  if(!res.ok)throw new Error('rank request');
  const data=await res.json();
  if(data.period!==period||!Array.isArray(data.players)||!data.players.every(p=>
    p && typeof p.id==='string' && typeof p.name==='string' && Number.isFinite(p.score) &&
    Number.isInteger(p.completed) && Number.isInteger(p.samples)))throw new Error('rank format');
  item.players=data.players;item.status='ready';
 }catch{item.status='error';}
 if(performance22[period]===item && state.page==='rank' && state.rankMetric==='performance' &&
    rankPeriods22[state.rankPeriod]?.id===period)render();
}
function ranking18(){
 const key=state.rankPeriod in rankPeriods22?state.rankPeriod:'总榜', period=rankPeriods22[key];
 const perf=state.rankMetric==='performance', periodical=period.id!=='all';
 const current=window.NeuroIdentity?.session();
 const cloud=window.NeuroIdentity?.roster()||{status:'loading',accounts:[]};
 const scores=performance22[period.id]||{status:'loading',players:[]};
 const status=perf?scores.status:cloud.status, title=perf?'表现榜':'积分榜';
 const pointsRow=p=>({id:p.id,name:p.name,score:Number(p[period.points]),completed:0,
  detail:p.title+(p.demo?' · 演练角色':' · 正式账号')});
 const players=perf ? scores.players.map(p=>({...p,detail:'通关 '+p.completed+' / 已测 '+p.samples+' 份'})) :
  [...cloud.accounts,...(!periodical&&cloud.status==='ready'?trainingRoster:[])].map(pointsRow)
    .filter(p=>Number.isFinite(p.score)&&(!periodical||p.score!==0));
 players.sort((a,b)=>b.score-a.score || b.completed-a.completed || a.name.localeCompare(b.name,'zh'));
 const ranks=players.map((_,i)=>i+1);
 for(let i=1;i<players.length;i++)if(players[i].score===players[i-1].score&&players[i].completed===players[i-1].completed)ranks[i]=ranks[i-1];
 const amount=n=>perf?'<span class="nt22-grade">'+n.toLocaleString('zh-CN',{maximumFractionDigits:2})+' <small>分</small></span>':resourceAmount('points',n);
 const self=current?players.findIndex(p=>p.id===current.id):-1;
 const periodTabs='<nav class="nt22-periods" aria-label="排行榜周期">'+Object.keys(rankPeriods22).map(p=>
  '<button data-period="'+p+'" aria-pressed="'+(key===p)+'">'+p+'</button>').join('')+'</nav>';
 const metrics='<nav class="nt22-metrics" aria-label="排行榜类型">'+[['points','积分榜'],['performance','表现榜']].map(([id,label])=>
  '<button data-rank-metric="'+id+'" aria-pressed="'+(id===(perf?'performance':'points'))+'">'+label+'</button>').join('')+'</nav>';
 const head='<header class="nt22-rank-head"><div><small>OBSERVATORY  /  RANKINGS</small><h2>群星榜单</h2></div>'+metrics+'</header>';
 const desc=perf?'不同样本的最佳成绩取平均，同分再看通关数。':periodical?'统计当期通关奖励和兑换的净变动。':'账户积分余额。演练角色仅列在积分总榜。';
 const context='<div class="nt22-range"><b>'+esc(rankDates22(period.id))+'</b><small>北京时间</small></div>'+
  '<p class="nt22-rank-desc">'+desc+'</p>';
 function medal(i){
  const p=players[i],n=i+1;
  if(!p)return '<div class="v13-podium-card v13-podium-'+n+' nt-vacant"><div class="v13-podium-glass"><small>第 '+n+' 席</small><b>待上榜</b></div></div>';
  const img=['gold','silver','bronze'][Math.min(ranks[i]-1,2)];
  return '<div class="v13-podium-card v13-podium-'+n+'"><span class="v13-crown">♛ '+ranks[i]+'</span><div class="v13-podium-glass"><img alt="" src="assets/medal-'+img+'.webp"><b>'+esc(p.name)+'</b><small>'+esc(p.detail)+'</small><strong>'+amount(p.score)+'</strong></div><div class="v13-podium-ring"></div></div>';
 }
 const podium=players.length?'<div class="v13-podium">'+[1,0,2].map(medal).join('')+'</div>':'';
 const rows=players.map((p,i)=>'<div class="nt-rank-row'+(i===self?' is-mine':'')+'" '+(i===self?'id="nt-my-rank-row"':'')+'><span>'+ranks[i]+'</span><div><b>'+esc(p.name)+'</b><small>'+esc(p.detail)+'</small></div>'+amount(p.score)+'</div>').join('');
 const noScores=perf?(periodical?'本期尚无正式训练成绩。周榜和月榜从 V2.2 开始按提交时间记录。':'目前还没有已提交的正式训练成绩。'):(periodical?'本期没有净积分发生变化的成员。':'暂无正式账号记录。');
 const empty=status==='error'?'暂时无法读取'+title+'。 <button data-rank-retry>重新读取</button>':status==='loading'?'正在读取'+title+'…':noScores;
 const line=rows||'<p class="nt-rank-empty" role="status">'+empty+'</p>';
 const selfLabel=self>=0?'#'+ranks[self]:(status!=='ready'&&current?'待同步':'未上榜');
 const myDetail=current?'已验证的正式账号':perf?'正式账号参与排名':'我的试玩积分 · 本机余额';
 const myAmount=self>=0?amount(players[self].score):!perf&&!current?amount(state.score):!perf&&current&&status==='ready'?amount(periodical?0:current.points):'';
 const me='<button type="button" class="v13-self nt-rank-self" id="nt-locate-me" '+(self<0?'disabled':'')+'><span>我的位置<b>'+selfLabel+'</b></span><div><b>'+esc(current?.name||'试玩观测员')+'</b><small>'+myDetail+'</small></div>'+myAmount+(self>=0?'<i>定位 ↗</i>':'')+'</button>';
 return contentShell('<div class="nt-rank">'+head+periodTabs+context+podium+'<div class="nt-rank-caption"><span>排名 / 成员</span><span>'+ (perf?'训练表现分':periodical?'本期净增':'积分余额')+'</span></div><div class="nt-rank-center"><div id="nt-rank-list" tabindex="0" aria-label="全部成员" class="v13-leader-list">'+line+'</div><input id="nt-rank-slider" type="range" orient="vertical" min="0" max="1000" value="0" aria-label="滚动成员列表"></div>'+me+'</div>','rank');
}
function bindRank20(){
 const list=document.getElementById('nt-rank-list'),slider=document.getElementById('nt-rank-slider');
 if(!list||!slider){
  if(rankScreenOpen)performance22={};
  rankScreenOpen=false;return;
 }
 rankScreenOpen=true;
 const period=(rankPeriods22[state.rankPeriod]||rankPeriods22['总榜']).id;
 if(state.rankMetric==='performance'&&!performance22[period])loadPerformance22(period);
 document.querySelectorAll('[data-rank-metric]').forEach(b=>b.addEventListener('click',()=>{
  state.rankMetric=b.dataset.rankMetric;render();
  document.querySelector('[data-rank-metric="'+state.rankMetric+'"]')?.focus({preventScroll:true});
 }));
 document.querySelector('[data-rank-retry]')?.addEventListener('click',async e=>{
  e.currentTarget.disabled=true;
  if(state.rankMetric==='performance'){loadPerformance22(period);render();return;}
  await window.NeuroIdentity?.refreshRoster();if(state.page==='rank')render();
 });
 const extent=()=>Math.max(0,list.scrollHeight-list.clientHeight);
 const sync=()=>{const n=extent();slider.disabled=n===0;slider.value=n?String(Math.round(1000*list.scrollTop/n)):'0';};
 list.addEventListener('scroll',sync,{passive:true});
 slider.addEventListener('input',()=>{list.scrollTop=extent()*Number(slider.value)/1000;});
 document.getElementById('nt-locate-me')?.addEventListener('click',()=>document.getElementById('nt-my-rank-row')?.scrollIntoView({block:'center',behavior:'instant'}));
 sync();
}
