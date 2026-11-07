const {createHmac}=require('node:crypto');
const {sql,digest,hexKey,cookie,sessionHash,randomBytes}=require('./account');
const handles=new Set(['siqi','xiaowang']);
const deviceCookie=handle=>'__Host-nt_device_'+handle;
const verify=(token,handle,pin)=>createHmac('sha256',Buffer.from(token,'hex'))
 .update('nt-quick-v1|'+handle+'|'+pin).digest('hex');

module.exports=async function quickLogin(req,res,loadSession){
 const {handle,pin,invite}=req.body;
 const fail=(status,error)=>res.status(status).json({error});
 if(!handles.has(handle)||typeof pin!=='string'||!/^\d{4}$/.test(pin))return fail(400,'invalid_pin');
 const enrolling=invite!==undefined;
 const raw=enrolling?invite:String(req.headers.cookie||'').split(';').map(x=>x.trim())
   .find(x=>x.startsWith(deviceCookie(handle)+'='))?.slice(deviceCookie(handle).length+1);
 if(typeof raw!=='string'||!hexKey.test(raw))return fail(403,'device_required');
 const session=randomBytes(32).toString('hex');
 const device=enrolling?randomBytes(32).toString('hex'):null;
 const [row]=await sql('select nt_identity.quick_login($1,$2,$3,$4,$5,$6,$7,$8) as result',
  [handle,digest(raw),verify(raw,handle,pin),enrolling,device&&digest(device),device&&verify(device,handle,pin),digest(session),sessionHash(req)]);
 if(row?.result!=='ok'){
  if(row?.result==='throttled'){res.setHeader('Retry-After','900');return fail(429,'pin_throttled');}
  if(row?.result==='device_required')return fail(403,'device_required');
  return fail(401,'pin_rejected');
 }
 const cookies=[cookie(session,14400)];
 if(enrolling)cookies.push(deviceCookie(handle)+'='+device+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=15552000');
 res.setHeader('Set-Cookie',cookies);
 return res.status(200).json(await loadSession(digest(session)));
};
