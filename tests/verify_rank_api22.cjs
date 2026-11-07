const test=require('node:test'),assert=require('node:assert/strict');
const lib=require.resolve('../lib/account'),saved=require(lib);
let used=[],reply=[];
require.cache[lib].exports={...saved,sql:async(query,args)=>{used.push([query,args]);return reply;}};
const rankings=require('../api/rankings');
function result(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(status){this.code=status;return this},json(data){this.data=data;return this}};}
test('rankings returns only public aggregate fields for each validated period',async()=>{
  reply=[{id:'a',name:'Alpha',score:'98',completed:'1',samples:'3',note:'private'}];
  for(const period of ['all','week','month']){
    const r=result();await rankings({method:'GET',query:{period}},r);
    assert.equal(r.code,200);assert.equal(r.data.period,period);
    assert.deepEqual(r.data.players,[{id:'a',name:'Alpha',score:98,completed:1,samples:3}]);
    assert.deepEqual(used.at(-1)[1],[period]);
  }
  const n=used.length;
  for(const [method,period,expected] of [['POST','month',405],['GET','10 days',400],['GET',['week','all'],400]]){
    const r=result();await rankings({method,query:{period}},r);
    assert.equal(r.code,expected);assert.equal(used.length,n);
  }
});
