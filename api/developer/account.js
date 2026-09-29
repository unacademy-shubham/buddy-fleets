import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../server/auth/requireDeveloperSession.js';

function send(res,status,payload){setDeveloperApiHeaders(res);return res.status(status).json(payload);}
function clean(v,max=500){return String(v??'').trim().slice(0,max);}

async function loadAccount(auth){
  const db=auth.supabaseAdmin; const userId=auth.user.id;
  const [profileR,securityR,sessionsR] = await Promise.all([
    db.from('profiles').select('id,full_name,email,mobile').eq('id',userId).maybeSingle(),
    db.from('user_security').select('user_id,mfa_enabled,failed_login_attempts,locked_until,password_changed_at,updated_at').eq('user_id',userId).maybeSingle(),
    db.from('security_sessions').select('id,portal_type,ip_address,user_agent,status,last_seen_at,http_session_expires_at,created_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(30),
  ]);
  for(const result of [profileR,securityR,sessionsR]) if(result.error) throw result.error;
  return {
    profile: profileR.data || {id:userId,full_name:'',email:auth.user.email||'',mobile:''},
    security: securityR.data || {user_id:userId,mfa_enabled:false},
    sessions: sessionsR.data || [],
    currentSessionId: auth.securitySession?.id || null,
    currentSessionExpiresAt: auth.securitySession?.expiresAt || null,
  };
}

export default async function handler(req,res){
  if(!['GET','PATCH','POST'].includes(req.method)){res.setHeader('Allow','GET, PATCH, POST');return send(res,405,{ok:false,code:'METHOD_NOT_ALLOWED'});}
  const auth=await requireDeveloperSession(req);
  if(!auth.ok){if(auth.clearCookie)clearDeveloperSessionCookie(res);return send(res,auth.status||401,{ok:false,code:auth.code||'UNAUTHORIZED'});}
  const db=auth.supabaseAdmin; const userId=auth.user.id;
  try{
    if(req.method==='GET') return send(res,200,{ok:true,...await loadAccount(auth)});
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    if(req.method==='PATCH'){
      const fullName=clean(body.fullName,150), mobile=clean(body.mobile,30);
      if(!fullName) return send(res,400,{ok:false,code:'FULL_NAME_REQUIRED'});
      const {data,error}=await db.from('profiles').update({full_name:fullName,mobile}).eq('id',userId).select('id,full_name,email,mobile').maybeSingle();
      if(error) throw error;
      try{await db.auth.admin.updateUserById(userId,{user_metadata:{full_name:fullName,mobile}});}catch{}
      try{await db.from('audit_logs').insert({actor_user_id:userId,action:'developer.account.profile.update',entity_type:'profile',entity_id:userId,details:{full_name:fullName}});}catch{}
      return send(res,200,{ok:true,profile:data||{id:userId,full_name:fullName,email:auth.user.email||null,mobile}});
    }
    const action=clean(body.action,80).toUpperCase();
    if(action==='REVOKE_OTHER_SESSIONS'){
      const {error}=await db.from('security_sessions').update({status:'revoked',revoked_at:new Date().toISOString(),revoke_reason:'DEVELOPER_REVOKED_OTHER_SESSIONS',portal_session_token_hash:null,encrypted_access_token:null,access_token_iv:null,encrypted_refresh_token:null,refresh_token_iv:null}).eq('user_id',userId).eq('status','active').neq('id',auth.securitySession.id);
      if(error) throw error;
      return send(res,200,{ok:true,...await loadAccount(auth)});
    }
    if(action==='REVOKE_SESSION'){
      const sessionId=clean(body.sessionId,100); if(!sessionId) return send(res,400,{ok:false,code:'SESSION_ID_REQUIRED'});
      if(sessionId===auth.securitySession.id) return send(res,409,{ok:false,code:'CURRENT_SESSION_USE_SIGN_OUT'});
      const {error}=await db.from('security_sessions').update({status:'revoked',revoked_at:new Date().toISOString(),revoke_reason:'DEVELOPER_SESSION_REVOKED',portal_session_token_hash:null,encrypted_access_token:null,access_token_iv:null,encrypted_refresh_token:null,refresh_token_iv:null}).eq('id',sessionId).eq('user_id',userId).eq('status','active');
      if(error) throw error;
      return send(res,200,{ok:true,...await loadAccount(auth)});
    }
    return send(res,400,{ok:false,code:'INVALID_ACTION'});
  }catch(error){console.error('Developer account API failed:',error?.message||error);return send(res,500,{ok:false,code:'DEVELOPER_ACCOUNT_FAILED'});}
}
