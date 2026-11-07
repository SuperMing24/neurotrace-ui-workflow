const test=require('node:test'),assert=require('node:assert/strict');
const path=require.resolve('../lib/account'), real=require(path), keys=require('../story17');
const accountId='abdcba12-3456-4567-b567-abcdef123456';
let calls=[],reply;
require.cache[path].exports={...real,sql:async(query,params)=>{calls.push({query,params});return [{result:reply}];}};
const handler=require('../api/practice');
const defaultReq={method:'POST',headers:{host:'unit.invalid',origin:'https://unit.invalid','content-type':'application/json',cookie:'__Host-nt_staff='+'a'.repeat(64)}};
async function send(body,override={}){
 calls=[];const res={statusCode:0,setHeader(){},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}};
 await handler({...defaultReq,body,...override},res);return res;
}
test('server grades the six playable reference plates, with reversed and duplicate pairs counted once',async()=>{
 for(const [sample,key] of Object.entries(keys)){
  reply={accountId,scores:{}};const edges=key.map(([a,b])=>[b,a]);edges.push(edges[0]);
  const r=await send({sample,accountId,edges});
  assert.equal(r.statusCode,200,sample);assert.deepEqual(calls[0].params.slice(1),[accountId,sample,key.length,0,0]);
 }
 const r=await send({accountId,sample:'R-608',edges:[['a:end','d:start']]});
 assert.equal(r.statusCode,200);assert.deepEqual(calls[0].params.slice(-3),[0,1,2]);
});
test('foreign origins, unauthenticated sessions, open cases and fabricated terminal IDs cannot write grades',async()=>{
 const ok={accountId,sample:'C-101',edges:[]};
 for(const [body,override,status] of [
  [ok,{headers:{}},401],[ok,{headers:{...defaultReq.headers,origin:'https://other.invalid'}},403],
  [{...ok,sample:'H-204'},{},422],[{...ok,edges:[['a:start','b:start']]},{},422],[{...ok,edges:[['imagined','b:start']]},{},422]
 ]){assert.equal((await send(body,override)).statusCode,status);assert.equal(calls.length,0);}
 reply={error:'account_changed'};assert.equal((await send(ok)).statusCode,409);
 reply=null;assert.equal((await send(null,{method:'GET',query:{view:'staff'}})).statusCode,403);
});
