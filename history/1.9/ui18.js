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
 ['突触旅人','神经探索者',3318315],
 ['皮层漫游者','高级标注员',3139730],
 ['轴突追光者','高级标注员',2946801],
 ['海马记忆匠','研究协作者',2745083],
 ['胼胝桥守望','研究协作者',2628087],
 ['小胶质星','研究协作者',2503204],
 ['突触星尘','进阶标注员',2385757],
 ['凋亡抑制者','进阶标注员',2258729],
 ['神经节律','进阶标注员',2182422],
 ['髓鞘匠人','标注贡献者',2054470],
 ['认知拼图','标注贡献者',2009601],
 ['皮层云图','标注贡献者',1939905],
 ['突触微光','标注贡献者',1880813],
 ['网络塑形者','新锐标注员',1795288],
 ['神经绘图师','新锐标注员',1744754],
 ['兴奋阈值','新锐标注员',1704307],
 ['信息整合者','新锐标注员',1659086],
 ['侧支生长','新锐标注员',1631355]
].map(([name,title,points])=>({name,title,points,demo:true}));
function ranking18(){
 const period=state.rankPeriod==='周榜'?'weekPoints':state.rankPeriod==='月榜'?'monthPoints':'points';
 const cloud=window.NeuroIdentity?.roster()||{status:'loading',accounts:[]};
 const current=window.NeuroIdentity?.session();
 const order=(a,b)=>Number(b[period]||0)-Number(a[period]||0)||Number(a.name!=='四七')-Number(b.name!=='四七')||a.name.localeCompare(b.name,'zh');
 const archive=cloud.status==='ready'&&cloud.fieldReady===false&&period==='points';
 const oldLeaders=[{name:'四七',title:'破壁人',points:5632803},{name:'小王',title:'面壁者',points:4058362}];
 const players=archive?[...oldLeaders,...trainingRoster]:[...cloud.accounts,...(cloud.status==='ready'&&period==='points'?trainingRoster:[])].sort(order), fmt=x=>resourceAmount('points',x);
 const sourceLabel=p=>p.demo?' · 演练角色':archive?' · 历史记录':' · 正式账号';
 const tabs=['周榜','月榜','总榜'].map(x=>'<button class="'+(x===state.rankPeriod?'sel':'')+'" aria-pressed="'+(x===state.rankPeriod)+'" data-period="'+x+'">'+x+'</button>').join('');
 const position=i=>players.findIndex(p=>p[period]===players[i][period])+1;
 const card=(p,i)=>{
  const pos=position(i), earned=Number(p[period]||0);
  const img=i===0?'medal-gold.webp':i===1?'medal-silver.webp':'medal-bronze.webp';
  return '<article class="rank18-card"><img src="assets/'+img+'" alt=""><small>'+(!earned?'档案成员':'第 '+pos+' 名')+'</small><strong>'+esc(p.name)+'</strong><span>'+esc(p.title)+sourceLabel(p)+'</span>'+fmt(earned)+'</article>';
 };
 let board=cloud.status==='loading'?'<p class="r18-empty">正在读取观测站记录…</p>':cloud.status==='error'?'<p class="r18-empty">暂时连接不到观测站。<button data-roster-retry>重新读取积分</button></p>':'<div class="rank18-podium">'+players.slice(0,3).map(card).join('')+'</div>';
 if(cloud.status==='ready'&&!players.length) board='<p class="r18-empty">等待首个正式账号加入。</p>';
 const rows=players.map((p,i)=>'<div class="r18-row"><span>'+(!p[period]?'—':String(position(i)).padStart(2,'0'))+'</span><div><b>'+esc(p.name)+'</b><small>'+esc(p.title)+sourceLabel(p)+'</small></div>'+fmt(p[period])+'</div>').join('');
 return contentShell('<div class="r18"><header><small>NEUROTRACE &nbsp;/&nbsp; OBSERVATORY</small><h2>群星</h2><p>观测站成员与星图演练队</p></header><div class="rank-tabs v13-rank-tabs">'+tabs+'</div>'+(archive?'<p class="r18-note">往届总榜 · 历史积分。正式账号余额见下方云端账本。</p>':'')+board+'<div class="r18-head"><b>'+(period==='points'?'观测站成员':'正式账号')+'</b><small>'+(period==='points'?'账户积分':'本期积分净增')+'</small></div>'+rows+
 (archive?'<div class="r18-head"><b>云端账本</b><small>当前正式余额</small></div>'+cloud.accounts.map(p=>'<div class="r18-row"><span>·</span><div><b>'+esc(p.name)+'</b></div>'+fmt(p.points)+'</div>').join(''):'')+
 (current?'<div class="r18-wallet"><div><small>已验证的正式账号</small><b>'+esc(current.name)+'</b></div>'+fmt(current.points)+'</div>':'')+
 (current?'':'<div class="r18-wallet"><div><small>与主页及补给站同步</small><b>我的试玩积分</b></div>'+fmt(state.score)+'</div>')+'<p class="r18-note">周榜与月榜只统计正式账号本期净增。演练角色沿用旧版的示例分。</p></div>','rank');
}
