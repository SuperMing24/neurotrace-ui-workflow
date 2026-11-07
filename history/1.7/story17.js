// Hand-authored training keys for synthetic teaching specimens only.
(() => {
  'use strict';
  const chapters = [
    {
      id: 'dawn', index: 0, title: '第一束回声', chapter: '序章', skill: '识别主干断口',
      reward: 60, art: 0, fragment: '断口手记', station: '监听桅杆',
      lead: '天线架起后的第一个晚上，接收机吐出两截蓝线。它们在同一个地方停下，好像一封信被折去了中间的一行。',
      objective: '找到画面中央最粗的两截纤维，在它们相向的断口之间补一条线。',
      method: '分别点断口两侧的小亮点，再点「连接」。红圈斜杠标出离开采样框的位置，那里的纤维会继续向外延伸。',
      tip: '沿着较粗的亮蓝主干从左往右看。主干朝向另一截的两个端点很近，外围的细支不用补。',
      discovery: '一条突起离开取样边界时，图像会出现“尽头”。只凭这个尽头，无法判断突起在组织中止于何处。',
      ending: '两截信号接在一起，桅杆第一次收到了自己的呼号。值班员在图纸上写下了站名。',
      answer: [['a:end','b:start']]
    },
    {
      id: 'tide', index: 3, title: '夜潮里的微光', chapter: '第一章', skill: '追踪微弱信号',
      reward: 80, art: 3, fragment: '微光底片', station: '暗场观测舱',
      lead: '次日传回的底片上，主信号旁有一道几乎擦掉的细痕。若只描最亮的部分，第二条来信就会消失。',
      objective: '补好中央主干，再找到同向延续的微弱独立纤维。共补两处。',
      method: '先找明显的断口，再用视图里的对比度和侧视检查独立的弱纤维。可以逐条补线，最后一起校验。',
      tip: '主干旁有一对整体较暗的独立片段。旋转视角，沿两个片段各自的末梢向外延长，比较它们是否相向。',
      discovery: '显微成像中，局部信号弱会降低追踪把握。亮度需要和走向、邻近片段及不同观察角度一起看。',
      ending: '第二封来信比第一封轻得多。暗场舱保存了它的底片，以后值班的人可以重新检查这道微光。',
      answer: [['a:end','b:start'],['e:end','f:start']]
    },
    {
      id: 'parallax', index: 2, title: '错位的星桥', chapter: '第二章', skill: '分清投影交叉',
      reward: 100, art: 2, fragment: '视差星片', station: '联合测绘台',
      lead: '三束回声在正面投影上挤成了一个路口。测绘员将底片转过九十度，原来的“路口”散成了三层。',
      objective: '让三对断口各自接续。每补一处，转到侧面或俯视核对深度。',
      method: '正面观察各段的延伸方向，切到侧面检查深度。分别找出三对相向的末端后提交。',
      tip: '留意向右上延伸的主干、向右下拐的弧和较深处的细支。在投影上相交的两段，转到侧面可能相距很远。',
      discovery: '三维突起的二维投影可以相交。判断局部连续性时，正交视角可以提供单张投影中缺失的深度信息。',
      ending: '三条航迹各归其位。联合测绘台亮起第二盏灯，站里的观察员终于可以互相复核后续记录。',
      answer: [['a:end','b:start'],['c:end','d:start'],['e:end','f:start']]
    }
  ];
  const sides = [
    {index:1, title:'分叉处的来信', tool:'侧视镜头', setting:'side', description:'沿不同深度的分支比较空间走向，标出你愿意交给同伴复核的候选连接。'},
    {index:4, title:'密林里的回线', tool:'高对比观察', setting:'contrast', description:'在密集纤维中辨认能独立追踪的走向。证据不够时，也可以留下待复核的记录。'}
  ];
  let result = null;
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
  function init() {
    let prior;
    try { prior = JSON.parse(localStorage.getItem('neurotrace-demo-v12') || 'null'); } catch {}
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
    if ((!currentChapter() || !available(currentChapter())) && !(currentSide() && trained())) state.taskIndex = chapters[Math.min(completionCount(),2)].index;
  }
  function reset() {
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
  function chapterCard(c,i) {
    const passed = !!log().cleared[c.id], canPlay = available(c);
    const art = embeddedThumbs[c.art];
    return '<article class="e17-chapter '+(passed?'is-cleared':canPlay?'is-current':'is-locked')+'"><div class="e17-chapter-head"><img alt="" src="'+art+'"><div><small>'+c.chapter+' · '+NeuroTrace3D.taskAt(c.index).id+'</small><h3>'+c.title+'</h3></div><span class="e17-tag">'+(passed?'已归档':canPlay?'可进入':'未解锁')+'</span></div>'+
      (canPlay ? '<p>'+c.lead+'</p><div class="e17-brief"><strong>'+c.skill+'</strong><span>'+c.objective+'</span></div><div class="e17-chapter-foot"><small>◇ '+c.reward+' 积分 · '+c.fragment+'</small>'+chapterButton(c,passed?'重返现场':log().attempts[c.id]?'继续训练':'进入三维现场')+'</div>' : '<p class="e17-lock">完成《'+chapters[i-1].title+'》后收到这份档案。</p>')+'</article>';
  }
  function fragmentCard(c) {
    const done = !!log().cleared[c.id];
    return '<article class="e17-fragment '+(done?'open':'')+'"><span class="e17-crystal" aria-hidden="true">◇</span><div><small>'+c.chapter+' · '+c.skill+'</small><h3>'+(done?c.fragment:'尚待打捞')+'</h3><p>'+(done?c.discovery:'完成《'+c.title+'》后揭开这条观察笔记。')+'</p>'+(done?chapterButton(c,'查看对应样本','e17-link'):'')+'</div></article>';
  }
  function archiveHTML() {
    const n = completionCount();
    return contentShell(head('回声档案')+'<div class="e17-archive">'+
      '<header class="e17-hero" style="--e17-art:url('+embeddedAssets['archive-hero.webp']+')"><div class="e17-overline">ECHO ARCHIVE <i></i> VOL. 01</div><small>主线档案 / 边境监听站</small><h2>从第一束回声开始</h2><p>这里原本只有一架沉默的接收机。你修复的每段记录，都将成为这座小站的来历。</p><div class="e17-progress"><span>'+n+' / 3 章已归档</span><i style="--n:'+n+'"></i></div></header>'+
      '<div class="e17-tabs" aria-label="档案栏目">'+[['story','档案故事'],['fragments','研究碎片 · '+n]].map(([k,t])=>'<button aria-pressed="'+(archiveTab===k)+'" data-story-tab="'+k+'">'+t+'</button>').join('')+'</div>'+
      (archiveTab==='story'?chapters.map(chapterCard).join('') : chapters.map(fragmentCard).join(''))+
      '<p class="e17-note">训练样本为合成骨架，预设答案只用于本章校验。</p></div>','archive');
  }
  function civilHTML() {
    const n = completionCount(), next = chapters[n];
    return contentShell('<div class="e17-civil"><header class="e17-city-hero" style="--e17-art:url('+embeddedAssets['archive-atmosphere.webp']+')"><div class="e17-overline">OUTPOST <i></i> '+view(n,2)+'</div><small>文明 · 边境监听站</small><h2>'+['尚待点亮的前哨','桅杆捕获了第一束回声','暗场观测舱已就绪','联合测绘台已上线'][n]+'</h2><p>'+(n?chapters[n-1].ending:'信号还没有抵达。第一次通过主线训练后，你将在这里架起监听桅杆。')+'</p><div class="e17-city-strip">'+chapters.map((c,i)=>'<div class="'+(i<n?'lit':'')+'"><i>✦</i><small>'+c.station+'</small></div>').join('')+'</div></header>'+
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
    result=null;
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
  function check() {
    if (!state.loggedIn || state.page!=='game') return;
    const c = currentChapter();
    if (!c) { if (trained()) { result={type:'side'};render(); } return; }
    if (!available(c)) return;
    const seen = currentEdges().map(e => pair(e.from,e.to));
    const key = c.answer.map(([a,b]) => pair(a,b));
    const matching = key.filter(x => seen.includes(x)).length;
    log().attempts[c.id]=(log().attempts[c.id]||0)+1;
    const passed=matching===key.length && seen.length===key.length;
    const first=passed&&!log().cleared[c.id];
    if(first){
      log().cleared[c.id]=true;
      state.score+=c.reward;
      persistDemo();
      window.NeuroMail?.notify({id:'story-'+c.id,title:'监听站来信 · '+c.station,body:c.ending+' 已收藏「'+c.fragment+'」，本章获得 '+c.reward+' 积分。',action:'archive'});
    }
    result={type:passed?'pass':'retry',first,match:matching,extra:seen.length-matching,missing:key.length-matching};
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
    if(r.type==='pass'){
      title=r.first?'回声已归档':'复习校验通过';
      body='<div class="e17-result-mark">✧</div><p>'+c.ending+'</p><div class="e17-clearance"><b>'+(r.first?'◇ +'+c.reward+' 积分 · 解锁「'+c.fragment+'」':'本章的积分和碎片已领取')+'</b><span>'+c.discovery+'</span></div>';
      actions='<button class="e17-wide" data-story-return>回到回声档案 <b>›</b></button><button class="e17-wide e17-secondary" data-story-city>查看文明建设 <b>›</b></button>';
    } else if(r.type==='retry'){
      title='再看一眼这份样本';
      body='<div class="e17-clearance"><b>已匹配 '+r.match+' / '+c.answer.length+' 处</b><span>'+[r.extra?'有 '+r.extra+' 条多余连接，可选中金色线段后删除。':'',r.missing?'还缺 '+r.missing+' 处断口。':''].join(' ')+'</span></div><p>'+c.tip+'</p>';
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
    return '<div id="story-result" class="overlay"><div class="sheet e17-sheet" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="handle"></div><div class="sheethead"><h2>'+title+'</h2><button class="close" data-story-dismiss aria-label="关闭结果">×</button></div>'+body+actions+'</div></div>';
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
  window.NeuroStory={init,reset,archiveHTML,civilHTML,taskSheet,taskHelpSheet,gameChip,resultSheet,submitLabel,bind,taskCount,completionCount};
})();
