import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const COOKIE_NAME='__Host-bf_session';
const COMPANY_HOST='portal.buddyfleets.in';
const SUPABASE_URL=process.env.SUPABASE_URL;
const SERVICE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!SUPABASE_URL||!SERVICE_KEY) throw new Error('Company portal auth environment variables missing.');
const db=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const hash=(v)=>createHash('sha256').update(v).digest('hex');
const host=(req)=>String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim().toLowerCase().replace(/:\d+$/,'');
const ip=(req)=>String(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'').split(',')[0].trim()||null;
const ua=(req)=>String(req.headers['user-agent']||'').slice(0,1000);
function cookies(h){const o={};String(h||'').split(';').forEach(p=>{const i=p.indexOf('=');if(i>0)o[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())});return o}
export function setCompanyApiHeaders(res){res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');}
export async function requireCompanyPortalSession(req){
  if(host(req)!==COMPANY_HOST)return{ok:false,status:403,code:'COMPANY_HOST_REQUIRED'};
  const origin=req.headers.origin;if(origin){try{const u=new URL(origin);if(u.protocol!=='https:'||u.hostname!==COMPANY_HOST)return{ok:false,status:403,code:'ORIGIN_NOT_ALLOWED'}}catch{return{ok:false,status:403,code:'ORIGIN_NOT_ALLOWED'}}}
  const token=cookies(req.headers.cookie)[COOKIE_NAME]; if(!token||token.length<20)return{ok:false,status:401,code:'SESSION_REQUIRED'};
  const {data:s,error}=await db.from('security_sessions').select('id,user_id,portal_type,company_id,ip_address,user_agent,status,http_session_expires_at').eq('portal_session_token_hash',hash(token)).eq('status','active').maybeSingle();
  if(error)throw error; if(!s||s.portal_type!=='company'||!s.company_id)return{ok:false,status:401,code:'SESSION_INVALID'};
  if(Date.parse(s.http_session_expires_at)<=Date.now())return{ok:false,status:401,code:'SESSION_EXPIRED'};
  if(s.ip_address&&ip(req)&&String(s.ip_address)!==String(ip(req)))return{ok:false,status:401,code:'SECURITY_CONTEXT_CHANGED'};
  if(s.user_agent&&s.user_agent!==ua(req))return{ok:false,status:401,code:'SECURITY_CONTEXT_CHANGED'};
  const [{data:company,error:ce},{data:membership,error:me},{data:employee,error:ee}]=await Promise.all([
    db.from('companies').select('id,status').eq('id',s.company_id).maybeSingle(),
    db.from('company_memberships').select('status').eq('company_id',s.company_id).eq('user_id',s.user_id).maybeSingle(),
    db.from('developer_company_employees').select('status').eq('company_id',s.company_id).eq('user_id',s.user_id).maybeSingle(),
  ]);
  if(ce||me||(ee&&ee.code!=='42P01'))throw ce||me||ee;
  if(!company||!['trial_active','trial_expired','active'].includes(company.status)||!membership||membership.status!=='active')return{ok:false,status:403,code:'COMPANY_ACCESS_DENIED'};
  if(employee&&!['active','invited'].includes(employee.status))return{ok:false,status:403,code:'EMPLOYEE_ACCESS_BLOCKED'};
  return{ok:true,db,userId:s.user_id,companyId:s.company_id,sessionId:s.id};
}
