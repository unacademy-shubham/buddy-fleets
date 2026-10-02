import React,{useEffect,useState} from 'react';
import {KeyRound,LogOut,ShieldCheck,Smartphone,UserRound,X} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import PhotoField from '../components/PhotoField';
import DataTable from '../components/DataTable';
import {useClientPortal} from '../ClientPortalContext';
import {beginClientMfaEnrollment,disableClientMfa,getClientMfaStatus,verifyClientMfaEnrollment} from '../services/clientSecurityApi';
import '../styles/profileSecurity.css';

export default function ProfileSecurityPage(){
  const {currentUser,data,demo,apiAction,refresh}=useClientPortal();
  const profile=data?.selfProfile||{};
  const [form,setForm]=useState({full_name:profile.full_name||currentUser?.name||'',mobile:profile.mobile||currentUser?.mobile||'',alternate_mobile:profile.alternate_mobile||'',designation:profile.designation||'',address:profile.address||'',emergency_contact:profile.emergency_contact||''});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [mfa,setMfa]=useState(null);
  const [enroll,setEnroll]=useState(null);
  const [code,setCode]=useState('');
  const [passwordModal,setPasswordModal]=useState(false);
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [passwordError,setPasswordError]=useState('');
  const [disableModal,setDisableModal]=useState(false);
  const [disableCode,setDisableCode]=useState('');
  const [securityNotice,setSecurityNotice]=useState(null);

  useEffect(()=>{setForm({full_name:profile.full_name||currentUser?.name||'',mobile:profile.mobile||currentUser?.mobile||'',alternate_mobile:profile.alternate_mobile||'',designation:profile.designation||'',address:profile.address||'',emergency_contact:profile.emergency_contact||''});},[profile.full_name,profile.mobile,profile.alternate_mobile,profile.designation,profile.address,profile.emergency_contact,currentUser?.name,currentUser?.mobile]);
  useEffect(()=>{if(demo){setMfa({mfaEnabled:false,verifiedFactors:[]});return;}let live=true;getClientMfaStatus().then(r=>{if(live&&r.ok)setMfa(r)});return()=>{live=false};},[demo]);

  const passwordRules={
    length:newPassword.length>=8&&newPassword.length<=64,
    uppercase:/[A-Z]/.test(newPassword),
    lowercase:/[a-z]/.test(newPassword),
    number:/\d/.test(newPassword),
    symbol:/[^A-Za-z0-9\s]/.test(newPassword),
  };
  const isPasswordValid=passwordRules.length&&passwordRules.uppercase&&passwordRules.lowercase&&passwordRules.number&&passwordRules.symbol;

  const save=async()=>{setBusy(true);setMessage('');try{await apiAction('save_profile',form);await refresh();setMessage(demo?'Demo profile saved in the persisted demo workspace.':'Profile saved.');}catch(e){setMessage(e?.message||'Unable to save profile.');}finally{setBusy(false)}};

  const openPasswordModal=()=>{if(demo){setMessage('Demo password change is simulated and does not alter the demo login.');return;}setCurrentPassword('');setNewPassword('');setConfirmPassword('');setPasswordError('');setPasswordModal(true);};

  const submitPassword=async()=>{
    if(busy)return;
    if(!currentPassword){setPasswordError('Please enter your current password.');return;}
    if(!isPasswordValid){setPasswordError('Password must be 8–64 characters and include at least one uppercase letter, one lowercase letter, one number and one special character.');return;}
    if(newPassword!==confirmPassword){setPasswordError('New password and confirmation password do not match.');return;}
    if(currentPassword===newPassword){setPasswordError('New password must be different from your current password.');return;}
    setBusy(true);setPasswordError('');
    try{
      await apiAction('change_password',{current_password:currentPassword,new_password:newPassword});
      setPasswordModal(false);setCurrentPassword('');setNewPassword('');setConfirmPassword('');
      setMessage('Password updated successfully. Other active sessions were revoked.');
      setSecurityNotice({title:'Password updated',text:'Your password has been changed successfully. Your current Buddy Fleets session remains active.'});
    }catch(e){
      const code=String(e?.code||e?.message||'');
      setPasswordError(code==='CURRENT_PASSWORD_INVALID'?'Current password is incorrect.':code==='INVALID_PASSWORD'?'New password does not meet the required password policy.':e?.message||'Unable to update password.');
    }finally{setBusy(false)}
  };

  const revoke=async()=>{if(demo){setMessage('Demo session revocation simulated.');return;}setBusy(true);try{await apiAction('revoke_other_sessions',{});setMessage('Other active Buddy Fleets sessions revoked.');}catch(e){setMessage(e?.message||'Unable to revoke other sessions.');}finally{setBusy(false)}};

  const beginMfa=async()=>{if(demo){setMessage('Authenticator enrollment is disabled inside the shared demo workspace.');return;}setBusy(true);setMessage('');try{const r=await beginClientMfaEnrollment();if(!r.ok)throw new Error(r.code||'Unable to start MFA enrollment.');setEnroll(r);setCode('');setMessage('Scan the QR code in your authenticator app, then enter the 6-digit code.');}catch(e){setMessage(e.message);}finally{setBusy(false)}};

  const verifyMfa=async()=>{
    if(!enroll||code.length!==6||busy)return;
    setBusy(true);setMessage('');
    try{
      const r=await verifyClientMfaEnrollment(enroll.factorId,enroll.challengeId,code);
      if(!r.ok)throw new Error(r.code||'MFA verification failed.');
      const status=await getClientMfaStatus();
      if(status?.ok)setMfa(status);
      setEnroll(null);setCode('');
      setMessage('MFA enabled successfully.');
      setSecurityNotice({title:'Security upgraded',text:'Authenticator MFA is now enabled on your Buddy Fleets account. Your current session remains active.'});
    }catch(e){setMessage(e?.message||'MFA verification failed.');}
    finally{setBusy(false)}
  };

  const openDisableModal=()=>{if(demo)return;setDisableCode('');setMessage('');setDisableModal(true);};

  const submitDisable=async()=>{
    if(busy)return;
    const factorId=mfa?.verifiedFactors?.[0]?.id;
    if(!factorId)return;
    const otp=disableCode.replace(/\D/g,'').slice(0,6);
    if(otp.length!==6){setMessage('Enter the current 6-digit authenticator code.');return;}
    setBusy(true);setMessage('');
    try{
      const r=await disableClientMfa(factorId,otp);
      if(!r.ok)throw new Error(r.code||'Unable to disable MFA.');
      const status=await getClientMfaStatus();
      if(status?.ok)setMfa(status);
      setDisableModal(false);setDisableCode('');
      setMessage('MFA disabled successfully.');
      setSecurityNotice({title:'MFA disabled',text:'Authenticator MFA has been disabled. Your current Buddy Fleets session remains active.'});
    }catch(e){setMessage(e?.message||'Unable to disable MFA.');}
    finally{setBusy(false)}
  };

  return <>
    <PageHeader title="Profile & Security" subtitle="Personal profile, password, authenticator MFA and secure session controls."/>
    {message&&!disableModal?<div className="bf-note" style={{marginBottom:14}}>{message}</div>:null}
    <div className="bf-grid bf-grid-2">
      <div className="bf-card"><div className="bf-card-head"><h3><UserRound size={15}/> Profile</h3></div><div className="bf-card-body">
        <div className="bf-field" style={{marginBottom:16}}><label>Profile Photo</label><PhotoField demo={demo} ownerType="user" ownerId={currentUser?.id} photoUrl={profile.photo_url} onUploaded={async()=>{if(!demo)await refresh()}}/></div>
        <div className="bf-form-grid">{[['full_name','Full Name'],['mobile','Mobile'],['alternate_mobile','Alternate Mobile'],['designation','Designation'],['address','Address'],['emergency_contact','Emergency Contact']].map(([k,l])=><div className={`bf-field ${k==='address'?'full':''}`} key={k}><label>{l}</label><input className="bf-input" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}</div>
        <div style={{marginTop:15}}><button className="bf-btn bf-btn-primary" onClick={save} disabled={busy}>{busy?'Saving…':'Save Profile'}</button></div>
      </div></div>

      <div className="bf-card"><div className="bf-card-head"><h3><ShieldCheck size={15}/> Login & Security</h3></div><div className="bf-card-body">
        <div className="bf-list">
          <div className="bf-list-row"><span>Password</span><button className="bf-btn bf-btn-secondary" onClick={openPasswordModal}><KeyRound size={13}/> Change</button></div>
          <div className="bf-list-row"><span>Authenticator App</span><span className={`bf-status ${mfa?.mfaEnabled?'active':'pending'}`}>{mfa?.mfaEnabled?'Enabled':'Not enabled'}</span></div>
          {!mfa?.mfaEnabled&&!enroll?<div className="bf-list-row"><span>Two-factor setup</span><button className="bf-btn bf-btn-primary" onClick={beginMfa} disabled={busy||demo}><Smartphone size={13}/> Set up Authenticator</button></div>:null}
          {mfa?.mfaEnabled?<div className="bf-list-row"><span>{mfa.verifiedFactors?.[0]?.friendlyName||'Verified Authenticator'}</span><button className="bf-btn bf-btn-danger" onClick={openDisableModal} disabled={busy||demo}><X size={13}/> Disable MFA</button></div>:null}
          <div className="bf-list-row"><span>Other active sessions</span><button className="bf-btn bf-btn-danger" onClick={revoke} disabled={busy}><LogOut size={13}/> Sign Out Others</button></div>
        </div>

        {enroll?<div className="bf-mfa-enroll">
          <div className="bf-mfa-qr">{enroll.qrCode?<img src={enroll.qrCode} alt="Buddy Fleets MFA QR"/>:<div className="bf-muted">QR unavailable</div>}</div>
          <div className="bf-mfa-setup"><div className="bf-field"><label>Manual Setup Key</label><div className="bf-code-box">{enroll.secret||'—'}</div></div><div className="bf-field" style={{marginTop:10}}><label>6-digit Code</label><input className="bf-input" inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}/></div><div style={{display:'flex',gap:8,marginTop:10}}><button className="bf-btn bf-btn-primary" onClick={verifyMfa} disabled={busy||code.length!==6}><ShieldCheck size={13}/> Verify & Enable</button><button className="bf-btn bf-btn-ghost" onClick={()=>{setEnroll(null);setCode('')}} disabled={busy}>Cancel</button></div></div>
        </div>:null}
        <div className="bf-note" style={{marginTop:14}}>{demo?'MFA changes are intentionally disabled in the shared demo account.':'MFA changes are applied immediately. Your current session stays active after enable or disable.'}</div>
      </div></div>
    </div>
    <div className="bf-card" style={{marginTop:16}}><div className="bf-card-head"><h3>Session History</h3></div><DataTable columns={[{key:'created_at',label:'Started'},{key:'last_seen_at',label:'Last Seen'},{key:'ip_address',label:'IP'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}]} rows={data?.sessions||[]}/></div>

    {passwordModal?<div className="bf-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setPasswordModal(false);}}>
      <div className="bf-modal bf-password-modal" role="dialog" aria-modal="true" aria-labelledby="bf-change-password-title">
        <div className="bf-modal-head">
          <div><h3 id="bf-change-password-title">Change Password</h3><span className="bf-modal-subtitle">Update your Buddy Fleets login password securely.</span></div>
          <button className="bf-modal-close" type="button" onClick={()=>!busy&&setPasswordModal(false)} aria-label="Close"><X size={17}/></button>
        </div>
        <div className="bf-modal-body">
          {passwordError?<div className="bf-modal-error">{passwordError}</div>:null}
          <div className="bf-password-fields">
            <div className="bf-field"><label>Current Password</label><input className="bf-input" type="password" autoComplete="current-password" value={currentPassword} onChange={e=>{setCurrentPassword(e.target.value);setPasswordError('')}} placeholder="Enter current password"/></div>
            <div className="bf-field"><label>New Password</label><input className="bf-input" type="password" autoComplete="new-password" value={newPassword} onChange={e=>{setNewPassword(e.target.value);setPasswordError('')}} placeholder="Create a strong password"/></div>
            <div className="bf-field"><label>Confirm New Password</label><input className="bf-input" type="password" autoComplete="new-password" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);setPasswordError('')}} placeholder="Re-enter new password"/></div>
          </div>
          <div className="bf-password-policy">
            <div className="bf-password-policy-title">Password requirements</div>
            <div className={passwordRules.length?'valid':''}><span>{passwordRules.length?'✓':'○'}</span> 8–64 characters</div>
            <div className={passwordRules.uppercase?'valid':''}><span>{passwordRules.uppercase?'✓':'○'}</span> At least one uppercase letter</div>
            <div className={passwordRules.lowercase?'valid':''}><span>{passwordRules.lowercase?'✓':'○'}</span> At least one lowercase letter</div>
            <div className={passwordRules.number?'valid':''}><span>{passwordRules.number?'✓':'○'}</span> At least one number</div>
            <div className={passwordRules.symbol?'valid':''}><span>{passwordRules.symbol?'✓':'○'}</span> At least one special character</div>
          </div>
          <div className={`bf-password-match ${confirmPassword&&newPassword!==confirmPassword?'invalid':'valid'}`}>{confirmPassword ? (newPassword===confirmPassword ? '✓ Passwords match' : 'Passwords do not match') : 'Enter the password again to confirm it.'}</div>
        </div>
        <div className="bf-modal-footer">
          <button className="bf-btn bf-btn-ghost" type="button" onClick={()=>!busy&&setPasswordModal(false)} disabled={busy}>Cancel</button>
          <button className="bf-btn bf-btn-primary" type="button" onClick={submitPassword} disabled={busy||!currentPassword||!isPasswordValid||!confirmPassword}>{busy?'Updating…':'Update Password'}</button>
        </div>
      </div>
    </div>:null}

    {disableModal?<div className="bf-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setDisableModal(false);}}>
      <div className="bf-modal bf-security-modal" role="dialog" aria-modal="true" aria-labelledby="bf-disable-mfa-title">
        <div className="bf-modal-head">
          <div><h3 id="bf-disable-mfa-title">Disable Authenticator MFA</h3><span className="bf-modal-subtitle">Confirm this security change with your current authenticator code.</span></div>
          <button className="bf-modal-close" type="button" onClick={()=>!busy&&setDisableModal(false)} aria-label="Close"><X size={17}/></button>
        </div>
        <div className="bf-modal-body">
          <div className="bf-security-callout"><ShieldCheck size={20}/><div><strong>Verification required</strong><span>Open Google Authenticator or your authenticator app and enter the current 6-digit code.</span></div></div>
          <div className="bf-field" style={{marginTop:16}}><label>Authenticator Code</label><input className="bf-input bf-otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={disableCode} onChange={e=>{setDisableCode(e.target.value.replace(/\D/g,'').slice(0,6));setMessage('')}} placeholder="000000"/></div>
          {message?<div className="bf-modal-error" style={{marginTop:12}}>{message}</div>:null}
        </div>
        <div className="bf-modal-footer">
          <button className="bf-btn bf-btn-ghost" type="button" onClick={()=>!busy&&setDisableModal(false)} disabled={busy}>Cancel</button>
          <button className="bf-btn bf-btn-danger" type="button" onClick={submitDisable} disabled={busy||disableCode.length!==6}>{busy?'Disabling…':'Disable MFA'}</button>
        </div>
      </div>
    </div>:null}

    {securityNotice?<div className="bf-modal-backdrop" role="presentation">
      <div className="bf-modal bf-security-modal bf-success-modal" role="dialog" aria-modal="true" aria-labelledby="bf-security-notice-title">
        <div className="bf-modal-body">
          <div className="bf-success-icon"><ShieldCheck size={25}/></div>
          <h3 id="bf-security-notice-title">{securityNotice.title}</h3>
          <p>{securityNotice.text}</p>
          <button className="bf-btn bf-btn-primary" type="button" onClick={()=>setSecurityNotice(null)}>Continue</button>
        </div>
      </div>
    </div>:null}
  </>;
}
