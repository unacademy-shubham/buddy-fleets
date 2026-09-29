import React,{useEffect,useState} from 'react';
import {LockKeyhole,Settings2} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {useClientPortal} from '../ClientPortalContext';
import {getFleetPack} from '../config/fleetPacks';

export default function SettingsPage(){
  const {company,settings,demo,apiAction,refresh,runtime}=useClientPortal();
  const pack=getFleetPack(company?.fleetPack||settings?.fleet_pack);
  const [form,setForm]=useState({
    company_display_name:settings?.company_display_name||company?.company_name||'',
    default_scope:settings?.default_scope||'all',
    date_format:settings?.date_format||'DD/MM/YYYY',
    time_format:settings?.time_format||'12h',
  });
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    setForm({
      company_display_name:settings?.company_display_name||company?.company_name||'',
      default_scope:settings?.default_scope||'all',
      date_format:settings?.date_format||'DD/MM/YYYY',
      time_format:settings?.time_format||'12h',
    });
  },[settings,company]);

  const save=async()=>{
    setBusy(true);setMessage('');
    try{
      await apiAction('save_settings',form);
      await refresh();
      setMessage(demo?'Demo preferences saved in the persisted demo workspace.':'Company portal preferences saved.');
    }catch(error){setMessage(error?.message||'Unable to save company settings.');}
    finally{setBusy(false);}
  };

  const resetDemo=async()=>{
    if(!demo)return;
    if(!window.confirm('Reset this fleet demo to the original seeded sample data?'))return;
    setBusy(true);setMessage('');
    try{await apiAction('reset_demo_workspace',{});await refresh();setMessage('Demo workspace reset to the original sample data.');}
    catch(error){setMessage(error?.message||'Unable to reset demo workspace.');}
    finally{setBusy(false);}
  };

  const selection=settings?.fleet_pack_selection_status||runtime?.fleetPackSelectionStatus||'selected';
  return <>
    <PageHeader title="Company Settings" subtitle="Portal preferences. Fleet Pack assignment remains controlled by the Buddy Fleets Developer Control Plane."/>
    {message?<div className="bf-note" style={{marginBottom:14}}>{message}</div>:null}
    <div className="bf-grid bf-grid-2">
      <div className="bf-card">
        <div className="bf-card-head"><h3><Settings2 size={15}/> Portal Preferences</h3></div>
        <div className="bf-card-body">
          <div className="bf-note" style={{marginBottom:15}}>Profile/user and driver photos are the only file uploads enabled in the current storage policy. Vehicle documents, expenses, POD, slips and other operational records remain structured backend data.</div>
          <div className="bf-form-grid">
            <div className="bf-field full"><label>Company Display Name</label><input className="bf-input" value={form.company_display_name} onChange={e=>setForm({...form,company_display_name:e.target.value})}/></div>
            <div className="bf-field"><label>Default Dashboard Scope</label><select className="bf-select" value={form.default_scope} onChange={e=>setForm({...form,default_scope:e.target.value})}><option value="all">All Authorized Sites</option><option value="primary">Primary Site</option></select></div>
            <div className="bf-field"><label>Date Format</label><select className="bf-select" value={form.date_format} onChange={e=>setForm({...form,date_format:e.target.value})}><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></div>
            <div className="bf-field"><label>Time Format</label><select className="bf-select" value={form.time_format} onChange={e=>setForm({...form,time_format:e.target.value})}><option value="12h">12 Hour</option><option value="24h">24 Hour</option></select></div>
          </div>
          <div style={{marginTop:16,display:'flex',gap:8,flexWrap:'wrap'}}><button className="bf-btn bf-btn-primary" onClick={save} disabled={busy}>{busy?'Saving…':'Save Settings'}</button>{demo?<button className="bf-btn bf-btn-danger" onClick={resetDemo} disabled={busy}>Reset Demo Data</button>:null}</div>
        </div>
      </div>

      <div className="bf-card">
        <div className="bf-card-head"><h3><LockKeyhole size={15}/> Fleet Configuration</h3></div>
        <div className="bf-card-body bf-list">
          <div className="bf-list-row"><span>Primary Fleet Pack</span><strong>{pack?.name||'Not selected'}</strong></div>
          <div className="bf-list-row"><span>Selection Status</span><span className={`bf-status ${selection==='selected'?'active':'pending'}`}>{selection}</span></div>
          <div className="bf-list-row"><span>Effective Plan</span><strong>{runtime?.effectivePlanKey||'—'}</strong></div>
          <div className="bf-list-row"><span>Lifecycle Access</span><span className={`bf-status ${runtime?.lifecycleAccess==='full'?'active':'pending'}`}>{runtime?.lifecycleAccess||'—'}</span></div>
          <div className="bf-note" style={{marginTop:14}}>Fleet Pack, enabled packs and company-specific module overrides are assigned from Developer Dashboard. Client users cannot silently switch a company to another business dashboard from this page.</div>
        </div>
      </div>
    </div>
  </>;
}
