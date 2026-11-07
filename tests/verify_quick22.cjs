const {test}=require('node:test'),assert=require('node:assert/strict');
const {createHash,createHmac}=require('node:crypto');
const quick=require('../lib/quick-login');
const token='c2'.repeat(32), pin='6307', handle='siqi';
const sha=t=>createHash('sha256').update(t).digest('hex');
const proof=(t,h,p)=>createHmac('sha256',Buffer.from(t,'hex')).update('nt-quick-v1|'+h+'|'+p).digest('hex');
test('first enrollment, ordinary sign-in, rejection and no cross-account reuse',async()=>{
 const orig=global.fetch,db=process.env.NEUROTRACE_DATABASE_URL;let mode='ok', rows=[];
 process.env.NEUROTRACE_DATABASE_URL='postgres://test@ep-fake.region.neon.tech/db';
 global.fetch=async(_,o)=>{rows.push(JSON.parse(o.body).params);return {ok:true,json:async()=>({rows:[{result:mode}]})}};
 async function call(body,cookie=''){
  const res={headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(v){this.data=v;return this}};
  await quick({headers:{cookie},body},res,async()=>({account:{handle}}));return res;
 }
 try{
  assert.equal((await call({handle,pin})).data.error,'device_required');assert.equal(rows.length,0);
  let r=await call({handle,pin,invite:token});assert.equal(r.code,200);
  let cookies=r.headers['Set-Cookie'],device=cookies[1].match(/=([0-9a-f]{64});/)[1];
  assert.match(cookies[0],/^__Host-nt_staff=/);assert.match(cookies[1],/HttpOnly; Secure; SameSite=Strict/);
  assert.deepEqual(rows[0].slice(0,6),[handle,sha(token),proof(token,handle,pin),true,sha(device),proof(device,handle,pin)]);
  assert.ok(!rows[0].includes(token)&&!rows[0].includes(pin)&&!rows[0].includes(device));
  assert.equal((await call({handle:'xiaowang',pin},cookies[1].split(';')[0])).code,403);
  r=await call({handle,pin},cookies[1].split(';')[0]);assert.equal(r.code,200);assert.equal(r.headers['Set-Cookie'].length,1);
  mode='throttled';r=await call({handle,pin},cookies[1].split(';')[0]);assert.equal(r.code,429);assert.equal(r.headers['Set-Cookie'],undefined);
 }finally{global.fetch=orig;if(db===undefined)delete process.env.NEUROTRACE_DATABASE_URL;else process.env.NEUROTRACE_DATABASE_URL=db;}
});
