import { requireCompanyPortalSession, setCompanyApiHeaders } from '../../server/auth/requireCompanyPortalSession.js';
import { resolveCompanyAccess } from '../../server/company/resolveCompanyAccess.js';
import { getClientPortalBootstrap, runClientPortalAction } from '../../server/company/clientPortalService.js';

function send(res,status,payload){setCompanyApiHeaders(res);return res.status(status).json(payload)}

async function getSafeCurrentUser(db,userId,companyId){
  const [profileR,companyR]=await Promise.all([
    db.from('profiles').select('id,full_name,email,mobile').eq('id',userId).maybeSingle(),
    db.from('companies').select('id,account_owner_user_id,company_code,company_name,status,subdomain_slug').eq('id',companyId).maybeSingle(),
  ]);
  if(profileR.error)throw profileR.error;if(companyR.error)throw companyR.error;
  return {id:userId,name:profileR.data?.full_name||profileR.data?.email||'User',email:profileR.data?.email||null,mobile:profileR.data?.mobile||null,companyId,companyCode:companyR.data?.company_code,companyName:companyR.data?.company_name,companySlug:companyR.data?.subdomain_slug,companyStatus:companyR.data?.status,isAccountOwner:companyR.data?.account_owner_user_id===userId,portalType:'company'};
}

export default async function handler(req,res){
  try{
    const auth=await requireCompanyPortalSession(req);
    if(!auth.ok)return send(res,auth.status,{ok:false,code:auth.code});
    const currentUser=await getSafeCurrentUser(auth.db,auth.userId,auth.companyId);
    if(req.method==='GET'){
      const resource=String(req.query?.resource||'');
      if(resource==='bootstrap'){
        const data=await getClientPortalBootstrap({...auth,currentUser});
        return send(res,200,data);
      }
      const access=await resolveCompanyAccess(auth.db,auth.companyId);
      if(!access)return send(res,404,{ok:false,code:'COMPANY_NOT_FOUND'});
      return send(res,200,{ok:true,...access});
    }
    if(req.method==='POST'){
      const action=String(req.body?.action||'').trim();
      const payload=req.body?.payload&&typeof req.body.payload==='object'?req.body.payload:{};
      const result=await runClientPortalAction({...auth,currentUser,actionName:action,payload});
      return send(res,200,result);
    }
    return send(res,405,{ok:false,code:'METHOD_NOT_ALLOWED'});
  }catch(error){
    console.error('Company portal API failed:',error);
    return send(res,Number(error?.status)||500,{ok:false,code:error?.code||error?.message||'COMPANY_PORTAL_FAILED',message:Number(error?.status)>=400&&Number(error?.status)<500?error?.message:'Request could not be completed.'});
  }
}
