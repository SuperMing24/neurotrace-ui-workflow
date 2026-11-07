// Export the existing authored geometry only. No accounts, wallet or database access.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'scene3d.js'));
const context = { window: {} };
vm.runInNewContext(source.toString('utf8'), context, { timeout: 3000 });
const data = {
  purpose: 'offline synthetic geometry fixture; never seed production accounts or points',
  source: 'scene3d.js',
  sourceSHA256: crypto.createHash('sha256').update(source).digest('hex'),
  tasks: context.window.NeuroTrace3D.TASKS
};
const output = path.join(root, 'db', 'seeds', 'synthetic_tasks.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(data, null, 2) + '\n');
console.log(`Exported ${data.tasks.length} existing synthetic tasks. No database contacted.`);
