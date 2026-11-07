const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../review/archive-runtime.js'),'utf8');
function nativeStorage(){
  const values=new Map();
  return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
}
function boot(version,conf={}){
  const origin='https://neurotrace.invalid';
  const url=new URL(conf.path || '/history/'+version+'/'+(conf.compare?'?panel=1':''),origin);
  const events={}, notices=[], requests=[];
  class XHR{open(){throw Error('native XHR used');}}
  class Form{submit(){throw Error('native form submitted');}}
  class Media{play(){return this.muted===true;}}
  function elem(){return {style:{},append(){},setAttribute(){},remove(){}};}
  const c={URL,URLSearchParams,Request,Response,DOMException,location:url,
    localStorage:conf.store||nativeStorage(),sessionStorage:conf.session||nativeStorage(),
    navigator:{sendBeacon(){throw Error('native beacon used');}},XMLHttpRequest:XHR,HTMLFormElement:Form,HTMLMediaElement:Media,
    document:{baseURI:url.href,currentScript:{hasAttribute:()=>Boolean(conf.fixture)},
      addEventListener:(n,f)=>{events[n]=f;},getElementById:()=>null,createElement:elem,querySelector:()=>null,
      body:{append:n=>notices.push(n)}},
    fetch:async(u,o)=>{requests.push([String(u),o]);return Response.json(conf.fixture||{});},
    setTimeout:()=>1,clearTimeout:()=>{}};
  if(conf.blockStorage)Object.defineProperty(c,'localStorage',{configurable:true,get(){throw Error('denied');}});
  c.window=c;
  vm.runInNewContext(code,c);
  return {c,events,notices,requests};
}
test('saves are persistent within a version and isolated from live and other releases',()=>{
  const store=nativeStorage(),session=nativeStorage();store.setItem('common','live');session.setItem('session','live');
  const one=boot('1.8',{store,session}).c;
  one.localStorage.setItem('common','one');one.localStorage.withProperty='second';one.sessionStorage.setItem('session','one');
  const two=boot('2.2',{store,session}).c;
  assert.equal(two.localStorage.getItem('common'),null);assert.equal(two.sessionStorage.getItem('session'),null);
  two.localStorage.setItem('common','two');two.sessionStorage.setItem('session','two');
  assert.equal(boot('1.8',{store}).c.localStorage.getItem('common'),'one');
  assert.equal(one.localStorage.getItem('withProperty'),'second');assert.deepEqual(Object.keys(one.localStorage),['common','withProperty']);
  assert.equal(one.localStorage.length,2);assert.equal(one.localStorage.key(1),'withProperty');
  delete one.localStorage.withProperty;one.localStorage.clear();one.sessionStorage.clear();
  assert.equal(one.localStorage.length,0);assert.equal(store.getItem('common'),'live');assert.equal(session.getItem('session'),'live');
  assert.equal(two.localStorage.getItem('common'),'two');assert.equal(two.sessionStorage.getItem('session'),'two');
  const no=boot('2.2',{blockStorage:true}).c;no.localStorage.setItem('__proto__','yes');assert.equal(no.localStorage.getItem('__proto__'),'yes');
  const live=boot('2.2',{store,path:'/'}).c;assert.equal(live.localStorage,store);
});
test('only comparison panels enter uninitialized modern demo and mute playback',()=>{
  const store=nativeStorage();
  const live=boot('2.2',{store}).c;assert.equal(live.localStorage.getItem('nt-launch22'),null);
  assert.equal(new live.HTMLMediaElement().play(),false);
  const panel=boot('2.2',{store,compare:true}).c;assert.equal(panel.localStorage.getItem('nt-launch22'),'demo');
  assert.equal(new panel.HTMLMediaElement().play(),true);
  assert.equal(store.getItem('nt-launch22'),null);
  panel.localStorage.setItem('saved-edges','[]');
  assert.equal(boot('2.2',{store}).c.localStorage.getItem('nt-launch22'),null,'opening comparison must not skip the original standalone login');
  panel.localStorage.setItem('nt-launch22','choice');
  assert.equal(boot('2.2',{store,compare:true}).c.localStorage.getItem('nt-launch22'),'choice');
  assert.equal(boot('2.0',{store,compare:true}).c.localStorage.getItem('nt-launch22'),null);
});
test('guest reads and public rankings use a single lazy credential-free local capture',async()=>{
  const roster={accounts:[{name:'historical player',points:40}]},week={period:'week',players:[{name:'P',score:90}]};
  const {c,requests}=boot('2.2',{fixture:{roster,rankings:{week}}});
  assert.deepEqual(await (await c.fetch('/api/identity')).json(),{account:null,cleared:[]});
  assert.deepEqual(await (await c.fetch('/api/identity?view=providers')).json(),{available:{},linked:[]});
  assert.equal(requests.length,0);
  assert.deepEqual(await (await c.fetch('/api/identity?view=roster')).json(),roster);
  assert.deepEqual(await (await c.fetch('api/rankings?period=week')).json(),week);
  assert.deepEqual(await (await c.fetch('/api/rankings?period=month')).json(),{period:'month',players:[]});
  assert.equal(requests.length,1);assert.equal(requests[0][0],'https://neurotrace.invalid/history/2.2/public-data.json');
  assert.equal(requests[0][1].credentials,'omit');
  const no=boot('1.9');assert.deepEqual(await (await no.c.fetch('/api/identity?view=roster')).json(),{accounts:[],fieldReady:false});
  assert.equal(no.requests.length,0);
});
test('credential operations, writes, XHR, beacon and native forms never hit live services',async()=>{
  const {c,requests,events,notices}=boot('2.2');
  for(const request of [new Request('https://neurotrace.invalid/api/identity',{method:'POST',body:'sensitive'}),
      '/api/letters','/history/2.2/api/practice','https://other.example/api/identity','/api/identity?view=admin']){
    assert.equal((await c.fetch(request)).status,403);
  }
  assert.equal(requests.length,0);assert.ok(notices.length);
  assert.throws(()=>new c.XMLHttpRequest().open('POST','/api/identity'),/历史回看/);
  assert.equal(c.navigator.sendBeacon('/api/identity','sensitive'),false);
  let prevented=false,stopped=false;
  const event={preventDefault:()=>{prevented=true;},stopImmediatePropagation:()=>{stopped=true;},target:{hasAttribute:()=>false,querySelector:()=>({})}};
  events.submit(event);assert.ok(prevented && stopped);
  prevented=stopped=false;event.target.querySelector=()=>null;events.submit(event);
  assert.ok(prevented&&!stopped,'local note form listener may execute without a native submission');
  new c.HTMLFormElement().submit();
  await c.fetch('/history/2.2/data/a.json?token=secret',{headers:{Authorization:'secret'},credentials:'include'});
  assert.equal(requests[0][0],'https://neurotrace.invalid/history/2.2/data/a.json');
  assert.equal(requests[0][1].headers,undefined);assert.equal(requests[0][1].credentials,'omit');
});
