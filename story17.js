// Hand-authored training keys for synthetic teaching specimens only.
(() => {
  'use strict';
  const chapters = [
    {
      id: 'dawn', index: 0, title: '留给下一班的底片', chapter: '记录 01', skill: '识别主干断口',
      reward: 600, plate: 'receiver', motif: '最后一堂课', book: '《乡村教师》', source: '一位病重的教师把牛顿运动定律教给孩子，孩子后来在一次问答中说出了学到的知识。', fragment: '断口手记', station: '监听桅杆',
      lead: '接班时，灯箱旁放着一张 C-101 底片。中央的粗纤维断成两截，贴着边框的那支却伸出了取样范围。下一班能分清这两种“断口”吗？请给他们留一张带记号的底片。',
      objective: '找到画面中央最粗的两截纤维，在它们相向的断口之间补一条线。',
      method: '分别点断口两侧的小亮点，再点「连接」。红圈斜杠标出离开采样框的位置，那里的纤维会继续向外延伸。',
      tip: '沿着较粗的主干从左往右看。主干朝向另一截的两个端点很近，外围的细支不用补。',
      discovery: '一条突起离开取样边界时，图像会出现“尽头”。只凭这个尽头，无法判断突起在组织中止于何处。',
      ending: '底片中央多了一笔连线，边框上留着一个向外的箭头。换班的人看着两种记号，就知道该去哪里找下一张底片。',
      answer: [['a:end','b:start']]
    },
    {
      id: 'tide', index: 3, title: '迟到的回信', chapter: '记录 02', skill: '追踪微弱信号',
      reward: 800, plate: 'strip', motif: '监听员的回信', book: '《三体》', source: '一名三体监听员收到了来自地球的信号，私自向地球发出警告。', fragment: '微光底片', station: '暗场观测舱',
      lead: '夜班收到一卷几乎空白的记录纸。纸上有一道很淡的痕迹，值班记录只写着“待核实”。把 V-426 转向侧面，再调一点对比度。如果痕迹仍然沿着同一方向延伸，下一班就有理由重新检查它。',
      objective: '补好中央主干，再找到同向延续的微弱独立纤维。共补两处。',
      method: '先找明显的断口，再用视图里的对比度和侧视检查独立的弱纤维。可以逐条补线，最后一起校验。',
      tip: '主干旁有一对整体较暗的独立片段。旋转视角，沿两个片段各自的末梢向外延长，比较它们是否相向。',
      discovery: '显微成像中，局部信号弱会降低追踪把握。亮度需要和走向、邻近片段及不同观察角度一起看。',
      ending: '值班本上记录了暗纤维两端的走向，也留下了观察角度。等下一班接手，就能按同样条件复看那个最淡的断口。',
      answer: [['a:end','b:start'],['e:end','f:start']]
    },
    {
      id: 'parallax', index: 2, title: '借你的眼睛看一眼', chapter: '记录 03', skill: '分清投影交叉',
      reward: 1000, plate: 'parallax', motif: '共享一个人的视野', book: '《带上她的眼睛》', source: '一副传感眼镜让远方的人看见佩戴者眼前的风景。', fragment: '视差星片', station: '联合测绘台',
      lead: '灯箱上叠着三层底片。正面看，有两根纤维仿佛在同一点相交。把灯箱转向侧面，那个交点却分成了一前一后两个端点。请把这两个角度留在同一份记录里，让接班人也能看见那段距离。',
      objective: '让三对断口各自接续。每补一处，转到侧面或俯视核对深度。',
      method: '正面观察各段的延伸方向，切到侧面检查深度。分别找出三对相向的末端后提交。',
      tip: '留意向右上延伸的主干、向右下拐的弧和较深处的细支。在投影上相交的两段，转到侧面可能相距很远。',
      discovery: '三维突起的二维投影可以相交。判断局部连续性时，正交视角可以提供单张投影中缺失的深度信息。',
      ending: '正视、侧视两张图并排夹进档案。三处断口已经复核，那处只在正面重叠的地方留成了空白。外景 01 可以归档了。',
      answer: [['a:end','b:start'],['c:end','d:start'],['e:end','f:start']]
    }
  ];
  // The first volume has three cloud-ledger records. The other volumes are locally graded teaching plates.
  const stationRecords = [...chapters];
  chapters.push(
    {
      id:'relay', index:5, volume:1, chapter:'镜湖站 · 记录 01', title:'同夜的两份电报', skill:'分开平行双路', plate:'relay', fragment:'双路电报码',
      lead:'镜湖的北岸和南岸各架了一根天线。那夜，两份电报落在同一行纸带上，接线员拿不准哪半句属于哪一岸。她把转台留给你，嘱咐你从侧面再读一次。',
      objective:'各补一处前层和后层的断口，让两条平行纤维独立延续。', method:'先从正面找出两路重叠的位置，再侧转模型。各自在同一深度找相向的两截，连接后一起校验。',
      tip:'粗主干和细纤维走向很接近。转到侧面时，两路之间会显出较大的深度间隔。', short:'在两个深度分别补线',
      discovery:'两条纤维可以朝同一方向延伸，也可以在正视图上重叠。侧视能检验缺口两端是否真的在同一层。',
      ending:'接线员把两份电报分装进标着南岸和北岸的纸套。秋夜里，两处灯塔都回了一声短促的确认。', answer:[['a:end','b:start'],['c:end','d:start']]
    },{
      id:'margin', index:6, volume:2, chapter:'潮汐站 · 记录 01', title:'末页空着的一格', skill:'辨认采样边界', plate:'margin', fragment:'潮位边界尺',
      lead:'退潮以后，观测员捡回一本泡皱的潮汐簿。折痕擦掉了曲线的一小截，纸边也少了一角。她只肯重画纸面里有来有去的那一笔，把残页交给你。',
      objective:'补全框内弯曲主干的一处间隙，给伸出采样框的线保留开口。', method:'打开「边界末端」标记，沿主干的转弯方向追踪。把弯道内部相向的两截接回，保留边界处原貌。',
      tip:'看弯道顶部。间隙两侧都能在画面里找到后续走向。红圈斜杠表示纤维已离开取样框。', short:'补弯道，保留边界',
      discovery:'框内缺口的两侧都有可见片段。对超出视野的纤维，单凭这块样本无法判断它在框外如何延伸。',
      ending:'潮汐簿的转弯补好了，末页边沿依旧留白。观测员在空格上盖了一枚小章，写下“等下一幅”。', answer:[['a:end','b:start']]
    },{
      id:'register', index:7, volume:3, chapter:'山脊站 · 记录 01', title:'山脊上的第三盏灯', skill:'复核分叉两臂', plate:'register', fragment:'山脊岔路签',
      lead:'山脊站给两条下山路各留一盏灯。雾起时，远坡上的第三盏恰好挤进两灯之间。守站人摊开旧图，把铅笔搁在岔路口，请你顺着两条路各走一次。',
      objective:'从共同分叉出发，分别接回上、下两臂。远处投影靠近的纤维保持独立。', method:'在 Y 形交点处开始，一次只沿一臂走。比较断口前后的走向和深度，为两臂各添一条连接。',
      tip:'沿上臂向右上方追，沿下臂向右下方追。对上臂附近的另一根纤维，可侧转比较其与断口的距离。', short:'沿分叉两臂逐条复核',
      discovery:'先确认共同分叉，再沿两支分别追踪，可以减少跨线误接。一个投影近邻不一定属于这处分叉。',
      ending:'守站人将两枚路签挂回岔口。第三盏灯还亮在远坡上，今晚的行路人终于能读懂这张图了。', answer:[['a:end','b:start'],['c:end','d:start']]
    }
  );
  if (typeof module!=='undefined' && module.exports) {
    const scene=require('./scene3d');
    module.exports=Object.fromEntries(chapters.map(c=>[scene.taskAt(c.index).id,c.answer]));
    return;
  }
  const volumes = [
    {name:'监听站手记',site:'北岭站',place:'观测站的交班底片',image:'assets/archive18-station.webp',tone:'station'},
    {name:'镜湖双城电台',site:'镜湖站',place:'湖两岸的同频来信',image:'assets/archive22-relay-cover.webp',record:'assets/archive22-relay-record.webp',tone:'relay'},
    {name:'退潮后的来信',site:'潮汐站',place:'测潮员的残页',image:'assets/archive22-margin-cover.webp',record:'assets/archive22-margin-record.webp',tone:'margin'},
    {name:'山脊校片室',site:'山脊站',place:'雾中三灯的方位图',image:'assets/archive22-register-cover.webp',record:'assets/archive22-register-record.webp',tone:'register'}
  ];
  let activeVolume=0;
  const volumeOf=c=>c.volume || 0;
  const volumeRecords=i=>chapters.filter(c=>volumeOf(c)===i);
  const sides = [
    {index:1, title:'分叉处的来信', tool:'侧视镜头', setting:'side', description:'先记侧视，再复看分叉。沿分支追踪到末端，登记一组候选连接，或留下证据不足的判断。'},
    {index:4, title:'密林里的回线', tool:'高对比观察', setting:'contrast', description:'调好对比度，沿淡纤维追踪。记录一组候选连接，或标记证据不足，给下一班留下复核依据。'}
  ];
  let result = null, pending = null;
  let archiveTab = 'story';
  const currentChapter = () => chapters.find(c => c.index === state.taskIndex);
  const currentSide = () => sides.find(s => s.index === state.taskIndex);
  const log = () => state.story17;
  const completionCount = () => stationRecords.filter(c => log().cleared[c.id]).length;
  const taskCount = () => sides.filter(s => log().sideRecords[NeuroTrace3D.taskAt(s.index).id]).length;
  const signedInAccount=()=>window.NeuroIdentity?.session?.();
  const passedRecord = c => c.volume
    ? !!(log().sampleCleared[c.id] || window.NeuroQuality?.cloudCleared?.(c))
    : !!log().cleared[c.id];
  const available = c => !!c.volume || stationRecords.indexOf(c) <= completionCount();
  const trained = () => completionCount() === stationRecords.length;
  const currentEdges = () => state.addedEdges.filter(e => e.taskId === NeuroTrace3D.taskAt(state.taskIndex).id);
  const emptyLog = () => ({cleared:{}, sampleCleared:{}, attempts:{}, sideRecords:{}, quality21:{}});
  const view = (s,n) => String(s).padStart(n,'0');
  function init(storageKey = window.neuroSaveKey?.() || 'neurotrace-demo-v12') {
    pending = result = null;
    let prior;
    try { prior = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
    state.story17 = emptyLog();
    if (!prior) state.score = 0;
    const data = prior?.story17;
    if (data) {
      for (const c of stationRecords) {
        if (!data.cleared?.[c.id] || !available(c)) break;
        log().cleared[c.id] = true;
      }
      for (const c of chapters) {
        if (c.volume && data.sampleCleared?.[c.id]===true) log().sampleCleared[c.id]=true;
        const attempts = data.attempts?.[c.id];
        if (Number.isSafeInteger(attempts) && attempts > 0) log().attempts[c.id] = attempts;
      }
      if (trained()) for (const s of sides) {
        const id = NeuroTrace3D.taskAt(s.index).id;
        if (['candidate','uncertain'].includes(data.sideRecords?.[id]?.kind)) log().sideRecords[id] = data.sideRecords[id];
      }
    }
    if(window.NeuroQuality) log().quality21=NeuroQuality.restore(data?.quality21,chapters,sides);
    ensurePlayable();
    activeVolume=currentChapter()?.volume || 0;
    archiveTab='story';
  }
  function ensurePlayable() {
    const c = currentChapter();
    if ((c && available(c)) || (currentSide() && trained())) return;
    state.taskIndex = stationRecords[Math.min(completionCount(),stationRecords.length-1)].index;
    state.selectedNodes=[];state.selectedEdgeId=state.selectedOriginalSegmentId=state.selectedBoundaryEndpointId=null;
    state.camera3d=null;state.undoStack=[];
  }
  function syncRemote(account, cleared) {
    if (!account || !Number.isSafeInteger(account.points) || account.points<0 || !Array.isArray(cleared)) return false;
    state.score=account.points;
    log().cleared={};
    for(const c of stationRecords){
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
    activeVolume=0;
  }
  function sectionTitle(label, sub) {
    return '<div class="e17-section"><h3>'+label+'</h3><small>'+sub+'</small></div>';
  }
  function chapterButton(c, text, cls = '') {
    return '<button type="button" class="e17-btn '+cls+'" data-story-launch="'+c.id+'">'+text+' <b aria-hidden="true">›</b></button>';
  }
  const plate = c => c.volume ? volumes[c.volume].record : 'assets/archive18-'+c.plate+'.webp';
  function chapterCard(c,i) {
    const passed = passedRecord(c), canPlay = available(c);
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
        <div class="e18-file-actions"><small>${c.volume ? '藏品 · '+c.fragment : resourceIcon('points')+' '+c.reward+' 积分'}</small>${chapterButton(c,passed?'重返现场':log().attempts[c.id]?'继续训练':'进入三维现场')}</div>
        ${c.volume ? '<div class="e21-edition">原创外景 · 合成训练样本 · '+(signedInAccount()?'账号藏品':'试玩藏品')+'</div>' : '<details class="e18-source"><summary>故事原型 · '+c.motif+'</summary><p>'+c.book+'中，'+c.source+' 北岭值班记录与本章样本为本游戏原创。</p></details>'}
      </div>` : `<p class="e18-lock-note">完成记录《${chapters[i-1].title}》后开启</p>`}
    </article>`;
  }
  function fragmentCard(c,i) {
    const done = passedRecord(c);
    return `<article class="e18-fragment ${done?'is-found':''}">
      <img src="${plate(c)}" alt="" width="70" height="70"><div><small>FIELD NOTE &nbsp; ${view(i+1,2)}</small>
      <h3>${done?c.fragment:'未解封的笔记'}</h3><p>${done?c.discovery:'完成记录《'+c.title+'》后揭开本页。'}</p>
      ${done?chapterButton(c,'查看对应样本','e17-link'):''}</div>
    </article>`;
  }
  function archiveHTML() {
    const v=volumes[activeVolume], records=volumeRecords(activeVolume), n=records.filter(passedRecord).length;
    const picker=volumes.map((item,i)=>{
      const rs=volumeRecords(i), k=rs.filter(passedRecord).length;
      return `<button type="button" class="e21-ticket" data-story-volume="${i}" aria-pressed="${i===activeVolume}" aria-label="外景 ${view(i+1,2)} ${item.name}，已归档 ${k} 份，共 ${rs.length} 份">
        <img src="${item.image}" alt=""><span><small>PL. ${view(i+1,2)} · ${item.site}</small><strong>${item.name}</strong></span><i aria-hidden="true">${k===rs.length?'✓':'›'}</i></button>`;
    }).join('');
    return contentShell(head('回声档案')+`<div class="e18-archive e21-${v.tone}">
      <header class="e18-cover">
        <div class="e18-cover-image" ${activeVolume?'style="--plate:url('+v.image+')"':''}><div><small>ECHO ARCHIVE</small><h2>${v.name}</h2><b>${v.site} · 外景 ${view(activeVolume+1,2)}</b></div></div>
        <div class="e18-cover-caption"><span>${v.place}</span><span>PL. ${view(activeVolume+1,3)}</span></div>
      </header>
      <div class="e21-index-head"><strong>外景目录</strong><small>FIELD INDEX &nbsp; / &nbsp; 04</small></div>
      <nav class="e21-index" aria-label="选择故事章节">${picker}</nav>
      <div class="e18-reading"><strong>外景 ${view(activeVolume+1,2)} · 训练记录</strong><span>${n} / ${records.length} 份归档</span><div class="e18-marks" aria-hidden="true">${records.map(c=>'<i class="'+(passedRecord(c)?'filled':'')+'"></i>').join('')}</div></div>
      <nav class="e18-tabs" aria-label="档案栏目">${[['story','档案故事'],['fragments','研究碎片 · '+n]].map(([k,t])=>'<button aria-pressed="'+(archiveTab===k)+'" data-story-tab="'+k+'">'+t+'</button>').join('')}</nav>
      ${archiveTab==='story'?records.map(chapterCard).join(''):records.map(fragmentCard).join('')}
      ${activeVolume ? '<footer class="e18-colophon"><b>编目附记</b><p>本章使用预设连线答案，可反复练习。'+(signedInAccount()?'满分成绩同步后，登录同一账号即可在其他设备翻阅外景笔记。':'通过后可在这台设备收藏外景笔记。')+'</p></footer>' :
      `      <footer class="e18-colophon"><b>本卷书目</b><p>《乡村教师》写知识如何交到下一个人手里，《三体》写监听员如何回应信号，《带上她的眼睛》写两个人如何共享视野。北岭站的交班记录为本作原创。三份训练记录合起来构成外景 01。</p>
      <a href="https://us.macmillan.com/books/9781250370600/thethreebodyproblem/" target="_blank" rel="noopener noreferrer">《三体》↗</a><a href="https://www.chinawriter.com.cn/n1/2021/0202/c404080-32019994.html" target="_blank" rel="noopener noreferrer">《乡村教师》评介 ↗</a><a href="https://edu.cnr.cn/eduzt/ywkwsfsd/jdld/qnjxc/20180513/t20180513_524231341.html" target="_blank" rel="noopener noreferrer">《带上她的眼睛》↗</a></footer>`}
    </div>`,'archive');
  }
  function taskSheet() {
    const n=completionCount(), m=taskCount();
    const main=stationRecords.map((c,i)=>{
      const done=!!log().cleared[c.id], open=available(c);
      return '<button class="nt-main-task" data-story-launch="'+c.id+'" '+(open?'':'disabled')+'><i>'+view(i+1,2)+'</i><span><b>'+c.title+'</b><small>'+NeuroTrace3D.taskAt(c.index).id+' · '+c.skill+'</small></span><em>'+(done?'已归档':open?'进入 ›':'待解锁')+'</em></button>';
    }).join('');
    const sampleList=chapters.filter(c=>c.volume).map(c=>'<button class="nt-main-task" data-story-launch="'+c.id+'"><i>'+view(c.volume+1,2)+'</i><span><b>'+volumes[c.volume].name+'</b><small>'+c.skill+' · '+NeuroTrace3D.taskAt(c.index).id+'</small></span><em>'+(passedRecord(c)?'已归档':'进入 ›')+'</em></button>').join('');
    const optional=sides.map(s=>{
      const t=NeuroTrace3D.taskAt(s.index), rec=log().sideRecords[t.id];
      return '<button class="e17-sidecard" '+(trained()?'':'disabled')+' data-story-side="'+s.index+'"><small>'+t.id+' · '+s.tool+'</small><strong>'+s.title+'</strong><p>'+s.description+'</p><span>'+(rec?'已登记 · 重访':trained()?'进入现场 ›':'完成外景 01 后开放')+'</span></button>';
    }).join('');
    return '<div class="overlay" id="taskoverlay"><div class="sheet task-v12-sheet e17-sheet" role="dialog" aria-modal="true" aria-label="任务手册"><div class="handle"></div><div class="sheethead"><h2>任务手册</h2><button class="close" id="close-task" aria-label="关闭任务">×</button></div>'+sectionTitle('回声主线 · 外景 01', n+' / 3 份记录')+'<p>依次复核三张底片。三份全部归档，整章完成。</p>'+main+sectionTitle('回声主线 · 独立外景','03 章')+'<p>任选一章，阅读故事并用训练底片完成一次复核。</p>'+sampleList+sectionTitle('观察委托 · 双样本复核',m+' / 2 份报告')+'<p>完成外景 01 后，两份样本可以任选先后。留下候选连接，或记下证据不足的判断，两份观察报告齐备后结案。</p>'+optional+(window.NeuroQuality?.panel(log().quality21,chapters,sides,log().sideRecords,trained())||'')+'<button data-page="archive" class="e17-wide e17-secondary">阅读回声档案 <b>›</b></button></div></div>';
  }
  function gameChip() {
    const c=currentChapter(), s=currentSide();
    const heading = c?c.chapter+' · '+c.title:'观察委托 · '+s.title;
    const objective = c ? c.short || ({dawn:'点主干两端，再连接',tide:'找主干与弱纤维',parallax:'从侧面核对深度'})[c.id] : '待复核观察';
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
    if(c)activeVolume=volumeOf(c);
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
    window.NeuroQuality?.observe(log().quality21,c,edges);
    const seen = edges.map(e => pair(e.from,e.to));
    const key = c.answer.map(([a,b]) => pair(a,b));
    const matching = key.filter(x => seen.includes(x)).length;
    log().attempts[c.id]=(log().attempts[c.id]||0)+1;
    const passed=matching===key.length && seen.length===key.length;
    const account=window.NeuroIdentity?.session();
    if(passed && account && !c.volume) return submitGraded(c,account,edges);
    const first=passed&&!passedRecord(c);
    if(passed && c.volume) log().sampleCleared[c.id]=true;
    if(first && !c.volume){
      log().cleared[c.id]=true;
      state.score+=c.reward;
      sendReceipt(c,c.reward);
    }
    if(passed) persistDemo();
    result={type:passed?'pass':'retry',first,awarded:first?(c.reward||0):0,match:matching,extra:seen.length-matching,missing:key.length-matching};
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
    }
    result={type:'recorded'};
    render();
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
      if(c.volume){
        title=r.first?(signedInAccount()?'本章校验通过':'外景 '+view(c.volume+1,2)+' 已归档'):'复习校验通过';
        body='<div class="e17-result-mark">✧</div><p>'+c.ending+'</p><div class="e17-clearance"><b>'+(signedInAccount()?'外景笔记':r.first?'首次收藏':'已收藏')+' · '+c.fragment+'</b><span>'+c.discovery+'</span></div>';
      }
      if(c.id==='parallax'){title='外景 01 已归档';}
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
      if(taskCount()===2){title='双样本委托已结案';}
    }
    if(c && (r.type==='pass'||r.type==='retry'))body+=window.NeuroQuality?.feedback(log().quality21,c)||'';
    return '<div id="story-result" class="overlay"><div class="sheet e17-sheet" role="dialog" aria-modal="true" aria-label="'+title+'"><div class="handle"></div><div class="sheethead"><h2>'+title+'</h2>'+(r.type==='checking'?'':'<button class="close" data-story-dismiss aria-label="关闭结果">×</button>')+'</div>'+body+actions+'</div></div>';
  }
  function bind() {
    const on=(selector,fn)=>document.querySelectorAll(selector).forEach(b=>b.addEventListener('click',()=>fn(b)));
    window.NeuroQuality?.bind(log().quality21,chapters,sides,log().sideRecords,trained());
    on('[data-story-volume]',b=>{const next=Number(b.dataset.storyVolume);if(!volumes[next])return;activeVolume=next;archiveTab='story';render();document.querySelector?.('[data-story-volume="'+next+'"]')?.focus({preventScroll:true});});
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
  window.NeuroStory={init,reset,syncRemote,archiveHTML,taskSheet,taskHelpSheet,gameChip,resultSheet,submitLabel,bind,taskCount,completionCount};
})();
