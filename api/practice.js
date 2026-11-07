// Trusted grading uses the same synthetic reference pairs and geometry as the playable specimens.
const {sql,sessionHash}=require('../lib/account');
const scene=require('../scene3d');
const keys=require('../story17');
const uuid=/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const specimen=new Map(scene.TASKS.map((task,index)=>[task.id,index]));
const pair=(a,b)=>[a,b].sort().join('|');

function compare(sample, edges) {
  if(!Object.hasOwn(keys,sample) || !Array.isArray(edges) || edges.length>200) return null;
  const index=specimen.get(sample);
  const allowed=new Set(scene.allEndpointsFor(index).filter(e=>!e.boundary).map(e=>e.id));
  const placed=new Set();
  for(const edge of edges) {
    if(!Array.isArray(edge)||edge.length!==2) return null;
    const [a,b]=edge;
    if(!allowed.has(a)||!allowed.has(b)||scene.originalConnected(index,a,b)) return null;
    placed.add(pair(a,b));
  }
  const expected=new Set(keys[sample].map(([a,b])=>pair(a,b)));
  const hits=[...placed].filter(k=>expected.has(k)).length;
  return [hits,placed.size-hits,expected.size-hits];
}

module.exports=async (req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('Vary','Cookie');
  res.setHeader('X-Content-Type-Options','nosniff');
  const fail=(status,error)=>res.status(status).json({error});
  const session=sessionHash(req);
  if(!session)return fail(401,'sign_in_required');
  try{
    let rows;
    if(req.method==='GET'){
      const staff=req.query?.view==='staff';
      rows=await sql(staff?'select nt_identity.practice_staff($1) as result':'select nt_identity.practice_snapshot($1) as result',[session]);
      if(!rows[0]?.result)return fail(staff?403:401,staff?'forbidden':'sign_in_required');
    }else if(req.method==='POST'){
      if(req.headers.origin!=='https://'+req.headers.host)return fail(403,'bad_origin');
      if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return fail(415,'json_required');
      const {accountId,sample,edges}=req.body||{};
      if(typeof accountId!=='string'||!uuid.test(accountId)||typeof sample!=='string')return fail(422,'invalid_sample');
      const counts=compare(sample,edges);
      if(!counts)return fail(422,'invalid_sample');
      rows=await sql('select nt_identity.file_practice($1,$2::uuid,$3,$4,$5,$6) as result',[session,accountId,sample,...counts]);
    }else{
      res.setHeader('Allow','GET, POST');return fail(405,'method_not_allowed');
    }
    const value=rows[0].result, data=typeof value==='string'?JSON.parse(value):value;
    if(data.error)return fail(data.error==='sign_in_required'?401:409,data.error);
    return res.status(200).json(data);
  }catch{return fail(503,'practice_unavailable');}
};
