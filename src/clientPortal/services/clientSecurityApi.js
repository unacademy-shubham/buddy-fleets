async function request(method,payload){
  try{
    const response=await fetch('/api/auth/mfa',{
      method,credentials:'include',cache:'no-store',referrerPolicy:'no-referrer',
      headers:{Accept:'application/json',...(payload?{'Content-Type':'application/json'}:{})},
      ...(payload?{body:JSON.stringify(payload)}:{}),
    });
    const data=await response.json().catch(()=>({}));
    return {...data,ok:Boolean(response.ok&&data?.ok),status:response.status};
  }catch{return {ok:false,status:0,code:'NETWORK_ERROR'};}
}
export const getClientMfaStatus=()=>request('GET');
export const beginClientMfaEnrollment=()=>request('POST',{action:'BEGIN_ENROLLMENT'});
export const verifyClientMfaEnrollment=(factorId,challengeId,code)=>request('POST',{action:'VERIFY_ENROLLMENT',factorId,challengeId,code});
export const disableClientMfa=(factorId,code)=>request('POST',{action:'DISABLE',factorId,code});
