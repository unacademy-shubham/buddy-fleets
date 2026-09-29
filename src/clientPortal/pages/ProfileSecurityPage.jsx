import React,{useEffect,useState} from 'react';
import {KeyRound,LogOut,ShieldCheck,Smartphone,UserRound,X} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PhotoField from '../components/PhotoField';
import DataTable from '../components/DataTable';
import {useClientPortal} from '../ClientPortalContext';
import {beginClientMfaEnrollment,disableClientMfa,getClientMfaStatus,verifyClientMfaEnrollment} from '../services/clientSecurityApi';

export default function ProfileSecurityPage(){
  const {currentUser,data,demo,apiAction,refresh,onLogout}=useClientPortal();
  const profile=data?.selfProfile||{};
  const [form,setForm]=useState({full_name:profile.full_name||currentUser?.name||'',mobile:profile.mobile||currentUser?.mobile||'',alternate_mobile:profile.alternate_mobile||'',designation:profile.designation||'',address:profile.address||'',emergency_contact:profile.emergency_contact||''});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [mfa,setMfa]=useState(null);
  const [enroll,setEnroll]=useState(null);
  const [code,setCode]=useState('');

  useEffect(()=>{setForm({full_name:profile.full_name||currentUser?.name||'',mobile:profile.mobile||currentUser?.mobile||'',alternate_mobile:profile.alternate_mobile||'',designation:profile.designation||'',address:profile.address||'',emergency_contact:profile.emergency_contact||''});},[profile.full_name,profile.mobile,profile.alternate_mobile,profile.designation,profile.address,profile.emergency_contact,currentUser?.name,currentUser?.mobile]);
  useEffect(()=>{if(demo){setMfa({mfaEnabled:false,verifiedFactors:[]});return;}let live=true;getClientMfaStatus().then(r=>{if(live&&r.ok)setMfa(r)});return()=>{live=false};},[demo]);

  const save=async()=>{setBusy(true);setMessage('');try{await apiAction('save_profile',form);await refresh();setMessage(demo?'Demo profile saved in the persisted demo workspace.':'Profile saved.');}catch(e){setMessage(e?.message||'Unable to save profile.');}finally{setBusy(false)}};
  const changePassword=async()=>{if(demo){setMessage('Demo password change is simulated and does not alter the demo login.');return;}const current=window.prompt('Current password:');if(!current)return;const next=window.prompt('New password (minimum 8 characters):');if(!next)return;await apiAction('change_password',{current_password:current,new_password:next});window.alert('Password updated. Other sessions were revoked.');};
  const revoke=async()=>{if(demo){setMessage('Demo session revocation simulated.');return;}await apiAction('revoke_other_sessions',{});setMessage('Other active Buddy Fleets sessions revoked.');};
  const beginMfa=async()=>{if(demo){setMessage('Authenticator enrollment is disabled inside the shared demo workspace.');return;}setBusy(true);setMessage('');try{const r=await beginClientMfaEnrollment();if(!r.ok)throw new Error(r.code||'Unable to start MFA enrollment.');setEnroll(r);setCode('');setMessage('Scan the QR code in your authenticator app, then enter the 6-digit code.');}catch(e){setMessage(e.message);}finally{setBusy(false)}};
  const verifyMfa=async()=>{if(!enroll||code.length!==6)return;setBusy(true);try{const r=await verifyClientMfaEnrollment(enroll.factorId,enroll.challengeId,code);if(!r.ok)throw new Error(r.code||'MFA verification failed.');setMessage('MFA enabled successfully. A fresh sign-in is required.');setTimeout(()=>{if(onLogout)onLogout();else window.location.replace('https://buddyfleets.in/login');},900);}catch(e){setMessage(e.message);}finally{setBusy(false)}};
  const disable=async()=>{if(demo)return;const factorId=mfa?.verifiedFactors?.[0]?.id;if(!factorId)return;const otp=String(window.prompt('Enter the current 6-digit authenticator code to disable MFA:')||'').replace(/\D/g,'').slice(0,6);if(otp.length!==6)return;setBusy(true);try{const r=await disableClientMfa(factorId,otp);if(!r.ok)throw new Error(r.code||'Unable to disable MFA.');setMessage('MFA disabled. A fresh sign-in is required.');setTimeout(()=>{if(onLogout)onLogout();else window.location.replace('https://buddyfleets.in/login');},900);}catch(e){setMessage(e.message);}finally{setBusy(false)}};

  return <>
    <PageHeader title="Profile & Security" subtitle="Personal profile, password, authenticator MFA and secure session controls."/>
    {message?<div className="bf-note" style={{marginBottom:14}}>{message}</div>:null}
    <div className="bf-grid bf-grid-2">
      <div className="bf-card"><div className="bf-card-head"><h3><UserRound size={15}/> Profile</h3></div><div className="bf-card-body">
        <div className="bf-field" style={{marginBottom:16}}><label>Profile Photo</label><PhotoField demo={demo} ownerType="user" ownerId={currentUser?.id} photoUrl={profile.photo_url} onUploaded={async()=>{if(!demo)await refresh()}}/></div>
        <div className="bf-form-grid">{[['full_name','Full Name'],['mobile','Mobile'],['alternate_mobile','Alternate Mobile'],['designation','Designation'],['address','Address'],['emergency_contact','Emergency Contact']].map(([k,l])=><div className={`bf-field ${k==='address'?'full':''}`} key={k}><label>{l}</label><input className="bf-input" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}</div>
        <div style={{marginTop:15}}><button className="bf-btn bf-btn-primary" onClick={save} disabled={busy}>{busy?'Saving…':'Save Profile'}</button></div>
      </div></div>

      <div className="bf-card"><div className="bf-card-head"><h3><ShieldCheck size={15}/> Login & Security</h3></div><div className="bf-card-body">
        <div className="bf-list">
          <div className="bf-list-row"><span>Password</span><button className="bf-btn bf-btn-secondary" onClick={changePassword}><KeyRound size={13}/> Change</button></div>
          <div className="bf-list-row"><span>Authenticator App</span><span className={`bf-status ${mfa?.mfaEnabled?'active':'pending'}`}>{mfa?.mfaEnabled?'Enabled':'Not enabled'}</span></div>
          {!mfa?.mfaEnabled&&!enroll?<div className="bf-list-row"><span>Two-factor setup</span><button className="bf-btn bf-btn-primary" onClick={beginMfa} disabled={busy||demo}><Smartphone size={13}/> Set up Authenticator</button></div>:null}
          {mfa?.mfaEnabled?<div className="bf-list-row"><span>{mfa.verifiedFactors?.[0]?.friendlyName||'Verified Authenticator'}</span><button className="bf-btn bf-btn-danger" onClick={disable} disabled={busy||demo}><X size={13}/> Disable MFA</button></div>:null}
          <div className="bf-list-row"><span>Other active sessions</span><button className="bf-btn bf-btn-danger" onClick={revoke}><LogOut size={13}/> Sign Out Others</button></div>
        </div>

        {enroll?<div className="bf-mfa-enroll">
          <div className="bf-mfa-qr">{enroll.qrCode?<img src={enroll.qrCode} alt="Buddy Fleets MFA QR"/>:<div className="bf-muted">QR unavailable</div>}</div>
          <div className="bf-mfa-setup"><div className="bf-field"><label>Manual Setup Key</label><div className="bf-code-box">{enroll.secret||'—'}</div></div><div className="bf-field" style={{marginTop:10}}><label>6-digit Code</label><input className="bf-input" inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}/></div><div style={{display:'flex',gap:8,marginTop:10}}><button className="bf-btn bf-btn-primary" onClick={verifyMfa} disabled={busy||code.length!==6}><ShieldCheck size={13}/> Verify & Enable</button><button className="bf-btn bf-btn-ghost" onClick={()=>{setEnroll(null);setCode('')}}>Cancel</button></div></div>
        </div>:null}
        <div className="bf-note" style={{marginTop:14}}>{demo?'MFA changes are intentionally disabled in the shared demo account.':'MFA changes use the authenticated Buddy Fleets session and force a fresh sign-in after enable/disable.'}</div>
      </div></div>
    </div>
    <div className="bf-card" style={{marginTop:16}}><div className="bf-card-head"><h3>Session History</h3></div><DataTable columns={[{key:'created_at',label:'Started'},{key:'last_seen_at',label:'Last Seen'},{key:'ip_address',label:'IP'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}]} rows={data?.sessions||[]}/></div>
  </>;
}
