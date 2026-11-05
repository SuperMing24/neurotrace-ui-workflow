// Same-origin account API. Database permissions are held by the application role only.
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

function account(row) {
  if (!row) return null;
  const result = {...row, points:Number(row.points)};
  if ('weekPoints' in row) {
    result.weekPoints = Number(row.weekPoints);
    result.monthPoints = Number(row.monthPoints);
  }
  return result;
}
async function loadSession(hash) {
  if (!hash) return {account:null,cleared:[]};
  const [row]=await sql('select c.*, nt_identity.cleared($1) as cleared from nt_identity.current_account($1) c',[hash]);
  if(!row)return {account:null,cleared:[]};
  const {cleared,...me}=row;
  return {account:account(me),cleared:typeof cleared==='string'?JSON.parse(cleared):cleared||[]};
}
function cookie(value, maxAge) {
  return COOKIE+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+maxAge;
}
function isTrue(v) { return v===true || v==='t' || v==='true'; }

module.exports = async function identity(req,res) {
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('Vary','Cookie');
  res.setHeader('X-Content-Type-Options','nosniff');
  const send = (status, data) => res.status(status).json(data);
  const fail = (status, error) => send(status,{error});
  const token = String(req.headers.cookie||'').split(';').map(p=>p.trim()).find(p=>p.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
  const session = hexKey.test(token||'') ? digest(token) : null;
  try {
    if (req.method==='GET') {
      const view = req.query?.view || 'session';
      if (view==='roster') return send(200,{accounts:(await sql('select * from nt_identity.roster()')).map(account)});
      if (view==='session') {
        return send(200,await loadSession(session));
      }
      if (view!=='admin') return fail(404,'not_found');
      if (!session) return fail(401,'sign_in_required');
      const rows = await sql('select * from nt_identity.staff_directory($1)',[session]);
      if (!rows.length) {const me=(await loadSession(session)).account;return me ? fail(403,'forbidden') : fail(401,'sign_in_required');}
      return send(200,{accounts:rows.map(r=>({...r,activated:isTrue(r.activated),active_sessions:Number(r.active_sessions)}))});
    }
    if (req.method!=='POST') {res.setHeader('Allow','GET, POST');return fail(405,'method_not_allowed');}
    if (req.headers.origin !== 'https://'+req.headers.host) return fail(403,'bad_origin');
    if (!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')) return fail(415,'json_required');
    const b=req.body;
    if (!b || typeof b!=='object' || Array.isArray(b)) return fail(400,'invalid_request');
    if (b.action==='logout') {
      if(session) await sql('select nt_identity.signout($1)',[session]);
      res.setHeader('Set-Cookie',cookie('',0));
      return send(200,{account:null,cleared:[]});
    }
    if (b.action==='grade' || b.action==='redeem') {
      if (!session) return fail(401,'sign_in_required');
      const grade=b.action==='grade';
      if(grade && (!['dawn','tide','parallax'].includes(b.chapter) || !Array.isArray(b.edges) || b.edges.length>200 ||
        b.edges.some(e=>!Array.isArray(e)||e.length!==2||e.some(v=>typeof v!=='string'||!(/^[a-z]:(start|end)$/).test(v))))) return fail(422,'wrong_answer');
      if(!grade && (!['wasabi55','snack-kit','sampler','backpack'].includes(b.item) ||
        typeof b.requestId!=='string'|| !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(b.requestId))) return fail(400,'invalid_order');
      const [r]=grade ? await sql('select nt_identity.grade($1,$2,$3::jsonb) as result',[session,b.chapter,JSON.stringify(b.edges)]) :
        await sql('select nt_identity.redeem($1,$2,$3::uuid) as result',[session,b.item,b.requestId]);
      const value=Number(r.result);
      if(value===-1)return fail(401,'sign_in_required');
      if(value===-2)return fail(grade?422:400,grade?'wrong_answer':'invalid_order');
      if(value===-3)return fail(409,grade?'chapter_locked':'insufficient_points');
      if(value===-4)return fail(409,'request_conflict');
      const snapshot=await loadSession(session);
      return send(200,{...snapshot,...(grade?{awarded:value}:{requestId:b.requestId,charged:value})});
    }
    if (b.action==='revoke') {
      if (!session) return fail(401,'sign_in_required');
      if (typeof b.id!=='string' || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(b.id)) return fail(400,'invalid_account');
      const [r]=await sql('select nt_identity.revoke_sessions($1,$2::uuid) as allowed',[session,b.id]);
      return isTrue(r.allowed) ? send(200,{revoked:true}) : fail(403,'forbidden');
    }
    if (!['activate','login'].includes(b.action)) return fail(400,'invalid_action');
    if (typeof b.key!=='string' || !hexKey.test(b.key)) return fail(400,'invalid_key');
    if(b.action==='activate' && (typeof b.code!=='string'||!hexKey.test(b.code))) return fail(400,'invalid_code');
    const raw=randomBytes(32).toString('hex'), sd=digest(raw);
    const [r]=await sql('select nt_identity.signin($1,$2,$3) as allowed',[digest(b.key),sd,b.action==='activate'?digest(b.code):null]);
    if(!isTrue(r.allowed))return fail(401,'credentials_rejected');
    const snapshot=await loadSession(sd);
    res.setHeader('Set-Cookie',cookie(raw,14400));
    return send(200,snapshot);
  } catch {
    return fail(503,'account_service_unavailable');
  }
};
