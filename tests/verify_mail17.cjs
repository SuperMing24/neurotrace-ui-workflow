const assert = require('node:assert/strict');
const vm=require('node:vm'), fs=require('node:fs'), path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../mail17.js'),'utf8'), backing={};
function boot() {
 const handlers={}, html=[];
 const env=vm.createContext({
  window:{},state:{loggedIn:true,page:'mail'},
  localStorage:{getItem:k=>backing[k]||null,setItem:(k,v)=>backing[k]=v},
  icon:n=>'<i>'+n+'</i>',head:t=>'<header>'+t+'</header>',contentShell:s=>s,
  document:{addEventListener:(name,fn)=>{(handlers[name]||=[]).push(fn)},querySelector:()=>null},
  render:()=>html.push(env.window.NeuroMail.page())
 });
 vm.runInContext(src,env);
 const route=(data={},atts={})=>{const b={dataset:data,hasAttribute:k=>k in atts}; handlers.click[1]({target:{closest:()=>b}})};
 const submit=(peer,message)=>{
  const field=value=>({value,setCustomValidity(s){this.error=s},reportValidity(){},addEventListener(){}});
  const elements={peer:field(peer),message:field(message)};
  handlers.submit[0]({target:{id:'nm-editor',elements},preventDefault(){}});
  return elements;
 };
 return {mail:env.window.NeuroMail,html,env,route,submit};
}
const t=boot();const snapshot=()=>JSON.parse(backing[Object.keys(backing)[0]]);
assert.match(t.mail.entry(),/1 条未读/);
assert.match(t.mail.page(),/第一份观测邀请/);
t.route({nmOpen:'welcome'});
assert.match(t.html.at(-1),/data-page="archive"/);
assert.doesNotMatch(t.mail.entry(),/条未读/);
const note={id:'story-1',title:'第一章校验完成',body:'领取研究碎片',action:'archive'};
t.mail.notify(note);t.mail.notify(note);
assert.equal(snapshot().notices.filter(n=>n.id==='story-1').length,1);
t.route({nmTab:'private'});
assert.match(t.html.at(-1),/暂无私信/);assert.doesNotMatch(t.html.at(-1),/老友来信|四七|小王/);
t.route({},{'data-nm-compose':''});t.submit('同伴','首份草稿');
t.route({nmOpen:'同伴'});assert.match(t.html.at(-1),/保存回复/);
t.submit('', '对比俯视角');assert.match(t.html.at(-1),/对比俯视角/);
t.route({},{'data-nm-compose':''});t.submit('测试昵称','<img onerror=fail />');
assert.ok(t.html.at(-1).includes('&lt;img onerror=fail /&gt;'));
assert.ok(!t.html.at(-1).includes('<img onerror'));
t.route({},{'data-nm-compose':''});const bad=t.submit('试玩观测员','abc');assert.match(bad.peer.error,/玩家/);
const other=boot();assert.match(other.mail.page(),/第一章校验完成/);
other.route({nmTab:'private'});other.route({nmOpen:'测试昵称'});assert.match(other.html.at(-1),/onerror=fail/);
other.env.state.loggedIn=false;other.mail.notify({id:'no',title:'No',body:'no'});assert.ok(!snapshot().notices.some(x=>x.id==='no'));
other.mail.reset();assert.equal(snapshot().letters.length,0);assert.ok(!snapshot().notices.some(n=>n.id==='story-1'));
console.log('PASS reset, seed & counts, reads, jump target, dedupe, replies, new DM, escaped input, self-recipient validation, reload, logged-out guard');
