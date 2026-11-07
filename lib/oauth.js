const {timingSafeEqual}=require('node:crypto');
const {sql,randomBytes,digest,cookie}=require('./account');
const FLOW='__Host-nt_oauth';
const channels=['wechat','qq'];
const flowCookie=(value,age)=>FLOW+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+age;
function config(req,provider) {
  if(!channels.includes(provider)) return null;
  const prefix=provider==='qq'?'QQ':'WECHAT';
  const id=process.env['NEUROTRACE_'+prefix+'_APP_ID'];
  const secret=process.env['NEUROTRACE_'+prefix+(provider==='qq'?'_APP_KEY':'_APP_SECRET')];
  const origin=process.env.NEUROTRACE_AUTH_ORIGIN;
  if(!id||!secret||origin!=='https://'+req.headers.host) return null;
  return {id,secret,redirect:origin+'/api/oauth-'+provider};
}
async function providers(req,session) {
  const available=Object.fromEntries(channels.map(p=>[p,Boolean(config(req,p))]));
  const linked=session&&Object.values(available).some(Boolean)?(await sql('select nt_identity.linked_channels($1) as channel',[session])).map(r=>r.channel):[];
  return {available,linked};
}
async function start(req,res,b,session) {
  if(!channels.includes(b.provider)||!['bind','login'].includes(b.intent)) return res.status(400).json({error:'invalid_request'});
  const cfg=config(req,b.provider);
  if(!cfg) return res.status(503).json({error:'provider_unavailable'});
  if(b.intent==='bind'&&!session) return res.status(401).json({error:'sign_in_required'});
  if(b.intent==='login'&&session&&(await sql('select id from nt_identity.current_account($1)',[session])).length) return res.status(409).json({error:'already_signed_in'});
  const state=randomBytes(24).toString('hex'), verifier=randomBytes(32).toString('hex');
  const [row]=await sql('select nt_identity.start_oauth($1,$2,$3) as ok',[digest(state+verifier),b.provider,b.intent==='bind'?session:null]);
  if(row?.ok!==true&&row?.ok!=='t') return res.status(401).json({error:'sign_in_required'});
  const wx=b.provider==='wechat';
  const url=new URL(wx?'https://open.weixin.qq.com/connect/qrconnect':'https://graph.qq.com/oauth2.0/authorize');
  url.search=new URLSearchParams({[wx?'appid':'client_id']:cfg.id,redirect_uri:cfg.redirect,response_type:'code',scope:wx?'snsapi_login':'get_user_info',state});
  if(wx)url.hash='wechat_redirect';
  res.setHeader('Set-Cookie',flowCookie(state+'.'+verifier,480));
  return res.status(200).json({url:url.href});
}
async function exchange(provider,cfg,code) {
  const wx=provider==='wechat';
  const url=new URL(wx?'https://api.weixin.qq.com/sns/oauth2/access_token':'https://graph.qq.com/oauth2.0/token');
  url.search=new URLSearchParams(wx?{appid:cfg.id,secret:cfg.secret,code,grant_type:'authorization_code'}:
    {client_id:cfg.id,client_secret:cfg.secret,code,redirect_uri:cfg.redirect,grant_type:'authorization_code',fmt:'json',need_openid:'1'});
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(9000),cache:'no-store'});
  if(!response.ok) throw new Error('provider');
  const data=await response.json();
  if(data.error||data.errcode||typeof data.access_token!=='string'||!data.access_token||typeof data.openid!=='string'||!data.openid||data.openid.length>256) throw new Error('provider');
  return digest(JSON.stringify([provider,cfg.id,data.openid]));
}
function callback(provider) {
  return async (req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');
    const finish=(result,sessionCookie)=>{
      res.setHeader('Set-Cookie',sessionCookie?[flowCookie('',0),sessionCookie]:flowCookie('',0));
      res.setHeader('Location','/#nt-auth='+result);
      return res.status(303).end();
    };
    if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end();}
    const cfg=config(req,provider);
    if(!cfg) return finish('unavailable');
    const {state,code}=req.query||{};
    const flow=String(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(FLOW+'='))?.slice(FLOW.length+1);
    if(typeof state!=='string'||!(/^[0-9a-f]{48}$/).test(state)||!(/^[0-9a-f]{48}\.[0-9a-f]{64}$/).test(flow||'')||
      !timingSafeEqual(Buffer.from(state),Buffer.from(flow.slice(0,48))))return finish('expired');
    if(!code)return finish('cancelled');
    if(typeof code!=='string'||code.length>512)return finish('expired');
    try{
      const subject=await exchange(provider,cfg,code);
      const raw=randomBytes(32).toString('hex');
      const [row]=await sql('select nt_identity.finish_oauth($1,$2,$3,$4) as result',[digest(state+flow.slice(49)),provider,subject,digest(raw)]);
      const status=row?.result;
      if(status==='signed_in')return finish(status,cookie(raw,14400));
      return finish(['linked','conflict','expired'].includes(status)?status:'failed');
    } catch {return finish('failed');}
  };
}
module.exports={start,providers,callback};
