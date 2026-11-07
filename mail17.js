/* Local outbox drafts and authenticated, server-delivered private messages. */
window.NeuroMail = (() => {
  let storageKey = 'neurotrace-mail-v17:demo-siqi', player='试玩观测员';
  let received=[];
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
      notices:[{id:'welcome',title:'第一份观测邀请',body:'观测站的第一份教学样本已就绪。打开回声档案，读完记录后进入三维现场。',action:'archive',read:false,time}],
      letters:[]
    };
  }
  function data() {
    if (cache) return cache;
    try {
      const value = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(value?.notices) && Array.isArray(value?.letters)){
        const welcome=seed().notices[0];
        cache={notices:value.notices.map(n=>n.id==='welcome'?{...n,body:welcome.body}:n.id?.startsWith('story-')?{...n,body:'本份观察记录已归档，可在回声档案中重温样本。'}:n),
          letters:value.letters.filter(l=>l.outgoing===true)};
        if(value.fieldLetters||value.letters.length!==cache.letters.length)save();
      }
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
    return [notices.filter(n => !n.read).length, received.filter(l => !l.read).length];
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
      if(localOnly){received=[];return;}
      received=(snapshot.letters||[]).map(l=>({...l,time:Date.parse(l.time)}));
      state.story17.sideRecords=snapshot.reports||{};
      fieldError='';
      if(state.page==='mail'||state.page==='game'&&!payload)render();
    }catch(e){
      if(owner===cloudId && revision===fieldRevision){fieldError='暂未同步，可重新收信。';if(state.page==='mail')render();}
      if(payload)throw e;
    }
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
    const [sys, priv] = counts();
    const navTab = (key,label,count) => '<button class="'+(tab===key?'nm-active':'')+'" aria-pressed="'+(tab===key)+'" data-nm-tab="'+key+'">'+label+(count?' <sup>'+count+'</sup>':'')+'</button>';
    let rows = '';
    if (tab==='system') {
      rows=data().notices.map(n=>row(n.id,n.title,n.body,n.time,!n.read,false)).join('');
    } else {
      const peers = new Map();
      for (const letter of [...received,...data().letters].sort((a,b)=>a.time-b.time)) {
        const prev=peers.get(letter.peer);
        peers.set(letter.peer, {last:letter, unread:(!letter.outgoing && !letter.read) || !!prev?.unread});
      }
      rows = Array.from(peers.values()).reverse().sort((a,b)=>b.last.time-a.last.time).map(({last,unread})=>
        row(last.peer,last.peer,(last.outgoing?'我：':'')+(last.title||last.text),last.time,unread,true)).join('') || '<p class="nm-empty">暂无私信。</p>';
    }
    return '<header class="nm-banner"><span class="nm-kicker">ECHO POST &nbsp;/&nbsp; 047</span>'+
      '<div class="nm-title">'+safe(player)+'的信箱</div><p>观测站的来信与队友留言</p><span class="nm-stamp" aria-hidden="true">'+icon('mail')+'</span></header>'+
      '<div class="nm-tabs">'+navTab('system','系统通知',sys)+navTab('private','私信',priv)+'</div>'+
      '<div class="nm-list-head"><span>'+(tab==='system'?'训练回执':'我的会话')+'</span>'+
      (tab==='private'?'<button data-nm-compose>写私信 ＋</button>':'<small>按收信时间</small>')+'</div>'+
      '<div class="nm-rows">'+rows+'</div>'+ (tab==='private'?'<p class="nm-local">手写留言保存为本机草稿。</p>':'');
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
        Array.from(new Set([...received.map(l=>l.peer),...data().letters.map(l=>l.peer)])).map(p=>'<option value="'+safe(p)+'"></option>').join('')+'</datalist>')+'</label>'+
      '<label>内容<textarea name="message" rows="4" maxlength="500" required placeholder="写下你的观察或问候…"></textarea></label>'+
      '<div class="nm-editor-foot"><small>仅在此浏览器保存</small><button class="nm-primary" type="submit">保存'+(recipient?'回复':'私信')+' <span>↗</span></button></div></form>';
  }
  function conversation() {
    const letters=[...received,...data().letters].filter(l=>l.peer===selected).sort((a,b)=>a.time-b.time);
    return '<div class="nm-thread-title"><span class="nm-kicker">私信会话</span><h2>'+safe(selected)+'</h2></div><div class="nm-thread">'+letters.map(l=>
      '<article class="nm-bubble '+(l.outgoing?'nm-out':'')+'"><small>'+safe(l.outgoing?player+' · 本机草稿':l.peer+' · 自动私信')+'</small>'+(l.title?'<h3>'+safe(l.title)+'</h3>':'')+l.text.split('\n\n').map(t=>'<p>'+safe(t)+'</p>').join('')+'<time>'+safe(when(l.time))+'</time></article>').join('')+'</div>'+editor(selected);
  }
  async function markThreadRead(peer){
    const owner=cloudId;
    for(const item of received.filter(l=>l.peer===peer&&!l.read)){
      if(owner!==cloudId||state.page!=='mail'||view!=='thread'||selected!==peer)return;
      try{await refreshField({action:'read',id:item.id});}catch{return;}
    }
    if(owner===cloudId&&state.page==='mail')render();
  }
  function page() {
    const top = view==='list'?head('信箱'):'<div class="subpage-head"><button class="subpage-back" data-nm-list aria-label="返回信箱">'+icon('back')+'</button><span>'+({detail:'系统通知',thread:'私信会话',compose:'写私信'})[view]+'</span></div>';
    const content = view==='list'?list():view==='detail'?detail():view==='thread'?conversation():editor('');
    return contentShell(top+'<div class="nm-page">'+content+
      (fieldError&&cloudId?'<button class="nt-letter-retry" data-field-refresh>重新同步信箱</button>':'')+
      (flash?'<p class="nm-feedback" role="status">'+safe(flash)+'</p>':'')+
      (persistenceUnavailable?'<p class="nm-local" role="status">浏览器存储暂不可用，本次记录仅在当前页面保留。</p>':'')+'</div>','mail');
  }
  document.addEventListener('click',event=>{
    if (event.target.closest('[data-page="mail"]')) {view='list';tab=received.some(l=>!l.read)?'private':'system';flash='';if(cloudId)refreshField();}
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
      if (tab==='system') {const n=data().notices.find(n=>n.id===selected);if(!n)return;n.read=true;view='detail';}
      else {view='thread';markThreadRead(selected);}
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
    cloudId=account?.id||null;received=[];fieldRevision++;fieldError='';localOnly=false;
    storageKey='neurotrace-mail-v17:'+(account?'account:'+account.id:'demo-siqi');
    player=account?.name||'试玩观测员';
    cache=null;view='list';tab='system';selected='';flash='';
  }
  return {entry,page,notify,reset,switchPlayer,refreshField,localFieldOnly:()=>localOnly};
})();
