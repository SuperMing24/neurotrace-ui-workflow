const test=require('node:test');
const assert=require('node:assert/strict');
const identity=require('../api/identity');
const handlers={qq:require('../api/oauth-qq'),wechat:require('../api/oauth-wechat')};
const names=['NEUROTRACE_DATABASE_URL','NEUROTRACE_AUTH_ORIGIN','NEUROTRACE_QQ_APP_ID','NEUROTRACE_QQ_APP_KEY','NEUROTRACE_WECHAT_APP_ID','NEUROTRACE_WECHAT_APP_SECRET'];
function res(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.statusCode=c;return this;},json(v){this.jsonBody=v;return this;},end(){return this;}};}
const host='test.example';
const headers={host,origin:'https://'+host,'content-type':'application/json'};
test('unconfigured, cross-origin and anonymous binding attempts never contact a provider',async()=>{
  const available=await identity({method:'GET',headers,query:{view:'providers'}},res());
  assert.equal(available.jsonBody.available.qq,false);
  const off=await identity({method:'POST',headers,body:{action:'oauth',intent:'login',provider:'qq'}},res());
  assert.equal(off.statusCode,503);
  const cross=await identity({method:'POST',headers:{...headers,origin:'https://wrong.test'},body:{action:'oauth'}},res());
  assert.equal(cross.statusCode,403);
});
for(const provider of Object.keys(handlers))test(provider+' callback enforces browser state and application-scoped identifier',async()=>{
  const old=Object.fromEntries(names.map(k=>[k,process.env[k]])),originalFetch=global.fetch;
  const entries=['postgres://demo:demo@ep-safe.us-east-1.aws.neon.tech/demo','https://'+host,'test-qq-id','sample-key','test-wx-id','sample-appsecret'];
  names.forEach((k,i)=>process.env[k]=entries[i]);
  const seen=[], db=[];
  global.fetch=async(url,opts)=>{
    if(String(url).includes('/sql')){
      const {query,params}=JSON.parse(opts.body);
      db.push({query,params});
      const rows=query.includes('start_oauth')?[{ok:true}]:[{result:'signed_in'}];
      return {ok:true,json:async()=>({rows})};
    }
    seen.push(new URL(url));
    return {ok:true,json:async()=>({openid:'stub-external-id',access_token:'stub-access-token'})};
  };
  try{
    const b={action:'oauth',provider,intent:'bind'};
    const missing=await identity({method:'POST',headers,body:b},res());
    assert.equal(missing.statusCode,401);
    const start=await identity({method:'POST',headers,body:{...b,intent:'login'}},res());
    const redirect=new URL(start.jsonBody.url), state=redirect.searchParams.get('state');
    const flow=start.headers['Set-Cookie'].split(';')[0], callback='https://'+host+'/api/oauth-'+provider;
    assert.equal(redirect.searchParams.get('redirect_uri'),callback);
    assert.equal(redirect.hostname,provider==='qq'?'graph.qq.com':'open.weixin.qq.com');
    assert.doesNotMatch(start.jsonBody.url,/sample-key|sample-appsecret/);
    const wrong=await handlers[provider]({method:'GET',headers:{host,cookie:flow},query:{code:'c',state:'0'.repeat(48)}},res());
    assert.equal(wrong.headers.Location,'/#nt-auth=expired');assert.equal(seen.length,0);
    const valid=await handlers[provider]({method:'GET',headers:{host,cookie:flow},query:{code:'c',state}},res());
    assert.equal(valid.headers.Location,'/#nt-auth=signed_in');assert.equal(valid.statusCode,303);
    assert.match(valid.headers['Set-Cookie'][1],/^__Host-nt_staff=.+HttpOnly/);
    assert.equal(db[0].params[0],db[1].params[0]);assert.notEqual(db[0].params[0],state);
    assert.doesNotMatch(JSON.stringify(db),/stub-external-id|stub-access-token/);
    assert.equal(seen[0].hostname,provider==='qq'?'graph.qq.com':'api.weixin.qq.com');
  }finally{global.fetch=originalFetch;for(const k of names){if(old[k]===undefined)delete process.env[k];else process.env[k]=old[k];}}
});
