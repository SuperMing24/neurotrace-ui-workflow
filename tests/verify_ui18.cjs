// Exercise the actual canvas painter, projection/picker and player/page formatters without a browser installation.
const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const html = read('index.html');
const noop = () => {};

function sceneRig(index) {
  const calls = [], saved = [];
  let frame, vertices = 0;
  const brush = {
    lineWidth: 1, globalAlpha: 1, dash: [],
    save() { saved.push([this.lineWidth, this.globalAlpha, this.dash, this.strokeStyle, this.fillStyle]); },
    restore() { [this.lineWidth,this.globalAlpha,this.dash,this.strokeStyle,this.fillStyle] = saved.pop(); },
    beginPath() { vertices = 0; }, moveTo() { vertices++; }, lineTo() { vertices++; },
    arc: noop, fillText: noop, clearRect: noop, setTransform: noop,
    setLineDash(dash) { this.dash=Array.from(dash); },
    createRadialGradient() { return {addColorStop:noop}; },
    stroke() { calls.push({kind:'stroke', color:this.strokeStyle, width:this.lineWidth, dash:this.dash, alpha:this.globalAlpha, vertices}); },
    fill() { calls.push({kind:'fill',color:this.fillStyle,vertices}); },
    fillRect() { calls.push({kind:'backdrop',alpha:this.globalAlpha}); }
  };
  const canvas = {style:{},setAttribute:noop,addEventListener:noop,removeEventListener:noop,remove:noop,getContext:()=>brush};
  const env = {window:{},document:{createElement:()=>canvas},devicePixelRatio:1,
    requestAnimationFrame:draw=>{frame=draw;return 1;}, cancelAnimationFrame:noop};
  vm.runInNewContext(read('scene3d.js'),env);
  const scene=env.window.NeuroTrace3D;
  const state={taskIndex:index,addedEdges:[],selectedNodes:[],palette:'cyan',renderStyle:'model',contrast:100};
  const viewer=scene.create({appendChild:noop, clientWidth:380,clientHeight:560},state,noop);
  const draw=()=>{calls.length=0;frame(0);return calls;};
  return {state,viewer,scene,draw};
}

test('the rendered role colors, marker and selection weight track each of five themes in both styles',()=>{
  const {state,scene,draw}=sceneRig(0);
  state.addedEdges=[{id:'custom',taskId:'C-101',from:'a:end',to:'b:start'}];
  const themeIds=['cyan','violet','mint','amber','contrast'];
  assert.equal(new Set(themeIds.map(id=>scene.THEMES[id].selected)).size,5);
  for(const style of ['model','imaging']) for(const id of themeIds){
    state.renderStyle=style;state.palette=id;state.selectedOriginalSegmentId='a';state.selectedEdgeId=null;
    const theme=scene.THEMES[id], calls=draw();
    assert.equal(new Set([theme.line,theme.edge,theme.selected]).size,3);
    const original=calls.find(c=>c.kind==='stroke'&&c.color===theme.line&&c.vertices>2&&!c.dash.length);
    const highlighted=calls.find(c=>c.kind==='stroke'&&c.color===theme.selected&&!c.dash.length);
    const newEdge=calls.find(c=>c.kind==='stroke'&&c.color===theme.edge&&c.dash.length);
    assert.ok(original&&highlighted&&newEdge,style+'/'+id+' draws every role');
    assert.ok(calls.some(c=>c.kind==='fill'&&c.color===theme.edge&&c.vertices===5),'filled midpoint diamond');
    state.selectedOriginalSegmentId=null;state.selectedEdgeId='custom';
    const selected=draw().find(c=>c.kind==='stroke'&&c.color===theme.selected&&c.dash.length);
    assert.ok(selected.width>newEdge.width);
  }
});

test('changing contrast in a live V-426 scene changes weak, strong and backdrop draw alpha',()=>{
  const {state,draw,scene}=sceneRig(3);
  for(const style of ['model','imaging']) {
    state.renderStyle=style;
    const sample=value=>{
      state.contrast=value;
      const calls=draw(), alphas=calls.filter(c=>c.kind==='stroke'&&c.color===scene.THEMES.cyan.line).map(c=>c.alpha);
      return [Math.min(...alphas), Math.max(...alphas), calls.find(c=>c.kind==='backdrop').alpha];
    };
    const low=sample(55),mid=sample(100),high=sample(155);
    assert.ok(low[0]<low[1]&&high[0]<high[1]);
    for(let k=0;k<3;k++) assert.ok(low[k]<mid[k]&&mid[k]<high[k]&&high[k]-low[k]>.35,style+' channel '+k);
  }
});

test('the added edge diamond stays pickable and deleting it preserves other edges',()=>{
  const {viewer,state}=sceneRig(0);
  const edge={id:'short',taskId:'C-101',from:'a:end',to:'b:start'};
  const other={id:'keep',taskId:'C-101',from:'c:end',to:'f:end'};
  state.addedEdges=[edge,other];
  for(const zoom of [1,.45,2]){
    viewer.camera.zoom=zoom;
    const pts=viewer.projectedEndpoints(),a=pts[edge.from],b=pts[edge.to];
    const hit=viewer.pick((a.x+b.x)/2,(a.y+b.y)/2);
    assert.equal(hit?.id,edge.id,'diamond should select its edge at zoom '+zoom);
    assert.equal(viewer.pick(a.x,a.y)?.id,edge.from,'an exact endpoint remains separately selectable');
    state.selectedEdgeId=hit.id;
  }
  let remove;
  const action=html.match(/\$\('#delete-edge'\).*?\n/)[0];
  vm.runInNewContext(action,{state,remember:noop,toast:noop,$:()=>({addEventListener:(_,cb)=>{remove=cb;}})});
  remove();
  assert.deepEqual(state.addedEdges,[other]);
  assert.equal(state.selectedEdgeId,null);
});

test('one wallet and the shared resource SVGs reach HUD, profile and all three standings periods',()=>{
  const app={state:{addedEdges:[],shopOrders:[]}, window:{}, esc:String, contentShell:x=>x,icon:noop,head:noop,smallEntry:noop,NeuroMail:{entry:noop}};
  const pageFn=name=>html.slice(html.indexOf('function '+name+'(')).split('\nfunction ')[0];
  const playerLabels=html.slice(html.indexOf('const walletLabel='), html.indexOf('const keyFor='));
  app.activeCloud=null;
  vm.runInNewContext(playerLabels+read('ui18.js')+'\n'+pageFn('profileHTML')+'\n'+pageFn('globalHeader'),app);
  const bolt=app.resourceIcon('energy'),coin=app.resourceIcon('points');
  assert.notEqual(bolt,coin);
  for(const balance of [0,60,140,80]){
    app.state.score=balance;
    const wallet=app.resourceAmount('points',balance);
    for(const markup of [app.globalHeader(), app.profileHTML()]) {
      assert.ok(markup.includes(bolt)&&markup.includes(wallet),'same energy and credit markup on both surfaces');
    }
    for(const range of ['周榜','月榜','总榜']){
      app.state.rankPeriod=range;
      const ranking=app.ranking18();
      assert.match(ranking,/我的试玩积分/);
      assert.ok(ranking.split('我的试玩积分')[1].includes(wallet));
    }
  }
  app.activeCloud={id:'staff-02',name:'小王',title:'面壁者',points:28,weekPoints:28,monthPoints:28};
  app.state.score=app.activeCloud.points;
  app.window.NeuroIdentity={session:()=>app.activeCloud,roster:()=>({status:'ready',accounts:[app.activeCloud]})};
  const gold=app.resourceAmount('points',28);
  assert.ok(app.profileHTML().includes(gold)&&app.globalHeader().includes(gold));
  const board=app.ranking18();
  assert.ok(board.split('已验证的正式账号')[1].includes(gold));
  assert.doesNotMatch(board,/我的试玩积分/);
});

test('chapter, specimen metadata and mode note occupy separate normal-flow grid cells',()=>{
  const css=read('ui18.css');
  assert.match(html, /<div class="scene-readout">\$\{NeuroStory.gameChip\(\)\}<div class="nerve-scene-badge">[\s\S]*?<div class="nerve-scene-note">/);
  assert.match(css,/\.scene-readout\s*\{[^}]*display:\s*grid/);
  assert.match(css,/\.scene-readout \.case-chip,\s*#game-screen \.scene-readout \.nerve-scene-badge,\s*#game-screen \.scene-readout \.nerve-scene-note\s*\{[^}]*position:\s*static/);
});
