import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useClientPortal } from '../ClientPortalContext';

const blank = { name:'', code:'', site_type:'Branch Office', city:'', state:'', address:'', status:'active' };
export default function SitesPage(){
  const { sites=[], demo, mutateDemo, apiAction, refresh }=useClientPortal(); const [open,setOpen]=useState(false); const [form,setForm]=useState(blank); const [busy,setBusy]=useState(false);
  const save=async()=>{setBusy(true); try{ if(demo){mutateDemo('sites',(rows)=>[...rows,{...form,id:`demo-site-${Date.now()}`}]);} else {await apiAction('create_site',form); await refresh();} setOpen(false); setForm(blank);} finally{setBusy(false)}};
  return <><PageHeader title="Sites / Branches" subtitle="Manage plants, branches, offices, depots, yards and workshops." actions={<button className="bf-btn bf-btn-primary" onClick={()=>setOpen(true)}><Plus size={15}/> Add Site</button>}/><div className="bf-card"><DataTable columns={[{key:'code',label:'Code'},{key:'name',label:'Site Name'},{key:'site_type',label:'Type'},{key:'city',label:'City'},{key:'state',label:'State'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}]} rows={sites}/></div><Modal open={open} title="Add Site" onClose={()=>setOpen(false)} footer={<><button className="bf-btn bf-btn-ghost" onClick={()=>setOpen(false)}>Cancel</button><button className="bf-btn bf-btn-primary" disabled={busy||!form.name||!form.code} onClick={save}>{busy?'Saving…':'Save Site'}</button></>}><div className="bf-form-grid">{[['name','Site Name'],['code','Site Code'],['city','City'],['state','State'],['address','Address']].map(([k,l])=><div key={k} className={`bf-field ${k==='address'?'full':''}`}><label>{l}</label><input className="bf-input" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}<div className="bf-field"><label>Site Type</label><select className="bf-select" value={form.site_type} onChange={e=>setForm({...form,site_type:e.target.value})}>{['Head Office','Branch Office','Plant','Depot','Hub','Warehouse','Yard','Workshop','Mine / Quarry','Customer Site','Port / ICD / CFS Office','Parking Yard','Other'].map(v=><option key={v}>{v}</option>)}</select></div></div></Modal></>;
}
