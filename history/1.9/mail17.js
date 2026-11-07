/* Local postbox for the single supported V1.6 demo identity. */
window.NeuroMail = (() => {
  let storageKey = 'neurotrace-mail-v17:demo-siqi', player='四七';
  let contacts = ['小王'];
  let cloudId=null, fieldRevision=0, fieldError='', localOnly=false;
  let cache;
  let tab = 'system', view = 'list', selected = '', flash = '';
  let persistenceUnavailable = false;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[ch]);
  function seed() {
    const time = Date.now();
    return {
      notices: [{id:'welcome', title:'第一份观测邀请', body:player+'，欢迎来到观测站。第一份教学样本已经就绪。打开回声档案，跟随记录员进入三维样本。每次训练有一张回执。两位老友会在整章或整项委托结束后，给对方留一封信。', action:'archive', read:false, time}],
      letters: []
    };
  }
  function data() {
    if (cache) return cache;
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(value?.notices) && Array.isArray(value?.letters)) cache = value;
    } catch {}
    if (!cache) {cache = seed(); save();}
    return cache;
  }
  function save() {
    try {localStorage.setItem(storageKey, JSON.stringify(cache)); persistenceUnavailable = false;}
    catch {persistenceUnavailable = true;}
  }
  function counts() {
    const {notices, letters} = data();
    return [notices.filter(n => !n.read).length, letters.filter(l => !l.outgoing && !l.read).length, fieldNotes().filter(x=>!x.read).length];
  }
  function entry() {
    const total = counts().reduce((a,b) => a+b,0);
    return '<button class="global-tool nm-entry" data-page="mail" title="信箱" aria-label="信箱' +
      (total?'，'+total+' 条未读':'') + '">' + icon('mail') +
      (total?'<i class="nm-badge" aria-hidden="true"></i>':'') + '</button>';
  }
  function notify({id, title, body, action}) {
    if (!state.loggedIn || !id || !title || !body) return;
    const {notices} = data();
    if (notices.some(n => n.id === id)) return;
    notices.unshift({id:String(id), title:String(title), body:String(body), action:action==='archive'?'archive':'', read:false, time:Date.now()});
    save();
    const button = document.querySelector('.nm-entry');
    if (button) {
      button.setAttribute('aria-label', '信箱，' + counts().reduce((a,b)=>a+b,0) + ' 条未读');
      if (!button.querySelector('.nm-badge')) button.insertAdjacentHTML('beforeend','<i class="nm-badge" aria-hidden="true"></i>');
    }
    if (state.page==='mail' && tab==='system' && view==='list') render();
  }
  // Keep the chapter milestones in the archive without embedding private correspondence.
  const milestones={
    exterior01:{title:'外景 01 · 章节回执'},
    fieldpair:{title:'双样本委托 · 章节回执'}
  };
  function fieldNotes(){return data().fieldLetters||[];}
  function guestMilestone(id){
    if((cloudId && !localOnly) || (cloudId && !['四七','小王'].includes(player)) || !milestones[id] || fieldNotes().some(x=>x.id===id))return;
    data().fieldLetters=[...fieldNotes(),{id,time:Date.now(),read:false}];save();
  }
  async function refreshField(payload){
    const owner=cloudId;
    if(!owner)return;
    const revision=++fieldRevision;
    try{
      const response=await fetch('/api/letters',{credentials:'same-origin',cache:'no-store',...(payload?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}:{})});
      if(!response.ok)throw new Error('field service');
      const snapshot=await response.json();
      if(owner!==cloudId || snapshot.accountId!==owner || revision!==fieldRevision)return;
      localOnly=Boolean(snapshot.localOnly);
      if(localOnly){
        if(window.NeuroStory?.completionCount()===3)guestMilestone('exterior01');
        if(window.NeuroStory?.taskCount()===2)guestMilestone('fieldpair');
        if(state.page==='mail')render();
        return;
      }
      data().fieldLetters=(snapshot.letters||[]).filter(x=>Object.hasOwn(milestones,x.id)).map(x=>({...x,time:Date.parse(x.time)}));
      state.story17.sideRecords=snapshot.reports||{};
      fieldError='';save();
      if(state.page==='mail'||state.page==='game'&&!payload)render();
    }catch(e){
      if(owner===cloudId && revision===fieldRevision){fieldError='暂未同步，可重新收信。';if(state.page==='mail')render();}
      if(payload)throw e;
    }
  }
  function chapterDetail(){
    const rec=fieldNotes().find(x=>x.id===selected);
    if(!rec)return list();
    const m=milestones[rec.id];
    if(!m)return list();
    return '<article class="nm-paper nt-peer-paper"><span class="nm-kicker">章节来信 · 剧情通信</span><h2>'+m.title+'</h2><time>'+safe(when(rec.time))+'</time><p>私人信件仅供收件人查看。</p></article>';
  }
  function when(time) {
    const d = new Date(time);
    return d.getMonth()+1+'月'+d.getDate()+'日 '+[d.getHours(),d.getMinutes()].map(n=>String(n).padStart(2,'0')).join(':');
  }
  function row(key, title, body, time, unread, isDM) {
    return '<button class="nm-row" data-nm-open="'+safe(key)+'"><span class="nm-seal '+(isDM?'nm-peer':'')+'" aria-hidden="true">'+
      (isDM?safe(title.slice(-1)):icon('mail'))+'</span><span class="nm-row-copy"><span class="nm-line"><strong>'+safe(title)+'</strong>'+
      (unread?'<i class="nm-unread" aria-label="未读"></i>':'')+'</span><small>'+safe(body)+'</small><time>'+safe(when(time))+'</time></span><span class="nm-arrow" aria-hidden="true">›</span></button>';
  }
  function list() {
    const [sys, priv, chapters] = counts();
    const navTab = (key,label,count) => '<button class="'+(tab===key?'nm-active':'')+'" aria-pressed="'+(tab===key)+'" data-nm-tab="'+key+'">'+label+(count?' <sup>'+count+'</sup>':'')+'</button>';
    let rows = '';
    if(tab==='chapters'){
      rows=fieldNotes().slice().sort((a,b)=>b.time-a.time).map(x=>row(x.id,milestones[x.id].title,'章节来信',x.time,!x.read,false)).join('') || '<p class="nm-empty">完成外景 01 的三份记录，或交齐双样本委托的两份报告，就会收到搭档的来信。</p>';
      if(cloudId && !['四七','小王'].includes(player))rows='<p class="nm-empty">本卷收录四七与小王的往来。你的训练回执在「系统通知」中。</p>';
      if(localOnly)rows+='<p class="nm-local">此账号当前在本机保存章节信的已读状态。</p>';
      if(cloudId)rows+='<button class="nt-letter-retry" data-field-refresh>重新收信</button>';
      if(fieldError)rows+='<p role="status">'+fieldError+'</p>';
    }else if (tab==='system') {
      rows=data().notices.map(n=>row(n.id,n.title,n.body,n.time,!n.read,false)).join('');
    } else {
      const peers = new Map();
      for (const letter of data().letters) {
        const prev=peers.get(letter.peer);
        peers.set(letter.peer, {last:letter, unread:(!letter.outgoing && !letter.read) || !!prev?.unread});
      }
      rows = Array.from(peers.values()).reverse().sort((a,b)=>b.last.time-a.last.time).map(({last,unread})=>
        row(last.peer,last.peer,(last.outgoing?'我：':'')+last.text,last.time,unread,true)).join('');
    }
    return '<header class="nm-banner"><span class="nm-kicker">ECHO POST &nbsp;/&nbsp; 047</span>'+
      '<div class="nm-title">'+safe(player)+'的信箱</div><p>观测站的来信与队友留言</p><span class="nm-stamp" aria-hidden="true">'+icon('mail')+'</span></header>'+
      '<div class="nm-tabs">'+navTab('chapters','老友来信',chapters)+navTab('system','系统通知',sys)+navTab('private','本机私信',priv)+'</div>'+
      '<div class="nm-list-head"><span>'+(tab==='system'?'训练回执':tab==='chapters'?'四七与小王 · 章节通信':'我的会话')+'</span>'+
      (tab==='private'?'<button data-nm-compose>写私信 ＋</button>':'<small>按收信时间</small>')+'</div>'+
      '<div class="nm-rows">'+rows+'</div>'+ (tab==='private'?'<p class="nm-local">本机会话演示。来信为示例，写下的私信仅保存在当前浏览器。</p>':'');
  }
  function detail() {
    const letter=data().notices.find(n=>n.id===selected);
    if (!letter) return list();
    return '<article class="nm-paper"><span class="nm-kicker">来自档案局</span><h2>'+safe(letter.title)+'</h2><time>'+safe(when(letter.time))+'</time><p>'+safe(letter.body)+'</p><div class="nm-letter-foot">观测站 · 档案局</div>'+
      (letter.action==='archive'?'<button class="nm-primary" data-page="archive">打开回声档案 <span>→</span></button>':'')+'</article>';
  }
  function editor(recipient) {
    return '<form class="nm-editor" id="nm-editor"><label>收件人'+
      (recipient?'<b>'+safe(recipient)+'</b>':'<input name="peer" placeholder="输入玩家昵称" maxlength="18" required list="nm-recipients" autocomplete="off"/><datalist id="nm-recipients">'+
        Array.from(new Set([...contacts,...data().letters.map(l=>l.peer)])).map(p=>'<option value="'+safe(p)+'"></option>').join('')+'</datalist>')+'</label>'+
      '<label>内容<textarea name="message" rows="4" maxlength="500" required placeholder="写下你的观察或问候…"></textarea></label>'+
      '<div class="nm-editor-foot"><small>仅在此浏览器保存</small><button class="nm-primary" type="submit">保存'+(recipient?'回复':'私信')+' <span>↗</span></button></div></form>';
  }
  function conversation() {
    const letters=data().letters.filter(l=>l.peer===selected);
    return '<div class="nm-thread-title"><span class="nm-kicker">本机私信</span><h2>'+safe(selected)+'</h2></div>'+
      '<div class="nm-thread">'+letters.map(l=>'<article class="nm-bubble '+(l.outgoing?'nm-out':'')+'"><small>'+safe(l.outgoing?player+' · 我':l.peer+' · 演示来信')+'</small><p>'+safe(l.text)+'</p><time>'+safe(when(l.time))+'</time></article>').join('')+'</div>'+editor(selected);
  }
  function page() {
    const top = view==='list'?head('信箱'):'<div class="subpage-head"><button class="subpage-back" data-nm-list aria-label="返回信箱">'+icon('back')+'</button><span>'+({detail:'系统通知',thread:'私信会话',compose:'写私信',chapter:'老友来信'})[view]+'</span></div>';
    const content = view==='list'?list():view==='detail'?detail():view==='chapter'?chapterDetail():view==='thread'?conversation():editor('');
    return contentShell(top+'<div class="nm-page">'+content+
      (flash?'<p class="nm-feedback" role="status">'+safe(flash)+'</p>':'')+
      (persistenceUnavailable?'<p class="nm-local" role="status">浏览器存储暂不可用，本次记录仅在当前页面保留。</p>':'')+'</div>','mail');
  }
  document.addEventListener('click',event=>{
    if (event.target.closest('[data-page="mail"]')) {view='list';tab=fieldNotes().length?'chapters':'system';flash='';if(cloudId)refreshField();}
  }, true);
  document.addEventListener('click',event=>{
    if (!state.loggedIn || state.page!=='mail') return;
    if(event.target.closest('[data-field-refresh]')?.hasAttribute?.('data-field-refresh')){refreshField();return;}
    const btn=event.target.closest('[data-nm-tab],[data-nm-open],[data-nm-compose],[data-nm-list]');
    if (!btn) return;
    flash='';
    if (btn.hasAttribute('data-nm-list')) view='list';
    else if (btn.hasAttribute('data-nm-compose')) {view='compose';selected='';}
    else if (btn.dataset.nmTab) {tab=btn.dataset.nmTab;view='list';}
    else {
      selected=btn.dataset.nmOpen;
      if(tab==='chapters'){
        const note=fieldNotes().find(x=>x.id===selected);if(!note)return;
        view='chapter';if(cloudId&&!localOnly){refreshField({action:'read',id:selected}).then(()=>{if(state.page==='mail')render();}).catch(()=>{});}else note.read=true;
      }else if (tab==='system') {const n=data().notices.find(n=>n.id===selected);if(!n)return;n.read=true;view='detail';}
      else {data().letters.filter(l=>l.peer===selected).forEach(l=>{l.read=true;});view='thread';}
      save();
    }
    render();
    if (view==='compose') document.querySelector('#nm-editor [name="peer"]')?.focus();
  });
  document.addEventListener('submit', event=>{
    if (event.target.id!=='nm-editor') return;
    event.preventDefault();
    if (!state.loggedIn || state.page!=='mail') return;
    const form=event.target;
    const peer=(view==='thread'?selected:form.elements.peer.value).trim().slice(0,18);
    const message=form.elements.message.value.trim().slice(0,500);
    if (!peer || peer===player || !message) {
      const badField=!peer||peer===player?form.elements.peer:form.elements.message;
      badField.setCustomValidity(badField===form.elements.peer?'请输入其他玩家的昵称':'请填写私信内容');
      badField.reportValidity();badField.addEventListener('input',()=>badField.setCustomValidity(''),{once:true});return;
    }
    data().letters.filter(l=>l.peer===peer).forEach(l=>{l.read=true;});
    data().letters.push({peer,text:message,time:Date.now(),read:true,outgoing:true});
    save();selected=peer;view='thread';flash='已保存在本机会话中。';render();
    document.querySelector('.nm-feedback')?.scrollIntoView({block:'nearest'});
  });
  function reset() {
    cache=seed();tab='system';view='list';selected='';flash='';save();
  }
  function switchPlayer(account){
    cloudId=account?.id||null;fieldRevision++;fieldError='';localOnly=false;
    storageKey='neurotrace-mail-v17:'+(account?'account:'+account.id:'demo-siqi');
    player=account?.name||'四七';contacts=[player==='小王'?'四七':'小王'];
    cache=null;view='list';tab='system';selected='';flash='';
  }
  async function openMilestone(id){
    tab='chapters';selected=id;view='list';
    setPage('mail');
    const initialOwner=cloudId;
    if(cloudId)await refreshField();
    if(state.page!=='mail'||cloudId!==initialOwner)return;
    const letter=fieldNotes().find(x=>x.id===id);
    if(letter){
      view='chapter';
      if(cloudId&&!localOnly)refreshField({action:'read',id}).catch(()=>{});
      else {letter.read=true;save();}
      render();
    }
  }
  return {entry,page,notify,reset,switchPlayer,guestMilestone,refreshField,openMilestone,localFieldOnly:()=>localOnly};
})();
