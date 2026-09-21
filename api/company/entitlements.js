import { requireCompanyPortalSession, setCompanyApiHeaders } from '../../server/auth/requireCompanyPortalSession.js';
import { resolveCompanyAccess } from '../../server/company/resolveCompanyAccess.js';
function send(res,status,payload){setCompanyApiHeaders(res);return res.status(status).json(payload)}
export default async function handler(req,res){
  if(req.method!=='GET')return send(res,405,{ok:false,code:'METHOD_NOT_ALLOWED'});
  try{const auth=await requireCompanyPortalSession(req);if(!auth.ok)return send(res,auth.status,{ok:false,code:auth.code});const access=await resolveCompanyAccess(auth.db,auth.companyId);if(!access)return send(res,404,{ok:false,code:'COMPANY_NOT_FOUND'});return send(res,200,{ok:true,...access});}
  catch(error){console.error('Company entitlements failed:',error);return send(res,500,{ok:false,code:'ENTITLEMENTS_FAILED'});}
}
