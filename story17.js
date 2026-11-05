// Hand-authored training keys for synthetic teaching specimens only.
(() => {
  'use strict';
  const chapters = [
    {
      id: 'dawn', index: 0, title: '红岸之后', chapter: '序章', skill: '识别主干断口',
      reward: 60, plate: 'receiver', motif: '红岸基地', book: '《三体》', source: '红岸基地承担了与地外文明通信的秘密任务。', fragment: '断口手记', station: '监听桅杆',
      lead: '北岭站复机那晚，你取出了第一张训练底片。主干在中央断开，边缘也有几条线戛然而止。前任站员用铅笔圈住边框，旁边写着「裁切」。',
      objective: '找到画面中央最粗的两截纤维，在它们相向的断口之间补一条线。',
      method: '分别点断口两侧的小亮点，再点「连接」。红圈斜杠标出离开采样框的位置，那里的纤维会继续向外延伸。',
      tip: '沿着较粗的主干从左往右看。主干朝向另一截的两个端点很近，外围的细支不用补。',
      discovery: '一条突起离开取样边界时，图像会出现“尽头”。只凭这个尽头，无法判断突起在组织中止于何处。',
      ending: '桅杆亮起后，接收机收到了本站的校准音。你在第一张底片背面写下：中央一处断口已补，伸出边框的纤维留给下一张底片。',
      answer: [['a:end','b:start']]
    },
    {
      id: 'tide', index: 3, title: '迟到的回信', chapter: '第一章', skill: '追踪微弱信号',
      reward: 80, plate: 'strip', motif: '监听员的回信', book: '《三体》', source: '一名三体监听员收到了来自地球的信号，私自向地球发出警告。', fragment: '微光底片', station: '暗场观测舱',
      lead: '抽屉里有两卷同夜曝光的底片。第一卷上主干很清楚，第二卷只剩一道淡痕。老站长曾把它标成底噪；你把暗场灯调低，淡痕两侧的走向居然吻合。',
      objective: '补好中央主干，再找到同向延续的微弱独立纤维。共补两处。',
      method: '先找明显的断口，再用视图里的对比度和侧视检查独立的弱纤维。可以逐条补线，最后一起校验。',
      tip: '主干旁有一对整体较暗的独立片段。旋转视角，沿两个片段各自的末梢向外延长，比较它们是否相向。',
      discovery: '显微成像中，局部信号弱会降低追踪把握。亮度需要和走向、邻近片段及不同观察角度一起看。',
      ending: '暗场舱给淡痕留了一格底片夹。站员把当晚的照明条件和你的两处补线一起存了进去，下一班可以从同一个角度复看。',
      answer: [['a:end','b:start'],['e:end','f:start']]
    },
    {
      id: 'parallax', index: 2, title: '沉默的坐标', chapter: '第二章', skill: '分清投影交叉',
      reward: 100, plate: 'parallax', motif: '猜疑链', book: '《黑暗森林》', source: '文明隔着漫长的星际距离，难以核实对方的意图。', fragment: '视差星片', station: '联合测绘台',
      lead: '测绘员把三张透明底片叠在灯箱上，正中像是一个交叉口。“这一处也要接吗？”你把灯箱转了半圈，三条轨迹在不同深度缓缓分开。',
      objective: '让三对断口各自接续。每补一处，转到侧面或俯视核对深度。',
      method: '正面观察各段的延伸方向，切到侧面检查深度。分别找出三对相向的末端后提交。',
      tip: '留意向右上延伸的主干、向右下拐的弧和较深处的细支。在投影上相交的两段，转到侧面可能相距很远。',
      discovery: '三维突起的二维投影可以相交。判断局部连续性时，正交视角可以提供单张投影中缺失的深度信息。',
      ending: '三条轨迹分别归档。你给测绘台加了一把椅子，以后每处拿不准的连接，都可以留给第二位观察员从侧面再看一次。',
      answer: [['a:end','b:start'],['c:end','d:start'],['e:end','f:start']]
    }
  ];
  const sides = [
    {index:1, title:'分叉处的来信', tool:'侧视镜头', setting:'side', description:'沿不同深度的分支比较空间走向，标出你愿意交给同伴复核的候选连接。'},
    {index:4, title:'密林里的回线', tool:'高对比观察', setting:'contrast', description:'在密集纤维中辨认能独立追踪的走向。证据不够时，也可以留下待复核的记录。'}
  ];
  let result = null, pending = null;
  let archiveTab = 'story';
  const currentChapter = () => chapters.find(c => c.index === state.taskIndex);
  const currentSide = () => sides.find(s => s.index === state.taskIndex);
  const log = () => state.story17;
  const completionCount = () => chapters.filter(c => log().cleared[c.id]).length;
  const taskCount = () => sides.filter(s => log().sideRecords[NeuroTrace3D.taskAt(s.index).id]).length;
  const available = c => chapters.indexOf(c) <= completionCount();
  const trained = () => completionCount() === chapters.length;
  const currentEdges = () => state.addedEdges.filter(e => e.taskId === NeuroTrace3D.taskAt(state.taskIndex).id);
  const emptyLog = () => ({cleared:{}, attempts:{}, sideRecords:{}});
  const view = (s,n) => String(s).padStart(n,'0');
  function init(storageKey = window.neuroSaveKey?.() || 'neurotrace-demo-v12') {
    pending = result = null;
    let prior;
    try { prior = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
    state.story17 = emptyLog();
    if (!prior) state.score = 0;
    const data = prior?.story17;
    if (data) {
      for (const c of chapters) {
        if (!data.cleared?.[c.id] || !available(c)) break;
        log().cleared[c.id] = true;
      }
      for (const c of chapters) {
        const attempts = data.attempts?.[c.id];
        if (Number.isSafeInteger(attempts) && attempts > 0) log().attempts[c.id] = attempts;
      }
      if (trained()) for (const s of sides) {
        const id = NeuroTrace3D.taskAt(s.index).id;
        if (['candidate','uncertain'].includes(data.sideRecords?.[id]?.kind)) log().sideRecords[id] = data.sideRecords[id];
      }
    }
    ensurePlayable();
  }
  function ensurePlayable() {
    const c = currentChapter();
    if ((c && available(c)) || (currentSide() && trained())) return;
    state.taskIndex = chapters[Math.min(completionCount(),chapters.length-1)].index;
    state.selectedNodes=[];state.selectedEdgeId=state.selectedOriginalSegmentId=state.selectedBoundaryEndpointId=null;
    state.camera3d=null;state.undoStack=[];
  }
  function syncRemote(account, cleared) {
    if (!account || !Number.isSafeInteger(account.points) || account.points<0 || !Array.isArray(cleared)) return false;
    state.score=account.points;
    log().cleared={};
    for(const c of chapters){
      if(!cleared.includes(c.id))break;
      log().cleared[c.id]=true;
    }
    ensurePlayable();
    return true;
  }
  function reset() {
    pending = null;
    state.story17 = emptyLog();
    state.score = 0;
    result = null;
    archiveTab = 'story';
  }
  function sectionTitle(label, sub) {
    return '<div class="e17-section"><h3>'+label+'</h3><small>'+sub+'</small></div>';
  }
  function chapterButton(c, text, cls = '') {
    return '<button type="button" class="e17-btn '+cls+'" data-story-launch="'+c.id+'">'+text+' <b aria-hidden="true">›</b></button>';
  }
  const plate = c => 'assets/archive18-'+c.plate+'.webp';
  function chapterCard(c,i) {
    const passed = !!log().cleared[c.id], canPlay = available(c);
    const number = view(i+1,2), task = NeuroTrace3D.taskAt(c.index).id;
    const status = passed ? '已归档' : canPlay ? '可进入' : '封存中';
    return `<article class="e18-file ${canPlay?'e18-open':'e18-locked'}">
      <div class="e18-file-head">
        <div><small>FILE ${number} &nbsp;/&nbsp; ${task}</small><h3>${c.title}</h3><span class="e18-stamp">${status}</span></div>
        <img src="${plate(c)}" alt="" width="124" height="82">
      </div>
      ${canPlay ? `<div class="e18-file-copy">
        <p>${c.lead}</p>
        <div class="e18-assignment"><small>本次训练</small><div><strong>${c.skill}</strong><span>${c.objective}</span></div></div>
        <div class="e18-file-actions"><small>${resourceIcon('points')} ${c.reward} 积分</small>${chapterButton(c,passed?'重返现场':log().attempts[c.id]?'继续训练':'进入三维现场')}</div>
        <details class="e18-source"><summary>故事原型 · ${c.motif}</summary><p>${c.book}中，${c.source} 北岭值班记录与本章样本为本游戏原创。</p></details>
      </div>` : `<p class="e18-lock-note">归档《${chapters[i-1].title}》后开启</p>`}
    </article>`;
  }
  function fragmentCard(c,i) {
    const done = !!log().cleared[c.id];
    return `<article class="e18-fragment ${done?'is-found':''}">
      <img src="${plate(c)}" alt="" width="70" height="70"><div><small>FIELD NOTE &nbsp; ${view(i+1,2)}</small>
      <h3>${done?c.fragment:'未解封的笔记'}</h3><p>${done?c.discovery:'归档《'+c.title+'》后揭开本页。'}</p>
      ${done?chapterButton(c,'查看对应样本','e17-link'):''}</div>
    </article>`;
  }
  function archiveHTML() {
    const n = completionCount();
    return contentShell(head('回声档案')+`<div class="e18-archive">
      <header class="e18-cover">
        <div class="e18-cover-image"><div><small>ECHO ARCHIVE</small><h2>监听站手记</h2><b>北岭站 · 第一卷</b></div></div>
        <div class="e18-cover-caption"><span>外景 01 &nbsp;/&nbsp; 桅杆复机前</span><span>PL. 001</span></div>
      </header>
      <div class="e18-reading"><strong>值班记录</strong><span>${n} / 3 章已归档</span><div class="e18-marks" aria-hidden="true">${chapters.map((_,i)=>'<i class="'+(i<n?'filled':'')+'"></i>').join('')}</div></div>
      <nav class="e18-tabs" aria-label="档案栏目">${[['story','档案故事'],['fragments','研究碎片 · '+n]].map(([k,t])=>'<button aria-pressed="'+(archiveTab===k)+'" data-story-tab="'+k+'">'+t+'</button>').join('')}</nav>
      ${archiveTab==='story'?chapters.map(chapterCard).join(''):chapters.map(fragmentCard).join('')}
      <footer class="e18-colophon"><b>本卷书目</b><p>故事借用刘慈欣小说中的红岸基地、监听员和猜疑链。北岭站是本游戏虚构的教学站，三份三维样本均为合成练习。</p>
      <a href="https://us.macmillan.com/books/9781250370600/thethreebodyproblem/" target="_blank" rel="noopener noreferrer">《三体》↗</a><a href="https://us.macmillan.com/books/9781250430663/thedarkforest/" target="_blank" rel="noopener noreferrer">《黑暗森林》↗</a></footer>
    </div>`,'archive');
  }
  function civilHTML() {
    const n = completionCount(), next = chapters[n];
    return contentShell('<div class="e17-civil"><header class="e17-city-hero" style="--e17-art:url('+'assets/archive18-station.webp'+')"><div class="e17-overline">OUTPOST <i></i> '+view(n,2)+'</div><small>文明 · 北岭监听站</small><h2>'+['尚待点亮的前哨','桅杆捕获了第一束回声','暗场观测舱已就绪','联合测绘台已上线'][n]+'</h2><p>'+(n?chapters[n-1].ending:'信号还没有抵达。第一次通过主线训练后，你将在这里架起监听桅杆。')+'</p><div class="e17-city-strip">'+chapters.map((c,i)=>'<div class="'+(i<n?'lit':'')+'"><i>✦</i><small>'+c.station+'</small></div>').join('')+'</div></header>'+
      sectionTitle('建设日志',n+' / 3 座设施')+chapters.map((c,i)=>'<div class="e17-log '+(i<n?'lit':'')+'"><b>'+view(i+1,2)+'</b><div><strong>'+c.station+'</strong><span>'+(i<n?c.ending:'完成《'+c.title+'》后建成。')+'</span></div></div>').join('')+
      '<button class="e17-wide" data-page="archive">'+(next?'前往回声档案 · '+next.title:'回看主线故事与研究碎片')+' <b>›</b></button>'+(trained()?'<button class="e17-wide e17-secondary" data-story-sideboard>打开已解锁的支线委托 <b>›</b></button>':'')+'</div>','civil');
  }
  function taskSheet() {
    return '<div class="overlay" id="taskoverlay"><div class="sheet task-v12-sheet e17-sheet" role="dialog" aria-modal="true" aria-label="支线任务"><div class="handle"></div><div class="sheethead"><h2>任务 <small>支线委托</small></h2><button class="close" id="close-task" aria-label="关闭任务">×</button></div><p>一项委托对应一个样本和一件观察工具。你的记录会保存在这台设备上，等待复核。</p>'+
      '<div class="e17-clearance"><b>'+(trained()?'训练已通过 · 可领取委托':'观察员训练 '+completionCount()+' / 3')+'</b><span>'+(trained()?'两项委托均可进入。':'三章预设答案训练全部通过后开放。')+'</span></div>'+
      sides.map(s=>{const t=NeuroTrace3D.taskAt(s.index), rec=log().sideRecords[t.id];return '<button class="e17-sidecard" '+(trained()?'':'disabled')+' data-story-side="'+s.index+'"><small>'+t.id+' · '+s.tool+'</small><strong>'+s.title+'</strong><p>'+s.description+'</p><span>'+(rec?'已登记 · 可重访':trained()?'携带工具进入现场 ›':'待完成校准')+'</span></button>';}).join('')+
      '<button data-page="archive" class="e17-wide e17-secondary">回声档案 · 主线训练 <b>›</b></button></div></div>';
  }
  function gameChip() {
    const c=currentChapter(), s=currentSide();
    const heading = c?c.chapter+' · '+c.title:'支线 · '+s.title;
    const objective = c ? ({dawn:'点主干两端，再连接',tide:'找主干与弱纤维',parallax:'从侧面核对深度'})[c.id] : '待复核观察';
    return '<div class="case-chip e17-game-chip"><button data-story-guide aria-label="查看当前目标">'+heading+' <em>'+objective+' ›</em></button><span>'+state.selectedNodes.length+'/2 已选 · '+currentEdges().length+' 条线</span></div>';
  }
  const submitLabel = () => currentChapter()?'校验':'登记';
  function taskHelpSheet() {
    const c=currentChapter(),s=currentSide();
    return '<div class="overlay" id="taskhelpoverlay"><div class="sheet task-help-sheet e17-sheet" role="dialog" aria-modal="true" aria-label="当前观察目标"><div class="handle"></div><div class="sheethead"><h2>'+(c?c.title:s.title)+'</h2><button class="close" id="close-task-help" aria-label="关闭任务帮助">×</button></div><div class="e17-clearance"><b>'+(c?c.skill:s.tool)+'</b><span>'+(c?c.objective:s.description)+'</span></div><p>'+(c?c.method:'候选连线可以修改。点「登记」后可提交当前草稿，或标记证据不足。')+'</p>'+
      (c?'<details class="e17-hint"><summary>再给我一点观察提示</summary><p>'+c.tip+'</p></details>':'')+'<button data-page="archive" class="e17-wide e17-secondary">返回回声档案 <b>›</b></button></div></div>';
  }
  function launch(index) {
    const c = chapters.find(x => x.index === index);
    const s = sides.find(x => x.index === index);
    if (!(c && available(c) || s && trained()) || !state.loggedIn) return;
    pending=result=null;
    state.toast='';
    state.page=state.mainPage=state.previous='game';
    state.selectedBoundaryEndpointId=null;
    state.undoStack=[];
    if (s?.setting==='contrast') {state.palette='contrast';state.contrast=130;}
    taskSwitch(index);
    if(s?.setting==='side'){
      state.camera3d={yaw:Math.PI/2,pitch:0,panX:0,panY:0,zoom:1};
      render();
    }
  }
  const pair = (a,b) => [a,b].sort().join('|');
  function sendReceipt(c,awarded) {
    window.NeuroMail?.notify({id:'story-'+c.id,title:'监听站来信 · '+c.station,body:c.ending+' 已收藏「'+c.fragment+'」，本章获得 '+awarded+' 积分。',action:'archive'});
  }
  async function submitGraded(c,account,edges) {
    const ticket={account:account.id,chapter:c.id,log:log()};
    pending=ticket;
    result={type:'checking'};
    render();
    const active=()=>pending===ticket && log()===ticket.log && state.loggedIn && state.page==='game' &&
        currentChapter()===c && window.NeuroIdentity?.session()?.id===ticket.account;
    try {
      const receipt=await window.NeuroIdentity.grade(c.id,edges.map(e=>[e.from,e.to]));
      if(!active())return;
      if(receipt?.account?.id!==account.id || !Array.isArray(receipt.cleared) || !receipt.cleared.includes(c.id) ||
          !Number.isSafeInteger(receipt.awarded) || receipt.awarded<0 || !syncRemote(receipt.account,receipt.cleared))throw new Error('invalid_receipt');
      persistDemo();
      if(receipt.awarded>0)sendReceipt(c,receipt.awarded);
      result={type:'pass',first:receipt.awarded>0,awarded:receipt.awarded};
    } catch {
      if(active())result={type:'service-error'};
    } finally {
      if(pending===ticket){
        pending=null;
        if(result?.type==='checking')result=null;
        render();
      }
    }
  }
  function check() {
    if (!state.loggedIn || state.page!=='game' || pending) return;
    const c = currentChapter();
    if (!c) { if (trained()) { result={type:'side'};render(); } return; }
    if (!available(c)) return;
    const edges = currentEdges();
    const seen = edges.map(e => pair(e.from,e.to));
    const key = c.answer.map(([a,b]) => pair(a,b));
    const matching = key.filter(x => seen.includes(x)).length;
    log().attempts[c.id]=(log().attempts[c.id]||0)+1;
    const passed=matching===key.length && seen.length===key.length;
    const account=window.NeuroIdentity?.session();
    if(passed && account) return submitGraded(c,account,edges);
    const first=passed&&!log().cleared[c.id];
    if(first){
      log().cleared[c.id]=true;
      state.score+=c.reward;
      persistDemo();
      sendReceipt(c,c.reward);
    }
    result={type:passed?'pass':'retry',first,awarded:first?c.reward:0,match:matching,extra:seen.length-matching,missing:key.length-matching};
    render();
  }
  function recordSide(kind) {
    if(state.page!=='game'||!state.loggedIn||!trained()||!currentSide()||!['candidate','uncertain'].includes(kind))return;
    const edges=currentEdges();
    if(kind==='candidate'&&!edges.length)return;
    const t=NeuroTrace3D.taskAt(state.taskIndex);
    log().sideRecords[t.id]={kind, time:new Date().toISOString(), edges:edges.map(({from,to})=>[from,to])};
    result={type:'recorded'};
    render();
  }
  function resultSheet() {
    if(!result)return '';
    const c=currentChapter(),s=currentSide(),r=result;
    let title,body,actions;
    if(r.type==='checking'){
      title='正在校验';body='<p>正在向观测站核对本章的连接记录。</p>';actions='';
    } else if(r.type==='service-error'){
      title='未取得校验回执';body='<p>请检查登录状态或网络连接，再次校验。观测站会核对已有记录，首次奖励只发一次。</p>';actions='<button class="e17-wide" data-story-dismiss>返回现场 <b>›</b></button>';
    } else if(r.type==='pass'){
      title=r.first?'回声已归档':'复习校验通过';
      body='<div class="e17-result-mark">✧</div><p>'+c.ending+'</p><div class="e17-clearance"><b>'+(r.first?resourceIcon('points')+' +'+r.awarded+' 积分 · 解锁「'+c.fragment+'」':'本章的积分和碎片已领取')+'</b><span>'+c.discovery+'</span></div>';
      actions='<button class="e17-wide" data-story-return>回到回声档案 <b>›</b></button><button class="e17-wide e17-secondary" data-story-city>查看文明建设 <b>›</b></button>';
    } else if(r.type==='retry'){
      title='再看一眼这份样本';
      body='<div class="e17-clearance"><b>已匹配 '+r.match+' / '+c.answer.length+' 处</b><span>'+[r.extra?'有 '+r.extra+' 条多余连接，可点选带菱形标记的虚线后删除。':'',r.missing?'还缺 '+r.missing+' 处断口。':''].join(' ')+'</span></div><p>'+c.tip+'</p>';
      actions='<button class="e17-wide" data-story-dismiss>返回现场继续观察 <b>›</b></button>';
    } else if(r.type==='side'){
      title='登记观察 · '+s.title;
      body='<p>当前草稿有 '+currentEdges().length+' 条候选连接。可以提交给后续复核，也可以表明证据不足。这份合成练习记录仅保存在本机。</p>';
      actions='<button class="e17-wide" data-story-record="candidate" '+(!currentEdges().length?'disabled':'')+'>登记候选连接 <b>›</b></button><button class="e17-wide e17-secondary" data-story-record="uncertain">登记为证据不足 <b>›</b></button>';
    } else {
      title='观察记录已保存';
      const rec=log().sideRecords[NeuroTrace3D.taskAt(state.taskIndex).id];
      body='<p>'+s.title+' · '+(rec.kind==='candidate'?rec.edges.length+' 条候选连接':'证据不足')+'。状态为待复核，可从任务列表重返样本。</p>';
      actions='<button class="e17-wide" data-story-sideboard>返回支线委托 <b>›</b></button>';
    }
    return '<div id="story-result" class="overlay"><div class="sheet e17-sheet" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="handle"></div><div class="sheethead"><h2>'+title+'</h2>'+(r.type==='checking'?'':'<button class="close" data-story-dismiss aria-label="关闭结果">×</button>')+'</div>'+body+actions+'</div></div>';
  }
  function bind() {
    const on=(selector,fn)=>document.querySelectorAll(selector).forEach(b=>b.addEventListener('click',()=>fn(b)));
    on('[data-story-launch]',b=>{const c=chapters.find(x=>x.id===b.dataset.storyLaunch);if(c)launch(c.index);});
    on('[data-story-side]',b=>launch(Number(b.dataset.storySide)));
    on('[data-story-tab]',b=>{archiveTab=b.dataset.storyTab;render();});
    on('[data-story-guide]',()=>{state.taskHelpOpen=true;render();});
    on('#story-submit',check);
    on('[data-story-dismiss]',()=>{result=null;render();});
    on('[data-story-return]',()=>{result=null;archiveTab='story';setPage('archive');});
    on('[data-story-city]',()=>{result=null;setPage('civil');});
    on('[data-story-record]',b=>recordSide(b.dataset.storyRecord));
    on('[data-story-sideboard]',()=>{result=null;state.page=state.mainPage=state.previous='game';state.taskOpen=true;render();});
  }
  window.NeuroStory={init,reset,syncRemote,archiveHTML,civilHTML,taskSheet,taskHelpSheet,gameChip,resultSheet,submitLabel,bind,taskCount,completionCount};
})();
