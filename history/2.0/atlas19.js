// Atlas slices are anatomical references. All five playable geometries are synthetic.
(() => {
  'use strict';
  const sections = {world:'世界版图', samples:'任务对照', field:'识别手册'};
  const slices = {51:'靠近中线',40:'中间层面',30:'较外侧'};
  const regions = {
    Isocortex:['新皮层','在脑的外侧可以看到一层弯曲的皮层。不同皮层区参与触觉、视觉和运动等活动。','#95ccc0'],
    HPF:['海马结构','海马及其相邻结构参与空间导航和记忆。识别一段突起的形状，可以描述它在哪里分叉；要研究它何时放电，还需要活动记录。','#edbd80'],
    TH:['丘脑','多种感觉信号经丘脑到达皮层。例如，来自身体的触觉信息会经特定的丘脑核团传往躯体感觉皮层。','#c39dc5'],
    CB:['小脑','小脑参与动作协调和运动学习。伸手够一个物体时，动作的时序和误差调整都涉及小脑回路。','#9bb7df']
  };
  const samples = {
    'C-101':['沿主干找断口','从清晰的主干向两侧追。遇到边框就停下，留意还有哪些分支离开了视野。','皮层是这个练习的教学主题。突起越过采样边界时，图像在此结束，组织中的突起可能继续延伸。'],
    'H-204':['辨认分叉','从一个确定的点向外追踪，转到另一个角度，检查两支是否真的在同一处汇合。','某个分叉可以属于同一细胞；投影里两段贴得很近，还需要结合深度核对。海马是本例的教学主题。'],
    'T-315':['拆开投影交叉','比较正视和侧视。同一屏幕位置的两段，可能处于完全不同的深度。','丘脑含多个向皮层投射的核团。确定一条纤维的投射去向，需要跨片段的完整追踪与位置配准。'],
    'V-426':['沿弱信号追踪','从信号最清楚的一端往回看，比较间隙两侧的走向与深度。','标记强度和成像条件都会影响可见度。仅据一段变暗的荧光，无法判断细胞活动减弱。'],
    'D-537':['拆分密集纤维','一次只跟一条。先沿轮廓连续追踪，遇到交错就换视角，证据不足的位置留给复核。','多条突起可以穿过同一小块组织。光镜下空间邻近，仍需更多证据才能判定两细胞之间是否存在突触。']
  };
  const guide = [
    ['01','胞体与突起','先找细胞的大致轮廓','若标记覆盖胞体，可先找相对膨大的细胞体，再沿与它连续的细长结构追踪。局部切块可能只包含某段突起。'],
    ['02','分叉与交叉','换个方向看交点','真正的分叉有共同的起点；二维投影里，两段分处不同深度的突起也会叠在一起。切换观察角度，看交点是否分开。'],
    ['03','断口与边界','给不确定的地方留白','两截相向只是候选线索，还要检查深度和邻近结构。在真实样本中，应回看原始图像的相邻层；超出视野的末端保留为边界。']
  ];
  let section='world', slice=40, region='Isocortex', layer='task', sample=null, projection='front', lesson=0;
  function toggle(key,value,caption,selected){
    return '<button type="button" data-atlas-'+key+'="'+value+'" aria-pressed="'+(String(value)===String(selected))+'">'+caption+'</button>';
  }
  function link(url,label){ return '<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+' ↗</a>'; }
  function tabs(){
    return '<nav class="a19-tabs" aria-label="文明栏目">'+Object.entries(sections).map(([key,label])=>toggle('section',key,label,section)).join('')+'</nav>';
  }
  function anatomy(){
    const use=(key,fill,opacity=1)=>'<use href="assets/atlas19-ccf.svg#a'+slice+'-'+key+'" fill="'+fill+'" stroke="'+fill+'" stroke-width=".13" opacity="'+opacity+'"/>';
    return '<svg class="a19-brain" viewBox="-8 -5 148 90" role="img" aria-label="成年小鼠参考脑矢状切面，左为前方、上为背侧。当前高亮'+regions[region][0]+'">'+use('base','#416778')+
      Object.keys(regions).map(key=>use(key,regions[key][2],key===region?1:.53)).join('')+use('fiber','#203a4a',.84)+'<use href="assets/atlas19-ccf.svg#a'+slice+'-detail" fill="none" stroke="#d0e3db" stroke-width=".23" opacity=".37"/></svg>';
  }
  function world(){
    const task=NeuroTrace3D.taskAt(state.taskIndex);
    return '<section class="a19-plate"><div class="a19-meta"><span>PLATE 01 / SAGITTAL</span><span>CCFv3 · 2017</span></div>'+
      '<div class="a19-field"><span class="a19-orient">背侧 ↑</span>'+anatomy()+'<span class="a19-ap">前 ←</span><span class="a19-ml">矢状面 · ML '+slice+'/113</span></div>'+
      '<div class="a19-switch" aria-label="选择矢状层面">'+[51,40,30].map(s=>toggle('slice',s,slices[s],slice)).join('')+'</div></section>'+
      '<div class="a19-label">01 &nbsp;/&nbsp; 脑区索引</div><div class="a19-regions">'+Object.entries(regions).map(([id,v])=>toggle('region',id,'<i style="background:'+v[2]+'"></i>'+v[0],region)).join('')+'</div>'+
      '<p class="a19-reading" aria-live="polite"><b>'+regions[region][0]+'</b>'+regions[region][1]+'</p>'+
      '<div class="a19-label">02 &nbsp;/&nbsp; 任务图层</div><div class="a19-layers">'+toggle('layer','task','我的当前任务',layer)+toggle('layer','approved','已认可贡献',layer)+'</div>'+
      (layer==='task'?'<div class="a19-ledger"><strong>'+esc(task.id)+' · '+esc(samples[task.id]?.[0]||task.name)+'</strong><p>当前是合成训练样本，无实验脑坐标。</p><button type="button" data-atlas-current>查看这一片段 <b>→</b></button></div>':
      '<div class="a19-ledger"><strong>等待第一份已定位的贡献</strong><p>研究者复核真实样本并将它配准到参考脑后，这里才能按参与者显示纤维。游戏积分和练习记录单独保存。</p></div>')+
      '<details class="a19-notes"><summary>图版来源与读法</summary><p>底图取自 Allen Institute for Brain Science 的 Allen Mouse Brain Common Coordinate Framework v3。这里展示 2017 标注体积的三个真实切面，体素边长 100 µm。颜色为本页重新分组设定。ML 是左右轴的体素索引。</p><p>同一个切面内的颜色表示组织分区。要把一条实验纤维画在上面，还需要标本、从原图到此图谱的空间变换以及审核记录。</p>'+
      link('https://atlas.brain-map.org/','探索 Allen 原始图谱')+' '+link('https://doi.org/10.1016/j.cell.2020.04.007','Wang 等，2020')+' '+link('https://alleninstitute.org/terms-of-use/','研究与非商业使用条款')+'</details>';
  }
  function samplePlot(task) {
    const axes=projection==='front'?[0,1]:[2,1];
    const map=p=>[+(150+33*p[axes[0]]).toFixed(1),+(80-30*p[axes[1]]).toFixed(1)];
    const paths=task.segments.map(s=>'<polyline fill="none" stroke="'+(task.id==='V-426'&&['e','f'].includes(s.id)?'#677f88':'#c2e6cf')+'" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" points="'+s.p.map(p=>map(p).join(',')).join(' ')+'"/>').join('');
    return '<svg viewBox="24 5 251 148" role="img" aria-label="'+esc(task.id)+' 的合成几何，'+(projection==='front'?'XY 正视':'ZY 侧视')+'">'+paths+'</svg>';
  }
  function sampleView() {
    const index=sample??state.taskIndex, task=NeuroTrace3D.taskAt(index), entry=samples[task.id];
    return '<label class="a19-select">选择训练样本<select data-atlas-select>'+NeuroTrace3D.TASKS.map((s,i)=>'<option value="'+i+'" '+(i===index?'selected':'')+'>'+esc(s.id)+' · '+esc(samples[s.id][0])+'</option>').join('')+'</select></label>'+
      '<section class="a19-plate"><div class="a19-meta"><span>SPECIMEN / '+esc(task.id)+'</span><span>合成几何</span></div><div class="a19-specimen">'+samplePlot(task)+'</div><div class="a19-switch">'+toggle('projection','front','正视 XY',projection)+toggle('projection','side','侧视 ZY',projection)+'</div></section>'+
      '<div class="a19-label">观察笔记</div><h3>'+entry[0]+'</h3><p>'+entry[1]+'</p><div class="a19-reading"><b>生理知识</b>'+entry[2]+'</div>'+
      '<div class="a19-ledger"><strong>脑内位置 · 尚无配准</strong><p>这一页的线条来自游戏现场的同一组模型坐标。样本编号与训练主题不能用来推断脑内位置。</p>'+
      (index===state.taskIndex?'<button type="button" data-atlas-resume>回到当前三维现场 <b>→</b></button>':'<button type="button" data-atlas-tasks>查看任务与解锁条件 <b>→</b></button>')+'</div>';
  }
  const diagrams=[
    '<path d="M70 58Q91 56 102 42L118 20M101 43L94 22M94 22L84 15M72 66Q83 81 102 93L116 105M96 90L96 105M64 47L53 29L37 20M54 31L59 12M58 54L36 48L17 39M57 64L34 74L22 85M90 59C122 59 130 68 153 62S185 38 212 40M173 54Q194 71 221 65"/><path fill="#ccead7" d="M54 56Q53 48 62 48Q68 44 75 51L90 59L75 64Q67 77 58 66Q51 66 54 56Z"/>',
    '<path d="M16 79Q58 55 89 56T207 32M89 56Q118 39 134 14"/><path stroke="#f1bd89" stroke-dasharray="5 3" d="M25 24Q91 68 120 72T210 89"/>',
    '<path d="M19 71Q43 66 59 61T96 57M116 56Q148 56 164 39T208 17"/><path d="M63 60Q57 40 51 26M165 39Q188 53 211 53"/><path fill="none" stroke="#efc58d" stroke-dasharray="2 3" d="M90 47h32v19H90z"/>'
  ];
  function field(){
    return '<div class="a19-label">FIELD GUIDE &nbsp;/&nbsp; 形态观察</div><div class="a19-lessons">'+guide.map((g,i)=>toggle('lesson',i,g[1],lesson)).join('')+'</div>'+
      '<div class="a19-plate"><div class="a19-meta"><span>FIG. '+guide[lesson][0]+'</span><span>形态示意</span></div><svg class="a19-figure" viewBox="0 0 240 116" role="img" aria-label="'+guide[lesson][1]+'教学示意"><g fill="none" stroke="#b2dac9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+diagrams[lesson]+'</g></svg></div>'+
      '<h3>'+guide[lesson][2]+'</h3><p>'+guide[lesson][3]+'</p><div class="a19-reading"><b>形态与功能</b>树突常接收来自其他细胞的输入，轴突可把信号传向远处。要区别突起类型、确认突触或判断信号方向，还要结合标记、组织位置和相应实验。</div>'+
      '<div class="a19-label">延伸阅读</div><div class="a19-sources">'+link('https://www.janelia.org/project-team/mouselight/resources','MouseLight · 单神经元重建')+link('https://www.ncbi.nlm.nih.gov/books/NBK11001/','Neuroscience · 突触传递')+'</div>';
  }
  function contents(){ return tabs()+(section==='world'?world():section==='samples'?sampleView():field()); }
  function civilHTML(){
    return contentShell('<div class="a19"><div id="a19-body">'+contents()+'</div></div>','civil');
  }
  function refresh(key,value) {
    const body=document.getElementById('a19-body');
    if(!body)return;
    body.innerHTML=contents();
    if(key) body.querySelector('[data-atlas-'+key+(value==null?'':'="'+value+'"')+']')?.focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    const button=e.target.closest?.('.a19 button');
    if(!button)return;
    const d=button.dataset;
    if(d.atlasSection){section=d.atlasSection;if(section==='samples')sample=state.taskIndex;}
    else if(d.atlasSlice){slice=Number(d.atlasSlice);}
    else if(d.atlasRegion){region=d.atlasRegion;}
    else if(d.atlasLayer){layer=d.atlasLayer;}
    else if(d.atlasCurrent!==undefined){sample=state.taskIndex;section='samples';projection='front';refresh('section','samples');return;}
    else if(d.atlasResume!==undefined){setPage('game');return;}
    else if(d.atlasTasks!==undefined){setPage('game');state.taskOpen=true;render();return;}
    else if(d.atlasProjection){projection=d.atlasProjection;}
    else if(d.atlasLesson!==undefined){lesson=Number(d.atlasLesson);}
    else return;
    const key=Object.keys(d).find(k=>k.startsWith('atlas'));
    refresh(key.slice(5).toLowerCase(),d[key]);
  });
  document.addEventListener('change',e=>{
    if(e.target.matches('.a19 [data-atlas-select]')){sample=Number(e.target.value);projection='front';refresh('select');}
  });
  window.NeuroStory.civilHTML=civilHTML;
})();
