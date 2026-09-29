async function request(method,payload){
  try{const response=await fetch('/api/developer?route=account',{method,credentials:'include',cache:'no-store',referrerPolicy:'no-referrer',headers:{Accept:'application/json',...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})});const data=await response.json().catch(()=>({}));return {...data,ok:Boolean(response.ok&&data?.ok),status:response.status};}catch{return {ok:false,status:0,code:'NETWORK_ERROR'};}
}
export const getDeveloperAccount=()=>request('GET');
export const updateDeveloperProfile=(payload)=>request('PATCH',payload);
export const revokeOtherDeveloperSessions=()=>request('POST',{action:'REVOKE_OTHER_SESSIONS'});
export const revokeDeveloperSession=(sessionId)=>request('POST',{action:'REVOKE_SESSION',sessionId});

async function mfaRequest(method,payload){
  try{const response=await fetch('/api/auth/mfa',{method,credentials:'include',cache:'no-store',headers:{Accept:'application/json',...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})});const data=await response.json().catch(()=>({}));return {...data,ok:Boolean(response.ok&&data?.ok),status:response.status};}catch{return {ok:false,status:0,code:'NETWORK_ERROR'};}
}
export const getMfaStatus=()=>mfaRequest('GET');
export const beginMfaEnrollment=()=>mfaRequest('POST',{action:'BEGIN_ENROLLMENT'});
export const verifyMfaEnrollment=(factorId,challengeId,code)=>mfaRequest('POST',{action:'VERIFY_ENROLLMENT',factorId,challengeId,code});
export const disableMfa=(factorId,code)=>mfaRequest('POST',{action:'DISABLE',factorId,code});
