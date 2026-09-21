import { requireCompanyPortalSession, setCompanyApiHeaders } from '../../server/auth/requireCompanyPortalSession.js';
function send(res,status,payload){setCompanyApiHeaders(res);return res.status(status).json(payload)}
export default async function handler(req,res){
  try{
    const auth=await requireCompanyPortalSession(req); if(!auth.ok)return send(res,auth.status,{ok:false,code:auth.code});
    const {db,userId,companyId}=auth;
    if(req.method==='GET'){
      const now=new Date().toISOString();
      const {data,error}=await db.from('developer_company_announcement_recipients')
        .select('announcement_id,seen_at,acknowledged_at,developer_company_announcements!inner(id,title,message,priority,require_acknowledgement,allow_dismiss,starts_at,expires_at,status,created_at)')
        .eq('company_id',companyId).eq('user_id',userId).is('acknowledged_at',null);
      if(error)throw error;
      const announcements=(data||[]).map(r=>({...r.developer_company_announcements,recipient:{seen_at:r.seen_at,acknowledged_at:r.acknowledged_at}})).filter(a=>a.status==='published'&&(!a.starts_at||a.starts_at<=now)&&(!a.expires_at||a.expires_at>now));
      return send(res,200,{ok:true,announcements});
    }
    if(req.method==='POST'){
      const id=String(req.body?.announcementId||''); const action=String(req.body?.action||'seen'); if(!id)return send(res,400,{ok:false,code:'INVALID_ANNOUNCEMENT'});
      const patch=action==='acknowledge'?{seen_at:new Date().toISOString(),acknowledged_at:new Date().toISOString()}:{seen_at:new Date().toISOString()};
      const {error}=await db.from('developer_company_announcement_recipients').update(patch).eq('announcement_id',id).eq('company_id',companyId).eq('user_id',userId); if(error)throw error;
      return send(res,200,{ok:true});
    }
    return send(res,405,{ok:false,code:'METHOD_NOT_ALLOWED'});
  }catch(error){console.error('Company announcements failed:',error);return send(res,500,{ok:false,code:'ANNOUNCEMENTS_FAILED'});}
}
