const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const api=require('../api/identity');
const catalog=require('../data/catalog_v16.json');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('store price labels and server catalog use the same current units',()=>{
 const html=read('index.html');
 const start=html.indexOf('const SHOP_ITEMS=');
 const end=html.indexOf('];',start)+1;
 const items=vm.runInNewContext(html.slice(start,end)+'; SHOP_ITEMS');
 for(const {id,cost} of catalog)assert.equal(items.find(x=>x.id===id).cost,cost);
 assert.equal(catalog.find(x=>x.id==='wasabi55').cost,600);
 const migration=read('db/migrations/006_fieldwork.sql');
 for(const {id,cost} of catalog)assert.ok(migration.includes("WHEN '"+id+"' THEN cost:="+cost+";"));
});
test('an older open tab cannot redeem using the former 60-point quote',async()=>{
 for(const quote of [undefined,60]){
  const req={method:'POST',headers:{host:'test.example',origin:'https://test.example','content-type':'application/json',cookie:'__Host-nt_staff='+'f'.repeat(64)},body:{action:'redeem',item:'wasabi55',requestId:'00000000-0000-4000-8000-000000000001',quote}};
  const res={setHeader(){},status(n){this.code=n;return this},json(value){this.value=value;return this}};
  await api(req,res);
  assert.equal(res.code,409);
  assert.equal(res.value.error,'price_changed');
 }
});
