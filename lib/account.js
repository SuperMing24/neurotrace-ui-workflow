const { createHash, randomBytes } = require('node:crypto');
const COOKIE = '__Host-nt_staff';
const hexKey = /^[a-f0-9]{64}$/;
const digest = value => createHash('sha256').update(value).digest('hex');

async function sql(query, params = []) {
  const connection = process.env.NEUROTRACE_DATABASE_URL;
  const host = new URL(connection).hostname;
  if (!/^ep-[a-z0-9-]+\..+\.neon\.tech$/.test(host)) throw new Error('db config');
  // Neon HTTP SQL wire endpoint used by the upstream serverless driver.
  const url = 'https://' + host.replace(/^[^.]+\./, 'api.') + '/sql';
  const response = await fetch(url, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000),
    headers: {'Content-Type':'application/json','Neon-Connection-String':connection,
              'Neon-Array-Mode':'false','Neon-Raw-Text-Output':'false'},
    body: JSON.stringify({query, params})
  });
  if (!response.ok) throw new Error('db unavailable');
  return (await response.json()).rows;
}

function cookie(value, maxAge) {
  return COOKIE+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+maxAge;
}
function sessionHash(req) {
  const token=String(req.headers.cookie||'').split(';').map(p=>p.trim()).find(p=>p.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  return hexKey.test(token||'')?digest(token):null;
}
module.exports={sql,digest,hexKey,cookie,randomBytes,sessionHash};
