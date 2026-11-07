// Loopback-only static verification server; blocks API writes and private source.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const publicRoot = path.resolve(root, process.argv[2] || '');
const buildRoot = path.join(root, 'build') + path.sep;
if (!publicRoot.startsWith(buildRoot) || path.basename(publicRoot) !== 'public') {
  throw new Error('Choose a local build/<directory>/public tree.');
}
const port = Number(process.argv[3] || 8766);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid local port');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8',
  '.txt':'text/plain; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.flac':'audio/flac'};
const server = http.createServer((req,res) => {
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (pathname.startsWith('/api/') || pathname.startsWith('/lib/')) {
    res.writeHead(503, {'Content-Type':'application/json'});
    res.end(JSON.stringify({error:'local_static_preview'})); return;
  }
  let file;
  try { file = path.resolve(publicRoot, '.' + decodeURIComponent(pathname)); }
  catch { res.writeHead(400); res.end(); return; }
  if (file !== publicRoot && !file.startsWith(publicRoot + path.sep)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  if (pathname.endsWith('/screen.txt')) res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
  console.log(req.method, pathname);
  res.writeHead(200);
  if (req.method === 'HEAD') res.end(); else fs.createReadStream(file).pipe(res);
});
server.listen(port, '127.0.0.1', async () => {
  const url = `http://127.0.0.1:${port}/`;
  const check = await fetch(url + 'review/catalog.json');
  if (!check.ok) throw new Error('Local preview readiness failed');
  console.log('Local verification:', url, '| APIs disabled |', (await check.json()).versions.length, 'archives');
});
