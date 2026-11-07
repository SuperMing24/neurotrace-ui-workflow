// Hand-authored training keys for synthetic teaching specimens only.
(() => {
  'use strict';
  const chapters = [
    {
      id: 'dawn', index: 0, title: '留给下一班的底片', chapter: '记录 01', skill: '识别主干断口',
      reward: 60, plate: 'receiver', motif: '最后一堂课', book: '《乡村教师》', source: '一位病重的教师把牛顿运动定律教给孩子，孩子后来在一次问答中说出了学到的知识。', fragment: '断口手记', station: '监听桅杆',
      lead: '换班前，小王把 C-101 的边框描了一圈，问四七：“明早来的人，怎么知道哪些地方值得接？”四七把底片分成两块给他看。中央的粗纤维断成两截，贴着边框的那一支却已经伸出了取样范围。今晚先留下一份别人也能看懂的记录。',
      objective: '找到画面中央最粗的两截纤维，在它们相向的断口之间补一条线。',
      method: '分别点断口两侧的小亮点，再点「连接」。红圈斜杠标出离开采样框的位置，那里的纤维会继续向外延伸。',
      tip: '沿着较粗的主干从左往右看。主干朝向另一截的两个端点很近，外围的细支不用补。',
      discovery: '一条突起离开取样边界时，图像会出现“尽头”。只凭这个尽头，无法判断突起在组织中止于何处。',
      ending: '四七在中央断口画了一笔，小王在边框外画了一个向外的箭头。换班的人看着两种记号，就知道该去哪里找下一张底片。',
      answer: [['a:end','b:start']]
    },
    {
      id: 'tide', index: 3, title: '迟到的回信', chapter: '记录 02', skill: '追踪微弱信号',
      reward: 80, plate: 'strip', motif: '监听员的回信', book: '《三体》', source: '一名三体监听员收到了来自地球的信号，私自向地球发出警告。', fragment: '微光底片', station: '暗场观测舱',
      lead: '夜班收到一卷几乎空白的记录纸。小王想起《三体》里的监听员，听见只响过一次的信号，也得决定怎样回应。四七把 V-426 转向侧面：“先告诉我，那道淡痕在什么位置还能看见。”他们给弱纤维单独留了一行记录。',
      objective: '补好中央主干，再找到同向延续的微弱独立纤维。共补两处。',
      method: '先找明显的断口，再用视图里的对比度和侧视检查独立的弱纤维。可以逐条补线，最后一起校验。',
      tip: '主干旁有一对整体较暗的独立片段。旋转视角，沿两个片段各自的末梢向外延长，比较它们是否相向。',
      discovery: '显微成像中，局部信号弱会降低追踪把握。亮度需要和走向、邻近片段及不同观察角度一起看。',
      ending: '小王记下暗纤维两端的走向，四七补上观察角度。等下一班接手，就能按同样条件复看那个最淡的断口。',
      answer: [['a:end','b:start'],['e:end','f:start']]
    },
    {
      id: 'parallax', index: 2, title: '借你的眼睛看一眼', chapter: '记录 03', skill: '分清投影交叉',
      reward: 100, plate: 'parallax', motif: '共享一个人的视野', book: '《带上她的眼睛》', source: '一副传感眼镜让远方的人看见佩戴者眼前的风景。', fragment: '视差星片', station: '联合测绘台',
      lead: '灯箱上叠着三层底片。四七在正面圈出一个交叉，小王从侧面看过去，却看见了缝隙。他把椅子推到身旁，说：“坐这儿，借我的角度看一眼。”把两个人看见的东西对齐，才能交回这一整卷外景。',
      objective: '让三对断口各自接续。每补一处，转到侧面或俯视核对深度。',
      method: '正面观察各段的延伸方向，切到侧面检查深度。分别找出三对相向的末端后提交。',
      tip: '留意向右上延伸的主干、向右下拐的弧和较深处的细支。在投影上相交的两段，转到侧面可能相距很远。',
      discovery: '三维突起的二维投影可以相交。判断局部连续性时，正交视角可以提供单张投影中缺失的深度信息。',
      ending: '小王把正视、侧视两张图并排放好。四七复核三处断口，在外景 01 的封面写下两人的名字，把那处只在正面重叠的地方留成了空白。',
      answer: [['a:end','b:start'],['c:end','d:start'],['e:end','f:start']]
    }
  ];
  const sides = [
    {index:1, title:'分叉处的来信', tool:'侧视镜头', setting:'side', description:'小王先记侧视，四七复看分叉。沿分支追踪到末端，登记一组候选连接，或留下证据不足的判断。'},
    {index:4, title:'密林里的回线', tool:'高对比观察', setting:'contrast', description:'四七调整对比度，小王沿淡纤维追踪。记录一组候选连接，或标记证据不足，给下一班留下复核依据。'}
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
      </div>` : `<p class="e18-lock-note">完成记录《${chapters[i-1].title}》后开启</p>`}
    </article>`;
  }
  function fragmentCard(c,i) {
    const done = !!log().cleared[c.id];
    return `<article class="e18-fragment ${done?'is-found':''}">
      <img src="${plate(c)}" alt="" width="70" height="70"><div><small>FIELD NOTE &nbsp; ${view(i+1,2)}</small>
      <h3>${done?c.fragment:'未解封的笔记'}</h3><p>${done?c.discovery:'完成记录《'+c.title+'》后揭开本页。'}</p>
      ${done?chapterButton(c,'查看对应样本','e17-link'):''}</div>
    </article>`;
  }
  function archiveHTML() {
    const n = completionCount();
    return contentShell(head('回声档案')+`<div class="e18-archive">
      <header class="e18-cover">
        <div class="e18-cover-image"><div><small>ECHO ARCHIVE</small><h2>监听站手记</h2><b>北岭站 · 第一卷</b></div></div>
        <div class="e18-cover-caption"><span>外景 01 &nbsp;/&nbsp; 两人的交班底片</span><span>PL. 001</span></div>
      </header>
      <div class="e18-reading"><strong>外景 01 · 值班记录</strong><span>${n} / 3 份记录</span><div class="e18-marks" aria-hidden="true">${chapters.map((_,i)=>'<i class="'+(i<n?'filled':'')+'"></i>').join('')}</div></div>
      <nav class="e18-tabs" aria-label="档案栏目">${[['story','档案故事'],['fragments','研究碎片 · '+n]].map(([k,t])=>'<button aria-pressed="'+(archiveTab===k)+'" data-story-tab="'+k+'">'+t+'</button>').join('')}</nav>
      ${archiveTab==='story'?chapters.map(chapterCard).join(''):chapters.map(fragmentCard).join('')}
      <footer class="e18-colophon"><b>本卷书目</b><p>《乡村教师》写知识如何交到下一个人手里，《三体》写监听员如何回应信号，《带上她的眼睛》写两个人如何共享视野。四七和小王在北岭站交接样本的情节为本作原创。三份训练记录合起来构成外景 01。</p>
      <a href="https://us.macmillan.com/books/9781250370600/thethreebodyproblem/" target="_blank" rel="noopener noreferrer">《三体》↗</a><a href="https://www.chinawriter.com.cn/n1/2021/0202/c404080-32019994.html" target="_blank" rel="noopener noreferrer">《乡村教师》评介 ↗</a><a href="https://edu.cnr.cn/eduzt/ywkwsfsd/jdld/qnjxc/20180513/t20180513_524231341.html" target="_blank" rel="noopener noreferrer">《带上她的眼睛》↗</a></footer>
    </div>`,'archive');
  }
  function taskSheet() {
    const n=completionCount(), m=taskCount();
    const main=chapters.map((c,i)=>{
      const done=!!log().cleared[c.id], open=available(c);
      return '<button class="nt-main-task" data-story-launch="'+c.id+'" '+(open?'':'disabled')+'><i>'+view(i+1,2)+'</i><span><b>'+c.title+'</b><small>'+NeuroTrace3D.taskAt(c.index).id+' · '+c.skill+'</small></span><em>'+(done?'已归档':open?'进入 ›':'待解锁')+'</em></button>';
    }).join('');
    const optional=sides.map(s=>{
      const t=NeuroTrace3D.taskAt(s.index), rec=log().sideRecords[t.id];
      return '<button class="e17-sidecard" '+(trained()?'':'disabled')+' data-story-side="'+s.index+'"><small>'+t.id+' · '+s.tool+'</small><strong>'+s.title+'</strong><p>'+s.description+'</p><span>'+(rec?'已登记 · 重访':trained()?'进入现场 ›':'完成外景 01 后开放')+'</span></button>';
    }).join('');
    return '<div class="overlay" id="taskoverlay"><div class="sheet task-v12-sheet e17-sheet" role="dialog" aria-modal="true" aria-label="任务手册"><div class="handle"></div><div class="sheethead"><h2>任务手册</h2><button class="close" id="close-task" aria-label="关闭任务">×</button></div>'+sectionTitle('主线 · 外景 01', n+' / 3 份记录')+'<p>跟四七、小王一起交接三张底片。三份全部归档，整章完成。</p>'+main+sectionTitle('支线 · 双样本观察委托',m+' / 2 份报告')+'<p>完成主线后，两份样本可以任选先后。两份观察报告齐备，委托结案。</p>'+optional+'<button data-page="archive" class="e17-wide e17-secondary">阅读回声档案 <b>›</b></button></div></div>';
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
    window.NeuroMail?.notify({id:'story-'+c.id,title:'训练回执 · '+c.skill,body:c.ending+' 已收藏「'+c.fragment+'」，本次记录获得 '+awarded+' 积分。',action:'archive'});
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
      if(c.id==='parallax')window.NeuroMail?.refreshField?.();
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
      if(trained())window.NeuroMail?.guestMilestone?.('exterior01');
    }
    result={type:passed?'pass':'retry',first,awarded:first?c.reward:0,match:matching,extra:seen.length-matching,missing:key.length-matching};
    render();
  }
  async function recordSide(kind) {
    if(state.page!=='game'||!state.loggedIn||!trained()||!currentSide()||!['candidate','uncertain'].includes(kind))return;
    const edges=currentEdges();
    if(kind==='candidate'&&!edges.length)return;
    const t=NeuroTrace3D.taskAt(state.taskIndex);
    const report={kind,time:new Date().toISOString(),edges:edges.map(({from,to})=>[from,to])};
    const account=window.NeuroIdentity?.session();
    if(account && !window.NeuroMail?.localFieldOnly?.()){
      if(pending)return;
      const ticket={};
      pending=ticket;
      result={type:'checking'};render();
      try{
        await window.NeuroMail.refreshField({action:'report',sample:t.id,kind,edges:report.edges});
      }catch{
        if(pending===ticket && window.NeuroIdentity?.session()?.id===account.id){result={type:'report-error'};render();}
        return;
      }finally{if(pending===ticket)pending=null;}
      if(window.NeuroIdentity?.session()?.id!==account.id || state.page!=='game' || t.id!==NeuroTrace3D.taskAt(state.taskIndex).id)return;
    }else{
      log().sideRecords[t.id]=report;
      if(taskCount()===2)window.NeuroMail?.guestMilestone?.('fieldpair');
    }
    result={type:'recorded'};
    render();
  }
  function letterButton() {
    const me=window.NeuroIdentity?.session();
    if(me && !['siqi','xiaowang'].includes(me.handle))return '';
    return '<button class="e17-wide" data-story-letter>拆开搭档的来信 <b>›</b></button>';
  }
  function resultSheet() {
    if(!result)return '';
    const c=currentChapter(),s=currentSide(),r=result;
    let title,body,actions;
    if(r.type==='checking'){
      title='正在校验';body='<p>正在向观测站核对本章的连接记录。</p>';actions='';
    } else if(r.type==='report-error'){
      title='报告未获确认';body='<p>请重新检查云端会话和网络，再提交本份报告。</p>';actions='<button class="e17-wide" data-story-dismiss>返回现场</button>';
    } else if(r.type==='service-error'){
      title='未取得校验回执';body='<p>请检查登录状态或网络连接，再次校验。观测站会核对已有记录，首次奖励只发一次。</p>';actions='<button class="e17-wide" data-story-dismiss>返回现场 <b>›</b></button>';
    } else if(r.type==='pass'){
      title=r.first?'观察记录已归档':'复习校验通过';
      body='<div class="e17-result-mark">✧</div><p>'+c.ending+'</p><div class="e17-clearance"><b>'+(r.first?resourceIcon('points')+' +'+r.awarded+' 积分 · 解锁「'+c.fragment+'」':'本记录的积分和碎片已领取')+'</b><span>'+c.discovery+'</span></div>';
      actions='<button class="e17-wide" data-story-return>回到回声档案 <b>›</b></button><button class="e17-wide e17-secondary" data-story-city>对照鼠脑图谱 <b>›</b></button>';
      if(c.id==='parallax'){title='外景 01 已归档';actions=letterButton()+actions;}
    } else if(r.type==='retry'){
      title='再看一眼这份样本';
      body='<div class="e17-clearance"><b>已匹配 '+r.match+' / '+c.answer.length+' 处</b><span>'+[r.extra?'有 '+r.extra+' 条多余连接，可点选带菱形标记的虚线后删除。':'',r.missing?'还缺 '+r.missing+' 处断口。':''].join(' ')+'</span></div><p>'+c.tip+'</p>';
      actions='<button class="e17-wide" data-story-dismiss>返回现场继续观察 <b>›</b></button>';
    } else if(r.type==='side'){
      title='登记观察 · '+s.title;
      body='<p>当前草稿有 '+currentEdges().length+' 条候选连接。可以提交给后续复核，也可以表明证据不足。' +(window.NeuroIdentity?.session()&&!window.NeuroMail?.localFieldOnly?.()?'报告保存到当前云端账号。':'观察报告保存在本机。')+'</p>';
      actions='<button class="e17-wide" data-story-record="candidate" '+(!currentEdges().length?'disabled':'')+'>登记候选连接 <b>›</b></button><button class="e17-wide e17-secondary" data-story-record="uncertain">登记为证据不足 <b>›</b></button>';
    } else {
      title='观察记录已保存';
      const rec=log().sideRecords[NeuroTrace3D.taskAt(state.taskIndex).id];
      body='<p>'+s.title+' · '+(rec.kind==='candidate'?rec.edges.length+' 条候选连接':'证据不足')+'。状态为待复核，可从任务列表重返样本。</p>';
      actions='<button class="e17-wide" data-story-sideboard>返回任务手册 <b>›</b></button>';
      if(taskCount()===2){title='双样本委托已结案';actions=letterButton()+actions;}
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
    on('[data-story-letter]',()=>{const id=currentChapter()?'exterior01':'fieldpair';result=null;window.NeuroMail?.openMilestone?.(id);});
    on('[data-story-city]',()=>{result=null;setPage('civil');});
    on('[data-story-record]',b=>recordSide(b.dataset.storyRecord));
    on('[data-story-sideboard]',()=>{result=null;state.page=state.mainPage=state.previous='game';state.taskOpen=true;render();});
  }
  window.NeuroStory={init,reset,syncRemote,archiveHTML,taskSheet,taskHelpSheet,gameChip,resultSheet,submitLabel,bind,taskCount,completionCount};
})();
