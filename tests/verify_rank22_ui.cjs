const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','ui18.js'),'utf8');
function rig(accounts=[],user=null){
 const ctx={state:{page:'rank',rankPeriod:'总榜',score:120},esc:String,contentShell:s=>s,render:()=>{},
  window:{NeuroIdentity:{roster:()=>({status:'ready',accounts}),session:()=>user}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);return ctx;
}
test('Shanghai Monday and first-of-month boundary give the real natural period',()=>{
 const c=rig();
 assert.equal(c.rankDates22('week',Date.parse('2026-11-01T15:59:59Z')),'2026.10.26 — 2026.11.01');
 assert.equal(c.rankDates22('week',Date.parse('2026-11-01T16:00:00Z')),'2026.11.02 — 2026.11.08');
 assert.equal(c.rankDates22('month',Date.parse('2026-10-31T16:00:00Z')),'2026.11.01 — 2026.11.30');
});
test('points use selected wallet field and label demonstrators on the all-time board only',()=>{
 const player={id:'u',name:'成员',title:'甲',weekPoints:0,monthPoints:45,points:34000};
 const c=rig([player],player);
 for(const k of ['周榜','月榜','总榜']){
  c.state.rankPeriod=k;const h=c.ranking18();
  for(const label of ['积分榜','表现榜','周榜','月榜','总榜'])assert.ok(h.includes(label));
  assert.equal(h.includes('演练角色'),k==='总榜');
  if(k==='周榜'){assert.match(h,/本期没有净积分/);assert.doesNotMatch(h,/34,000/);}
  if(k==='月榜'){assert.ok(h.includes(c.resourceAmount('points',45)));assert.doesNotMatch(h,/34,000/);}
  if(k==='总榜')assert.ok(h.includes(c.resourceAmount('points',34000)));
 }
});
test('separate period results, stale response protection, ties, API errors and proper empty period feedback',async()=>{
 const c=rig();let calls=[],renders=0;c.render=()=>renders++;c.fetch=url=>new Promise(resolve=>calls.push({url,resolve}));
 c.state.rankMetric='performance';c.state.rankPeriod='周榜';
 const week=c.loadPerformance22('week');
 c.state.rankPeriod='月榜';const month=c.loadPerformance22('month');
 assert.match(c.ranking18(),/正在读取表现榜/);
 const finish=(idx,period,players)=>calls[idx].resolve({ok:true,json:async()=>({period,players})});
 const base={samples:4,completed:1,score:86.7};finish(0,'week',[{...base,id:'w',name:'周甲'}]);await week;
 assert.equal(renders,0);assert.doesNotMatch(c.ranking18(),/周甲/);
 finish(1,'month',[{...base,id:'a',name:'月乙'},{...base,id:'b',name:'月甲',completed:3}]);await month;
 assert.equal(renders,1);let h=c.ranking18();
 assert.match(h,/月甲/);assert.match(h,/通关 3 \/ 已测 4/);assert.match(h,/86.7/);assert.doesNotMatch(h,/周甲/);
 assert.ok(h.indexOf('<span>1</span><div><b>月甲')>0);
 c.state.rankPeriod='总榜';const all=c.loadPerformance22('all');calls[2].resolve({ok:false});await all;
 assert.match(c.ranking18(),/重新读取/);
 const newer=c.loadPerformance22('week');finish(3,'week',[]);await newer;c.state.rankPeriod='周榜';
 assert.match(c.ranking18(),/本期尚无正式训练成绩/);assert.doesNotMatch(c.ranking18(),/突触旅人/);
});
