/* The game sandbox and the cloud developer session have independent lifetimes. */
window.NeuroIdentity = (() => {
  const roles={player:'玩家',reviewer:'复核员',developer_admin:'开发者管理员'};
  let directory={status:'loading',accounts:[]}, me=null, service='loading';
  let cleared=[], generation=0, ledgerBusy=false, initialSync=false, rosterVersion=0;
  let mode='', pendingKey='', staff=[], busy=false, message='';
  const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function request(view,body) {
    const response=await fetch('/api/identity'+(view?'?view='+view:''),{
      method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',
      ...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})
    });
    if (!response.ok) {
      const data=await response.json().catch(()=>({}));
      const messages={sign_in_required:'云端会话已结束，请重新登录。',credentials_rejected:'凭据未获接受，请检查密钥或激活码。',forbidden:'此云端账户没有管理权限。',chapter_locked:'请先通过上一章训练。',wrong_answer:'本次连线与训练答案不一致。',insufficient_points:'云端积分不足。',request_conflict:'该兑换请求已用于另一件商品。',invalid_order:'兑换信息有误。'};
      throw Object.assign(new Error(messages[data.error]||'账户服务暂时不可用，请重试。'),{status:response.status,code:data.error});
    }
    return response.json();
  }
  function renderAccount() {
    if(document.getElementById('nt-id-panel')) {
      document.getElementById('nt-id-panel').outerHTML=settings(); bind();
    }
  }
  function refreshPage() {
    if(typeof state!=='undefined' && ['rank','profile'].includes(state.page) && typeof render==='function')render();
    else renderAccount();
  }
  function acceptSession(snapshot) {
    const changed=!initialSync || me?.id!==snapshot.account?.id;
    me=snapshot.account||null;
    cleared=Array.isArray(snapshot.cleared)?snapshot.cleared.slice():[];
    if(changed){
      initialSync=true;
      generation++;
      staff=[];pendingKey='';mode='';
      window.syncNeuroAccount?.(me,cleared.slice());
    }
  }
  async function refreshRoster(){
    const seq=++rosterVersion;
    try{const r=await request('roster');if(seq===rosterVersion)directory={status:'ready',accounts:r.accounts};}
    catch{if(seq===rosterVersion)directory={status:'error',accounts:[]};}
  }
  async function init() {
    const epoch=generation;
    await Promise.all([refreshRoster(),request('session').then(snapshot=>{
      if(epoch===generation){service='ready';acceptSession(snapshot);}
    }).catch(()=>{if(epoch===generation)service='error';})]);
    refreshPage();
  }
  async function logout(){
    const snapshot=await request('',{action:'logout'});
    acceptSession(snapshot);return snapshot;
  }
  async function transact(payload){
    const epoch=generation;
    if(!me)throw Object.assign(new Error('请先登录云端账号。'),{status:401});
    if(ledgerBusy)throw new Error('上一笔变更正在确认，请稍后再试。');
    ledgerBusy=true;
    try {
      const result=await request('',payload);
      if(epoch!==generation||me?.id!==result.account?.id)throw new Error('云端账户已切换，请重新查看状态。');
      me=result.account;cleared=Array.isArray(result.cleared)?result.cleared.slice():cleared;
      await refreshRoster();
      if(epoch!==generation||me?.id!==result.account?.id)throw new Error('云端账户已切换，请重新查看状态。');
      if(typeof state!=='undefined' && state.page==='rank')refreshPage();
      return result;
    }catch(e){
      if(e.status===401 && epoch===generation)acceptSession({account:null});
      throw e;
    }finally{ledgerBusy=false;}
  }
  function button(label,action,alt=false){return '<button type="button" data-identity="'+action+'" class="'+(alt?'nt-id-sub':'nt-id-cta')+'">'+label+'</button>';}
  function settings() {
    let content='';
    if(me){
      content='<strong class="nt-id-name">'+safe(me.name)+' <small>'+safe(roles[me.role]||me.role)+'</small></strong><p>云端身份已验证。训练首通和模拟兑换使用这个账号的云端积分。</p><div class="nt-id-actions">'+
        (me.role==='developer_admin'?button(mode==='staff'?'收起控制台':'打开管理控制台',mode==='staff'?'close':'staff'):'')+button('退出云端会话','logout',true)+'</div>';
      if(mode==='staff')content+='<div class="nt-id-staff"><b>账户会话管理</b>'+staff.map(a=>'<div><span>'+safe(a.name)+' · '+safe(roles[a.role]||a.role)+'<small>'+(a.activated?'已激活':'待本人激活')+' · '+Number(a.active_sessions)+' 个在线会话</small></span>'+
        (a.active_sessions?'<button type="button" class="nt-id-sub" data-revoke="'+safe(a.id)+'">退出该账号全部设备</button>':'')+'</div>').join('')+'</div>';
    } else if(mode==='activate') {
      content='<form id="nt-id-form" autocomplete="off"><p>向项目负责人领取 30 分钟有效的专属激活码。保存下方新密钥后，使用激活码开通云端账户。</p><label>本机生成的登录密钥<input name="personal" type="password" readonly value="'+pendingKey+'"></label><div class="nt-id-actions">'+button('查看 / 隐藏','reveal',true)+button('复制登录密钥','copy',true)+'</div><label>激活码<input name="code" type="password" minlength="64" maxlength="64" pattern="[a-f0-9]{64}" required autocomplete="off"></label><label class="nt-id-check"><input type="checkbox" required>我已将登录密钥保存在密码管理器中</label><div class="nt-id-actions"><button class="nt-id-cta" type="submit">激活并登录</button>'+button('取消','close',true)+'</div></form>';
    } else if(mode==='login') {
      content='<form id="nt-id-form"><label>开发者登录密钥<input name="key" type="password" autocomplete="current-password" minlength="64" maxlength="64" pattern="[a-f0-9]{64}" required></label><div class="nt-id-actions"><button class="nt-id-cta" type="submit">验证并登录</button>'+button('取消','close',true)+'</div></form>';
    } else {
      content='<p>试玩身份用于本机游戏。两位开发者使用各自的登录密钥进入云端控制台。</p><div class="nt-id-actions">'+button('开发者登录','login')+button('首次激活','activate',true)+'</div>';
    }
    return '<section class="settings-group nt-id-panel" id="nt-id-panel"><div class="group-label">开发者账号</div>'+content+(service==='error'?'<p>会话查询暂不可用。</p>'+button('重新连接','retry',true):'')+'<p class="nt-id-status" role="status">'+safe(message)+'</p></section>';
  }
  async function change(action,id) {
    if(busy)return;
    const panel=document.getElementById('nt-id-panel');
    if(!panel)return;
    message='';
    if(action==='reveal'){const input=panel.querySelector('[name="personal"]');input.type=input.type==='text'?'password':'text';return;}
    if(action==='copy'){
      try{await navigator.clipboard.writeText(pendingKey);panel.querySelector('.nt-id-status').textContent='已复制登录密钥。';}
      catch{panel.querySelector('[name="personal"]').type='text';panel.querySelector('[name="personal"]').select();panel.querySelector('.nt-id-status').textContent='请复制已选中的密钥。';}
      return;
    }
    if(action==='retry'){await init();return;}
    if(['activate','login','close'].includes(action)){
      mode=action==='close'?'':action;
      pendingKey=mode==='activate'?Array.from(crypto.getRandomValues(new Uint8Array(32)),v=>v.toString(16).padStart(2,'0')).join(''):'';
      renderAccount();return;
    }
    if(action==='revoke' && !confirm('确定退出该开发者的全部后台会话？此账号可再次使用登录密钥登录。'))return;
    busy=true;
    try {
      if(action==='staff'){staff=(await request('admin')).accounts;mode='staff';}
      else if(action==='logout'){await logout();message='云端会话已退出。';}
      else if(action==='revoke'){await request('',{action:'revoke',id});acceptSession(await request('session'));staff=me?(await request('admin')).accounts:[];mode=me?'staff':'';message='已退出该账号的云端会话。';}
      else if(action==='submit'){
        const f=panel.querySelector('form');
        const data=mode==='activate'?{action:'activate',key:pendingKey,code:f.elements.code.value}:{action:'login',key:f.elements.key.value};
        acceptSession(await request('',data));mode='';pendingKey='';message='云端身份已验证。';
      }
      service='ready';
    } catch(e){if(e.status===401 && e.code==='sign_in_required')acceptSession({account:null});message=e.message;}
    finally{busy=false;renderAccount();}
  }
  function bind(){
    const p=document.getElementById('nt-id-panel');
    if(!p || p.dataset.bound)return;p.dataset.bound='1';
    p.addEventListener('click',e=>{const b=e.target.closest('[data-identity],[data-revoke]');if(b)change(b.dataset.identity||'revoke',b.dataset.revoke);});
    p.addEventListener('submit',e=>{e.preventDefault();change('submit');});
  }
  return {init,settings,bind,logout,session:()=>me,cleared:()=>cleared.slice(),roster:()=>directory,
    grade:(chapter,edges)=>transact({action:'grade',chapter,edges}),
    redeem:(item,requestId)=>transact({action:'redeem',item,requestId})};
})();
