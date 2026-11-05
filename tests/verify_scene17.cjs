// Run from any directory with: node path/to/tests/verify_scene17.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const read = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const html = read('index.html');
const engine = read('scene3d.js').trim();

function match(source, pattern) {
  const found = source.match(pattern);
  assert.ok(found, 'Production code not found: ' + pattern);
  return found[1];
}

test('page loads the tested scene engine', () => {
  assert.match(html, /<script src="scene3d\.js"><\/script>/);
});

test('each marked boundary can be picked but cannot start or finish a connection', () => {
  const noop = () => {};
  const labels = [];
  const brush = Object.fromEntries([
    'save', 'restore', 'setTransform', 'beginPath', 'moveTo', 'lineTo', 'stroke',
    'arc', 'fill', 'setLineDash', 'clearRect', 'fillRect'
  ].map(method => [method, noop]));
  brush.fillText = label => labels.push(label);
  brush.createRadialGradient = () => ({ addColorStop: noop });

  let frame;
  const canvas = {
    setAttribute: noop, addEventListener: noop, removeEventListener: noop,
    remove: noop, style: {}, getContext: () => brush
  };
  const env = {
    window: {}, document: { createElement: () => canvas },
    devicePixelRatio: 1, cancelAnimationFrame: noop,
    requestAnimationFrame: draw => { frame = draw; return 1; }
  };
  vm.runInNewContext(engine, env);
  const scene = env.window.NeuroTrace3D;
  for (const [index, task] of scene.TASKS.entries()) {
    assert.ok(task.boundaryTerminals.length, task.id + ' should contain boundary examples');
    const volume = { clientWidth: 380, clientHeight: 560, appendChild: noop };
    const state = { taskIndex: index, addedEdges: [], selectedNodes: [], endpointsVisible: true };
    const viewer = scene.create(volume, state, noop);
    frame(0);
    const other = task.candidates.find(id => !scene.isBoundaryTerminal(index, id));
    assert.ok(other);
    for (const id of task.boundaryTerminals) {
      const p = viewer.projectedEndpoints()[id];
      const hit = viewer.pick(p.x, p.y);
      assert.equal(hit?.type, 'node', task.id + '/' + id);
      assert.equal(hit.id, id);
      assert.equal(scene.connectionExists(index, [], id, other), 'boundary');
      assert.equal(scene.connectionExists(index, [], other, id), 'boundary');
    }
    viewer.dispose();
  }
  assert.ok(labels.includes('X'), 'canvas rendered a frame');
  assert.ok(!labels.some(label => /boundary/i.test(label)));
});

test('another boundary tap restarts the notice, which dismisses automatically or by its × button', () => {
  // Run the page's notification functions and actual dismissal binding in their own
  // lexical scope. This exercises the timer without rendering unrelated screens.
  const noticeCode = match(html, /(const boundaryNoticeText=[\s\S]+?)\nfunction setPage\(/);
  const pickNotice = match(html, /return (toast\(boundaryNoticeText,\s*\d+\))\s*}/);
  const bindDismiss = match(html, /(\$\('#dismiss-toast'\)\?\.addEventListener\('click',dismissNotice\))/);
  assert.ok(html.includes('id="dismiss-toast" aria-label="关闭末端提示"'));

  let now = 0, serial = 0, visible = false, close;
  const timers = new Map();
  const env = {
    state: { toast: '', selectedBoundaryEndpointId: 'a:start' },
    render: () => { visible = true; },
    $: id => id === '#dismiss-toast' && { addEventListener: (_, fn) => { close = fn; } },
    document: { querySelector: () => visible ? { remove: () => { visible = false; } } : null },
    setTimeout: (fn, delay) => { timers.set(++serial, { fn, at: now + delay }); return serial; },
    clearTimeout: id => timers.delete(id)
  };
  vm.runInNewContext(noticeCode + '\nthis.tap = () => ' + pickNotice + ';\n' + bindDismiss + ';', env);
  const advance = ms => {
    now += ms;
    for (const [id, entry] of timers) {
      if (entry.at <= now) { timers.delete(id); entry.fn(); }
    }
  };

  env.tap();
  assert.ok(visible && env.state.toast);
  const duration = [...timers.values()][0].at;
  assert.ok(duration >= 2000 && duration <= 6000);
  advance(duration - 1);
  env.tap();
  advance(1);
  assert.ok(visible, 'new tap gets its own reading time');
  advance(duration - 1);
  assert.equal(visible, false);
  assert.equal(env.state.toast, '');

  env.tap();
  close();
  assert.equal(visible, false);
  assert.equal(env.state.toast, '');
  assert.equal(timers.size, 0);
  assert.equal(env.state.selectedBoundaryEndpointId, 'a:start', 'closing the notice keeps the inspected node');
});
