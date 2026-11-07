/* This panel belongs to the review workspace and is also used by the frozen releases. */
(async()=>{
 if(document.getElementById('nt-version-review')||new URLSearchParams(location.search).get('panel')==='1')return;
 const result=await fetch('/review/catalog.json',{cache:'no-cache'});
 if(!result.ok)return;
 const {current,versions}=await result.json();
 const archived=location.pathname.match(/^\/history\/([\d.]+)(?:\/|$)/)?.[1];
 const version=archived||current;
 const active=versions.find(v=>v.id===version);
 if(!active||document.getElementById('nt-version-review'))return;
 const frozen=id=>'/history/'+id+'/';
 const card=document.createElement('details');
 card.id='nt-version-review';card.className='workflow-stage rv-card';card.setAttribute('aria-label','版本回看');
 card.innerHTML='<summary><span class="stage-no" aria-hidden="true">↺</span><span class="stage-main"><strong>版本回看</strong><small></small></span><span class="stage-chevron" aria-hidden="true">⌄</span></summary><div class="rv-body"><label class="rv-select-label" for="nt-release-select">选择版本</label><div class="rv-select-wrap"><select id="nt-release-select" aria-label="选择 NeuroTrace 版本"></select></div><p class="rv-summary"></p><nav class="rv-links" aria-label="版本工具"></nav><p class="rv-scope"></p></div>';
 const select=card.querySelector('select');
 const groups=new Map();
 for(const item of versions){
   const group=item.kind==='design'?'早期设计原型':'V'+item.id.split('.')[0]+' 系列';
   if(!groups.has(group)){const node=document.createElement('optgroup');node.label=group;groups.set(group,node);select.append(node);}
   const opt=document.createElement('option');opt.value=item.id;opt.textContent='V'+item.id+' · '+item.label+(item.id===current?'（最新）':'');
   groups.get(group).append(opt);
 }
 select.value=version;
 select.addEventListener('change',()=>location.assign(select.value===current?'/':frozen(select.value)));
 card.querySelector('.stage-main small').textContent='V'+version+' · '+versions.length+' 个版本'+(archived?' · 留档':'');
 card.querySelector('.rv-summary').textContent=active.summary;
 function link(label,href,newTab=false){
   const a=document.createElement('a');a.textContent=label;a.href=href;
   if(newTab){a.target='_blank';a.rel='noopener noreferrer';}card.querySelector('nav').append(a);return a;
 }
 const prev=versions[versions.findIndex(v=>v.id===version)+1]?.id||version;
 link('并排对照 ↗','/compare/?a='+(archived?version:prev)+'&b='+current,true);
 link('固定版本链接 ↗',frozen(version),true);
 if(archived){
   link('回正式版','/');
   if(active.original){link('原始部署 ↗',active.original,true).setAttribute('data-review-original','');}
 }
 card.querySelector('.rv-scope').textContent=archived?(active.kind==='design'?'原始设计评审稿':'试玩进度按版保存。有榜单的版本显示归档时的公开快照。'):'可切换整版页面，也可在新标签中对照。';
 const mobile=document.createElement('details');mobile.className='rv-mobile';mobile.setAttribute('aria-label','从设计到上线');
 mobile.innerHTML='<summary>从设计到上线 <b>版本回看 · V'+version+'</b><small>展开</small></summary>';
 mobile.addEventListener('toggle',()=>{mobile.querySelector('summary small').textContent=mobile.open?'收起':'展开';});
 let aside=document.querySelector('aside.brief');
 if(!aside){
   aside=document.createElement('aside');aside.className='brief';aside.setAttribute('aria-label','从设计到上线');
   aside.innerHTML='<div class="brief-head"><h1>从设计到上线</h1></div>';
   (document.querySelector('.workspace')||document.body).prepend(aside);
 }
 // Keep one workflow rail and one selector across responsive layout changes.
 const anchor=document.createComment('workflow rail position');aside.before(anchor);
 (aside.querySelector('.workflow-track')||aside.querySelector('.process')||aside).append(card);
 document.body.prepend(mobile);
 const media=matchMedia('(max-width:900px)');
 function place(){
   if(media.matches)mobile.append(aside);else anchor.after(aside);
   document.documentElement.classList.toggle('rv-mobile-active',media.matches);
   sizePhone();
 }
 function sizePhone(){
   if(!media.matches)return;
   const phone=document.querySelector('.phone-holder .phone');if(!phone)return;
   const strip=mobile.querySelector('summary').offsetHeight||35;
   const scale=Math.min(innerWidth/phone.offsetWidth,(innerHeight-strip)/phone.offsetHeight);
   if(scale>0&&Number.isFinite(scale)){
    const st=document.documentElement.style;
    st.setProperty('--rv-scale',String(scale));st.setProperty('--rv-width',phone.offsetWidth*scale+'px');st.setProperty('--rv-height',phone.offsetHeight*scale+'px');st.setProperty('--rv-strip',strip+'px');
   }
 }
 place();media.addEventListener('change',place);window.addEventListener('resize',sizePhone);
})().catch(()=>{});
