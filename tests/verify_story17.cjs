// Run with node tests/verify_story17.cjs from the project directory.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname,'..');
const ids = ['dawn','tide','parallax'];
const stars = [];
let prior = null;
const app = {
  window:null, state:{page:'game',loggedIn:true,taskIndex:0,addedEdges:[],score:68,selectedNodes:[]},
  localStorage:{getItem:()=>prior},
  document:{querySelectorAll:()=>[]},
  render:()=>{}, setPage:page=>{app.state.page=page;},
  taskSwitch:i=>{app.state.taskIndex=i;},
  persistDemo:()=>{prior=JSON.stringify({story17:app.state.story17, score:app.state.score});},
  NeuroMail:{notify:m=>stars.push(m)},contentShell:x=>x,head:x=>x,embeddedAssets:{},embeddedThumbs:[]
};
app.window=app;
vm.createContext(app);
for(const file of ['scene3d.js','story17.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),app);
const story=app.NeuroStory,scene=app.NeuroTrace3D,st=app.state;
const click=(selector,dataset={})=>{
  let handler;
  app.document.querySelectorAll=q=>q===selector?[{dataset,addEventListener:(_,fn)=>{handler=fn;}}]:[];
  story.bind();
  assert.ok(handler,selector);
  handler();
};
const launch=id=>click('[data-story-launch]',{storyLaunch:id});
const key=(index,answers)=>{
  st.addedEdges=answers.map(([from,to],i)=>{
    assert.equal(scene.connectionExists(index,[],from,to),null);
    return {id:'test'+i,taskId:scene.taskAt(index).id,from,to};
  });
};
const ab=['b:start','a:end'], ef=['f:start','e:end'], cd=['c:end','d:start'];
story.init();
assert.equal(st.score,0);assert.equal(story.completionCount(),0);
assert.match(story.archiveHTML(),/第一束回声/);
launch('tide');assert.equal(st.taskIndex,0);
click('[data-story-side]',{storySide:'1'});assert.equal(st.taskIndex,0);
click('#story-submit');assert.match(story.resultSheet(),/还缺 1 处/);assert.equal(st.score,0);
click('[data-story-dismiss]');
key(0,[ab,['c:end','f:end']]);click('#story-submit');
assert.match(story.resultSheet(),/有 1 条多余连接/);assert.equal(st.score,0);
click('[data-story-dismiss]');
for (const [n,[index,pairs]] of [[0,[ab]],[3,[ab,ef]],[2,[ab,cd,ef]]].entries()){
  launch(ids[n]);assert.equal(st.taskIndex,index);
  key(index,pairs);click('#story-submit');
  assert.equal(story.completionCount(),n+1);
  assert.equal(st.score,[60,140,240][n]);
  assert.match(story.resultSheet(),/回声已归档/);
  click('[data-story-return]');assert.equal(st.page,'archive');
  launch(ids[n]);click('#story-submit');
  assert.match(story.resultSheet(),/积分和碎片已领取/);
  assert.equal(st.score,[60,140,240][n]);click('[data-story-dismiss]');
}
assert.equal(stars.length,3);assert.match(story.civilHTML(),/联合测绘台已上线/);
click('[data-story-tab]',{storyTab:'fragments'});assert.match(story.archiveHTML(),/微光底片/);
click('[data-story-side]',{storySide:'1'});assert.equal(st.taskIndex,1);assert.equal(st.camera3d.yaw,Math.PI/2);
click('#story-submit');assert.match(story.resultSheet(),/登记为证据不足/);
click('[data-story-record]',{storyRecord:'uncertain'});assert.equal(story.taskCount(),1);assert.match(story.resultSheet(),/观察记录已保存/);
click('[data-story-side]',{storySide:'4'});assert.equal(st.palette,'contrast');assert.equal(st.contrast,130);
key(4,[ab]);click('#story-submit');click('[data-story-record]',{storyRecord:'candidate'});
assert.equal(story.taskCount(),2);assert.equal(st.score,240);
app.persistDemo();story.init();assert.equal(story.taskCount(),2);assert.equal(story.completionCount(),3);
story.reset();assert.equal(st.score,0);assert.equal(story.taskCount(),0);assert.equal(story.completionCount(),0);
prior=JSON.stringify({score:78});st.score=78;st.taskIndex=4;story.init();
assert.equal(st.score,78);assert.equal(st.taskIndex,0);
console.log('Story, exact-match grading, locks, wallet, repeat, fragments, civilization, side records, migration and reload passed.');
