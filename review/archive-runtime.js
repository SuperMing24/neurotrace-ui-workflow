/* Load before the frozen page's scripts. Historical play has its own browser save. */
(()=>{
  'use strict';
  const match=/^\/history\/v?(\d+\.\d+(?:\.\d+)?)(?:\/|$)/.exec(location.pathname);
  if(!match)return;
  const version=match[1], base=new URL(match[0].replace(/\/?$/,'/'),location.origin);
  const compare=new URLSearchParams(location.search).get('panel')==='1';
  const [major,minor]=version.split('.').map(Number);
  const publicData=document.currentScript?.hasAttribute('data-public-data');
  const nativeFetch=window.fetch.bind(window);

  // Use one physical storage entry per version, leaving every live-game key untouched.
  function scopeStorage(name){
    const slot='neurotrace:archive:'+version;
    let native,raw=null,entries=new Map();
    let demoDefault=compare && name==='localStorage' && (major>2 || major===2 && minor>=2);
    try{native=window[name];}catch{}
    function read(){
      if(native)try{
        const next=native.getItem(slot);
        if(next!==raw){entries=new Map(next===null?[]:JSON.parse(next));raw=next;}
      }catch{native=null;}
      return entries;
    }
    function visible(){
      const stored=read();
      return demoDefault && !stored.has('nt-launch22') ? new Map([...stored,['nt-launch22','demo']]) : stored;
    }
    function write(){
      if(!native)return;
      try{
        if(!entries.size){native.removeItem(slot);raw=null;return;}
        raw=JSON.stringify([...entries]);native.setItem(slot,raw);
      }catch{native=null;}
    }
    const api=Object.assign(Object.create(null),{
      getItem(key){return visible().get(String(key))??null;},
      setItem(key,value){key=String(key);if(key==='nt-launch22')demoDefault=false;read().set(key,String(value));write();},
      removeItem(key){key=String(key);if(key==='nt-launch22')demoDefault=false;read().delete(key);write();},
      key(index){return [...visible().keys()][Number(index)]??null;},
      clear(){demoDefault=false;read().clear();write();}
    });
    Object.defineProperty(api,'length',{get:()=>visible().size,configurable:true});
    const facade=new Proxy(api,{
      get(obj,key){return key in obj || typeof key==='symbol'?obj[key]:api.getItem(key)??undefined;},
      set(_obj,key,value){api.setItem(key,value);return true;},
      deleteProperty(_obj,key){api.removeItem(key);return true;},
      ownKeys(){return [...visible().keys()];},
      getOwnPropertyDescriptor(_obj,key){
        if(visible().has(key))return {configurable:true,enumerable:true,writable:true,value:api.getItem(key)};
      }
    });
    Object.defineProperty(window,name,{configurable:true,value:facade});
  }
  scopeStorage('localStorage');
  scopeStorage('sessionStorage');

  if(compare && window.HTMLMediaElement){
    const play=window.HTMLMediaElement.prototype.play;
    window.HTMLMediaElement.prototype.play=function(...args){this.muted=true;return play.apply(this,args);};
  }

  let noticeTimer;
  function notice(){
    if(!document.body)return;
    const id='nt-archive-notice';
    document.getElementById(id)?.remove();
    const box=document.createElement('div');
    box.id=id;box.setAttribute('role','status');
    box.style.cssText='position:fixed;z-index:2147483647;bottom:16px;right:16px;max-width:min(340px,calc(100vw - 32px));background:#142b31;color:#f2e4c6;border:1px solid #9b8967;padding:12px 15px;border-radius:7px;box-shadow:0 2px 12px #0007;font:13px/1.6 system-ui;';
    box.append('历史回看仅保存本机试玩进度。');
    const original=document.querySelector('a[data-review-original]');
    if(original){
      const link=document.createElement('a');link.href=original.href;link.target='_blank';link.rel='noopener noreferrer';
      link.textContent='打开原始部署 ↗';link.style.cssText='display:block;color:#b8ded5;text-decoration:underline';
      box.append(link);
    }
    document.body.append(box);
    clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.remove(),6500);
  }

  let fixturePromise, displayTime;
  document.addEventListener('DOMContentLoaded',()=>{
    if(typeof window.rankDates22==='function'){
      const dates=window.rankDates22;
      window.rankDates22=(period,now)=>dates(period,now??displayTime);
    }
  },{once:true});
  function fixture(){
    if(!publicData)return Promise.resolve({});
    if(!fixturePromise)fixturePromise=nativeFetch(new URL('public-data.json',base),{credentials:'omit',redirect:'error'})
      .then(r=>r.ok?r.json():{}).then(data=>{
        const at=Date.parse(data.capturedAt);if(Number.isFinite(at))displayTime=at;
        return data;
      }).catch(()=>({}));
    return fixturePromise;
  }
  const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
  const blocked=()=>json({error:'archive_read_only'},403);
  window.fetch=async(input,options={})=>{
    const req=typeof Request!=='undefined' && input instanceof Request ? input : null;
    const url=new URL(req?req.url:input,document.baseURI);
    const method=String(options.method||req?.method||'GET').toUpperCase();
    if(method!=='GET' && method!=='HEAD'){notice();return blocked();}
    if(url.origin!==base.origin)return blocked();
    const path=url.pathname.startsWith(base.pathname)?'/'+url.pathname.slice(base.pathname.length):url.pathname;
    if(path==='/api/identity'){
      const view=url.searchParams.get('view')||'session';
      if(view==='session')return json({account:null,cleared:[]});
      if(view==='providers')return json({available:{},linked:[]});
      if(view==='roster'){
        const roster=(await fixture()).roster;
        return json(Array.isArray(roster?.accounts)?roster:{accounts:[],fieldReady:false});
      }
      return blocked();
    }
    if(path==='/api/rankings'){
      const period=url.searchParams.get('period')||'all';
      if(!['all','week','month'].includes(period))return json({error:'invalid_period'},400);
      const item=(await fixture()).rankings?.[period];
      return json(item?.period===period && Array.isArray(item.players)?item:{period,players:[]});
    }
    if(path.startsWith('/api/'))return blocked();
    if(!url.pathname.startsWith(base.pathname) && !url.pathname.startsWith('/review/'))return blocked();
    // Static source data only. Never forward query parameters, cookies or request headers.
    url.search='';url.hash='';
    return nativeFetch(url,{method,credentials:'omit',redirect:'error'});
  };

  // These legacy pages have no XHR or beacon dependencies. Keep writes local even
  // if the browser submits a form or the user enters the archived account flow.
  if(window.XMLHttpRequest)window.XMLHttpRequest.prototype.open=function(){
    throw new DOMException('历史回看仅支持本机操作','SecurityError');
  };
  if(navigator.sendBeacon)Object.defineProperty(navigator,'sendBeacon',{configurable:true,value:()=>false});
  if(window.HTMLFormElement)window.HTMLFormElement.prototype.submit=notice;
  document.addEventListener('submit',e=>{
    e.preventDefault();
    const f=e.target;
    if(f.hasAttribute('action')||f.querySelector('input[type="password"]')){
      e.stopImmediatePropagation();notice();
    }
  },true);
  document.addEventListener('focusin',e=>{
    if(e.target.matches?.('input[type="password"]')){
      e.target.readOnly=true;notice();
    }
  },true);
  window.__ntArchiveGuardReady=version;
})();
