// Run with node tests/verify_quality21.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const app = {document:{querySelectorAll:()=>[]},persistDemo:()=>{}};
app.window=app;
vm.createContext(app);
for (const file of ['scene3d.js','quality21.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),app);
}
const q=app.NeuroQuality;
const chapters=['a','b','c','d'].map((id,index)=>({id,index,skill:id,answer:[['a:end','b:start'],['c:end','d:start']]}));
const sides=[{index:1,title:'分叉处的来信'},{index:4,title:'密林里的回线'}];
const data=q.restore({},chapters,sides);
const links=(...refs)=>refs.map(([from,to])=>({from,to}));
const ab=['a:end','b:start'], cd=['c:end','d:start'], bad=['g:end','f:start'];
function assess(chapter,...edges) { return q.observe(data,chapter,links(...edges)); }
assert.equal(assess(chapters[0]).last,0);
assert.equal(assess(chapters[0],ab).last,67);
assert.equal(assess(chapters[0],ab,[...ab].reverse()).last,67);
assert.equal(assess(chapters[0],ab,bad).last,50);
assert.match(q.feedback(data,chapters[0]),/正确 1 · 多连 1 · 漏连 1/);
for (const ch of chapters) assess(ch,ab,cd);
assert.deepEqual(JSON.parse(JSON.stringify(data.scores.a)),{first:0,best:100,last:100,hits:2,extra:0,missing:0});
assess(chapters[1],bad); assert.equal(data.scores.b.best,100);
const report={'H-204':{kind:'candidate',edges:[ab]}};
assert.doesNotMatch(q.panel(data,chapters,sides,report,false),/data-quality-review/);
const unlocked=q.panel(data,chapters,sides,report,true);
assert.match(unlocked,/已开放/);
assert.match(unlocked,/data-quality-review="H-204"/);
assert.doesNotMatch(unlocked,/data-quality-review="D-537"/);
assert.match(unlocked,/正面 X–Y/); assert.match(unlocked,/侧面 Z–Y/);
const input={value:'<b>侧视的候选连线与纤维方向连续。<\/b>'};
const label={}, status={};
let submit, saves=0;
const form={dataset:{qualityReview:'H-204'},elements:{note:input,decision:{value:'keep'}},
  addEventListener:(key,fn)=>{if(key==='submit')submit=fn;},
  closest:()=>({querySelector:()=>label}),querySelector:()=>status};
app.persistDemo=()=>{saves++;};
app.document.querySelectorAll=()=>[form];
q.bind(data,chapters,sides,report,true);
submit({preventDefault(){}});
assert.equal(saves,1);assert.equal(label.textContent,'已留复核意见');
const reloaded=q.restore(JSON.parse(JSON.stringify(data)),chapters,sides);
const reread=q.panel(reloaded,chapters,sides,report,true);
assert.match(reread,/已留复核意见/);assert.match(reread,/&lt;b&gt;侧视/);
report['H-204'].edges=[[...ab].reverse()];
assert.doesNotMatch(q.panel(reloaded,chapters,sides,report,true),/原报告已更新/);
report['H-204'].edges=[cd];
assert.match(q.panel(reloaded,chapters,sides,report,true),/原报告已更新/);
report['H-204']={kind:'uncertain',edges:[]};
assert.doesNotMatch(q.panel(reloaded,chapters,sides,report,true),/value="keep"/);
assert.equal(q.restore({scores:{a:{first:2,best:999,last:999}},reviews:{'H-204':{decision:'bad',note:'bad'}}},chapters,sides).scores.a,undefined);
assert.equal(q.restore(null,chapters,sides).reviews['H-204'],undefined);
console.log('Passed: reference-set scores, first/best, per-sample gate, second-read projections, persisted local review, stale reports and safe notes.');

(async()=>{
  const next=()=>new Promise(res=>setImmediate(res));
  let me={id:'official-A'}, response, calls=[], renders=0;
  app.NeuroIdentity={session:()=>me};
  app.state={page:'game'};app.render=()=>renders++;
  app.fetch=(path,opts)=>{calls.push([path,opts]);return new Promise(resolve=>response=resolve);};
  app.document.querySelectorAll=()=>[];
  app.document.activeElement=undefined;
  q.switchAccount(me);await next();
  assert.equal(calls[0][1].method,'GET');
  assert.doesNotMatch(q.panel(data,chapters,sides,report,true),/data-quality-review/);
  q.observe(data,chapters[0],links(ab,bad));
  q.observe(data,chapters[0],links(cd,ab));
  const sample=app.NeuroTrace3D.taskAt(0).id;
  const reply=(scores,accountId=me.id)=>response({ok:true,json:async()=>({accountId,scores})});
  reply({});await next();
  assert.deepEqual(JSON.parse(calls[1][1].body),{sample,accountId:me.id,edges:[ab,bad]});
  const wrong={first:50,best:50,last:50,hits:1,extra:1,missing:1};
  reply({[sample]:wrong});await next();
  assert.deepEqual(JSON.parse(calls[2][1].body).edges,[cd,ab]);
  reply({[sample]:{...wrong,best:100,last:100,hits:2,extra:0,missing:0}});await next();
  assert.match(q.feedback(data,chapters[0]),/正式成绩已记录/);
  assert.ok(q.cloudCleared(chapters[0]));
  assert.match(q.panel(data,chapters,sides,report,true),/50 \/ 100/);
  assert.equal(data.scores.a.first,0); // A practice performance never alters a different account's device log.
  q.observe(data,chapters[1],links(ab));
  await next();response({ok:false});await next();
  assert.match(q.feedback(data,chapters[1]),/未获确认/);
  assert.match(q.panel(data,chapters,sides,report,true),/重新同步/);
  q.observe(data,chapters[1],links(cd,ab));
  await next();const old=response, before=calls.length;
  q.observe(data,chapters[2],links(ab)); // queued under A
  me={id:'official-B'};q.switchAccount(me);await next();reply({});await next();
  old({ok:true,json:async()=>({accountId:'official-A',scores:{[sample]:wrong}})});await next();
  assert.equal(q.cloudCleared(chapters[0]),false);
  assert.equal(calls.length,before+1); // old queued POST did not use the new session
  assert.doesNotMatch(q.panel(data,chapters,sides,report,true),/50 \/ 100/);
  assert.ok(renders>0);me=null;q.switchAccount(null);
  assert.match(q.panel(data,chapters,sides,report,true),/0 \/ 100/); // demo stays distinct
  console.log('Passed: ordered wrong/right cloud submissions, server-only first and best scores, sync failure, account changes and demo isolation.');
})().catch(err=>{console.error(err);process.exitCode=1;});

(async()=>{
  const players=[
    {name:'Aster',tested:4,firstMean:80,bestMean:97,qualified:4,ready:true,points:500},
    {name:'Birch',tested:2,firstMean:80,bestMean:100,qualified:2,ready:false,points:900},
    {name:'Cedar',tested:5,firstMean:90,bestMean:95,qualified:4,ready:true,points:800}
  ];
  const handlers={}, list={innerHTML:''}, paths=[];
  let replaced=0;
  const panel={dataset:{},querySelector:selector=>selector==='[data-practice-list]'?list:null,
    addEventListener:(ev,handler)=>{handlers[ev]=handler;},set outerHTML(html){this.html=html;replaced++;this.dataset={};}};
  const ctx={URLSearchParams,location:{hash:''},state:{page:'settings'},document:{getElementById:id=>id==='nt-id-panel'?panel:null},
    fetch:async url=>{
      paths.push(url);
      const responses={'/api/identity?view=providers':{available:{},linked:[]},
        '/api/identity?view=roster':{accounts:[]},'/api/identity?view=session':{account:{id:'test',role:'developer_admin',name:'Admin',points:0}},
        '/api/identity?view=admin':{accounts:[]},'/api/practice?view=staff':{players}};
      return {ok:true,json:async()=>responses[url]};
    }};
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'..','identity18.js'),'utf8'),ctx);
  await ctx.NeuroIdentity.init();
  handlers.click({target:{closest:()=>({dataset:{identity:'staff'}})}});
  await new Promise(done=>setImmediate(done));
  assert.match(panel.html,/Aster/);assert.match(panel.html,/Birch/);assert.match(panel.html,/Cedar/);
  const requests=paths.length, before=replaced;
  const filter=(name,val)=>handlers.input({target:{dataset:{practiceFilter:name},value:val,validity:{valid:true}}});
  filter('ready','ready');assert.doesNotMatch(list.innerHTML,/Birch/);
  filter('points','600');assert.match(list.innerHTML,/Cedar/);assert.doesNotMatch(list.innerHTML,/Aster|Birch/);
  filter('points','1000');assert.match(list.innerHTML,/没有符合/);
  filter('ready','all');filter('points','');assert.match(list.innerHTML,/Birch/);
  assert.equal(paths.length,requests);assert.equal(replaced,before);
  console.log('Passed: staff eligibility and optional wallet filters combine in-place, keep focusable controls and make no new requests.');
})().catch(err=>{console.error(err);process.exitCode=1;});
