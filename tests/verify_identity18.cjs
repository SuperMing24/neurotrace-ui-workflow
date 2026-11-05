const { test } = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/identity.js');

function response() {
  return {headers:{},setHeader(k,v){this.headers[k]=v},status(v){this.code=v;return this},json(v){this.data=v;return this}};
}
function req(method,more={}) {
  return {method,headers:{host:'test.vercel.app',origin:'https://test.vercel.app','content-type':'application/json'},...more};
}
async function run(request) { const res=response();await handler(request,res);return res; }

test('anonymous visitor cannot claim a reserved account via nickname, role or a local demo cookie',async()=>{
  const headers={host:'test.vercel.app',cookie:'demo=siqi; role=developer_admin'};
  let r=await run(req('GET',{headers,query:{role:'developer_admin'}})); assert.equal(r.code,200);assert.equal(r.data.account,null);
  r=await run(req('GET',{headers,query:{view:'admin'}}));assert.equal(r.code,401);
  r=await run(req('POST',{body:{action:'login',handle:'siqi',role:'developer_admin'}}));assert.equal(r.code,400);
  r=await run(req('POST',{body:{action:'activate',key:'a'.repeat(64),code:''}}));assert.equal(r.code,400);
  r=await run(req('POST',{body:{action:'revoke',id:'975dc343-4c9b-48d9-9224-69231d4ac047'}}));assert.equal(r.code,401);
  r=await run(req('POST',{headers:{host:'test.vercel.app',origin:'https://foreign.example','content-type':'application/json'},body:{action:'logout'}}));assert.equal(r.code,403);
});
test('database responses are converted to integer points and sign-in sets only an HTTP-only session cookie',async()=>{
  const old=global.fetch, env=process.env.NEUROTRACE_DATABASE_URL;
  process.env.NEUROTRACE_DATABASE_URL='postgres://fake:fake@ep-id.us-east-1.aws.neon.tech/neurotrace';
  const row={name:'四七',role:'developer_admin',points:'0',weekPoints:'0',monthPoints:'0'};
  let calls=[];
  global.fetch=async (url,options)=>{
    const payload=JSON.parse(options.body);calls.push(payload);
    assert.equal(url,'https://api.us-east-1.aws.neon.tech/sql');
    return {ok:true,json:async()=>({rows:payload.query.includes('signin')?[{allowed:true}]:[row]})};
  };
  try{
    let r=await run(req('GET',{query:{view:'roster'}}));assert.equal(r.data.accounts[0].weekPoints,0);
    r=await run(req('POST',{body:{action:'login',key:'1'.repeat(64)}}));assert.equal(r.code,200);assert.equal(r.data.account.name,'四七');
    assert.ok(!JSON.stringify(calls).includes('1'.repeat(64)));assert.match(r.headers['Set-Cookie'],/^__Host-nt_staff=[0-9a-f]{64}; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=14400$/);
    r=await run(req('POST',{body:{action:'logout'}}));assert.match(r.headers['Set-Cookie'],/Max-Age=0$/);
  }finally{global.fetch=old;if(env===undefined)delete process.env.NEUROTRACE_DATABASE_URL;else process.env.NEUROTRACE_DATABASE_URL=env;}
});
