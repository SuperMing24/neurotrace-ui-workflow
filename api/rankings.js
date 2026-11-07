const {sql}=require('../lib/account');
const periods=new Set(['week','month','all']);

module.exports=async function rankings(req,res){
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({error:'method_not_allowed'});
  }
  const period=req.query?.period??'all';
  if(!periods.has(period))return res.status(400).json({error:'invalid_period'});
  try{
    const rows=await sql('select id,name,score,completed,samples from nt_identity.performance_rank($1)',[period]);
    const players=rows.map(({id,name,score,completed,samples})=>({
      id,name,score:Number(score),completed:Number(completed),samples:Number(samples)
    }));
    return res.status(200).json({period,players});
  }catch{
    return res.status(503).json({error:'rankings_unavailable'});
  }
};
