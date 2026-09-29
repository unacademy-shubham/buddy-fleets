import React,{useMemo,useState} from 'react';
import { Activity, Archive, Building2, ClipboardCheck, FileText, Pencil, Plus, Route, Truck, UsersRound } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { useClientPortal } from '../ClientPortalContext';
import { findNavigationNodeByRoute } from '../config/portalNavigation';
import { getModuleByRoute } from '../config/moduleCatalog';
import { getFleetPack } from '../config/fleetPacks';
import { getOperationalSchema } from '../config/operationalSchemas';

function initialForm(schema, selectedSiteId){
  const out={record_type:schema.recordType,status:schema.statusOptions?.[0]||'active',quantity_unit:schema.quantityUnit||''};
  for(const field of schema.fields||[]) if(out[field.key]===undefined) out[field.key]=field.key==='site_id'&&selectedSiteId!=='all'?selectedSiteId:'';
  return out;
}
function nice(value){return String(value??'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());}

export default function FleetWorkspacePage({ route }) {
  const { company, data, sites = [], selectedSiteId, demo, userAccess, apiAction, refresh } = useClientPortal();
  const packKey = company?.fleetPack || null;
  const pack = getFleetPack(packKey);
  const node = packKey ? findNavigationNodeByRoute(packKey, route) : null;
  const module = getModuleByRoute(route);
  const title = node?.label || module?.label || 'Fleet Workspace';
  const moduleKey = node?.moduleKey || module?.key || '';
  const schema=useMemo(()=>getOperationalSchema(moduleKey,title),[moduleKey,title]);
  const permissions=userAccess?.modulePermissions?.[moduleKey]||{};
  const canCreate=permissions.create||permissions.manage;
  const canEdit=permissions.edit||permissions.manage;
  const canDelete=permissions.delete||permissions.manage;
  const rawRows = data?.moduleRows?.[moduleKey] || [];
  const rows = selectedSiteId === 'all' ? rawRows : rawRows.filter(row => !row.site_id || row.site_id === selectedSiteId);
  const siteCount = selectedSiteId === 'all' ? sites.length : Math.min(1, sites.length);
  const vehicles = (data?.vehicles || []).filter(row => selectedSiteId === 'all' || !row.home_site_id || row.home_site_id === selectedSiteId);
  const drivers = (data?.drivers || []).filter(row => selectedSiteId === 'all' || !row.primary_site_id || row.primary_site_id === selectedSiteId);
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState(null);
  const [busy,setBusy]=useState(false);
  const [form,setForm]=useState(()=>initialForm(schema,selectedSiteId));

  const beginCreate=()=>{setEditing(null);setForm(initialForm(schema,selectedSiteId));setOpen(true);};
  const beginEdit=(row)=>{setEditing(row);const next=initialForm(schema,selectedSiteId);for(const key of Object.keys(next)) if(row[key]!==undefined&&row[key]!==null) next[key]=row[key];next.id=row.id;setForm(next);setOpen(true);};
  const save=async()=>{
    setBusy(true);
    try{
      const payload={...form,module_key:moduleKey,record_type:schema.recordType,quantity:form.quantity===''?null:Number(form.quantity),amount:form.amount===''?null:Number(form.amount)};
      await apiAction(editing?'update_operational_record':'create_operational_record',payload);
      await refresh();
      setOpen(false);setEditing(null);
    } finally {setBusy(false);}
  };
  const archive=async(row)=>{
    if(!window.confirm(`Archive this ${title} record?`))return;
    setBusy(true);
    try{await apiAction('archive_operational_record',{id:row.id,module_key:moduleKey});await refresh();}finally{setBusy(false);}
  };

  const tableColumns=useMemo(()=>{
    const preferred=['reference_no','title','party_name','vehicle_number','driver_name','origin','destination','quantity','quantity_unit','amount','scheduled_at','status'];
    const available=preferred.filter(key=>rows.some(row=>row[key]!==undefined&&row[key]!==null&&row[key]!==''));
    const labelMap=Object.fromEntries((schema.fields||[]).map(f=>[f.key,f.label]));
    const cols=available.slice(0,8).map(key=>({
      key,
      label:labelMap[key]||nice(key),
      render:key==='status'?(v=><span className={`bf-status ${v}`}>{nice(v||'—')}</span>):key==='amount'?(v=>v===null||v===undefined?'—':`₹${Number(v||0).toLocaleString('en-IN')}`):key.endsWith('_at')?(v=>v?new Date(v).toLocaleString('en-IN'):'—'):undefined,
    }));
    if((canEdit||canDelete)&&rows.length)cols.push({key:'_actions',label:'Actions',render:(_,row)=><div style={{display:'flex',gap:6}}>{canEdit?<button className="bf-btn bf-btn-ghost" onClick={(e)=>{e.stopPropagation();beginEdit(row)}}><Pencil size={13}/></button>:null}{canDelete?<button className="bf-btn bf-btn-danger" onClick={(e)=>{e.stopPropagation();archive(row)}}><Archive size={13}/></button>:null}</div>});
    return cols;
  },[rows,schema.fields,canEdit,canDelete]);

  return <>
    <PageHeader title={title} subtitle={`${pack?.name || 'Fleet'} • ${selectedSiteId==='all'?'All Authorized Sites':'Selected Site'} • ${demo?'Persisted Demo Data':'Live Company Data'}`} actions={canCreate?<button className="bf-btn bf-btn-primary" onClick={beginCreate}><Plus size={15}/> Add Record</button>:null}/>
    <div className="bf-grid bf-grid-4" style={{marginBottom:16}}>
      <KpiCard title="Workspace Records" value={rows.length} icon={FileText}/>
      <KpiCard title="Vehicles in Scope" value={vehicles.length} icon={Truck} tone="blue"/>
      <KpiCard title="Drivers in Scope" value={drivers.length} icon={UsersRound}/>
      <KpiCard title="Sites in Scope" value={siteCount} icon={Building2} tone="green"/>
    </div>
    {rows.length ? <div className="bf-card"><div className="bf-card-head"><h3>{title} Register</h3></div><DataTable columns={tableColumns} rows={rows}/></div> : <div className="bf-grid bf-grid-2">
      <div className="bf-card bf-card-body">
        <div className="bf-section-title">{demo ? 'Persisted demo workspace' : 'Operational workspace ready'}</div>
        <p className="bf-muted" style={{fontSize:11,lineHeight:1.7,margin:0}}>
          {canCreate ? `No ${title.toLowerCase()} records exist yet. Use “Add Record” to create the first backend-connected entry.` : 'No records are visible in your current role/site scope. This module remains permission controlled.'}
        </p>
      </div>
      <div className="bf-card bf-card-body">
        <div className="bf-section-title">Shared control model</div>
        <div className="bf-list">
          <div className="bf-list-row"><span><Route size={14}/> Site-aware operations</span><strong>{selectedSiteId==='all'?'All authorized sites':'Selected site'}</strong></div>
          <div className="bf-list-row"><span><ClipboardCheck size={14}/> Module permission</span><strong>{permissions.edit||permissions.create?'Operational':'Read only'}</strong></div>
          <div className="bf-list-row"><span><Activity size={14}/> Persistence</span><strong>{demo?'Demo snapshot backend':'Supabase tenant data'}</strong></div>
        </div>
      </div>
    </div>}

    <Modal open={open} title={`${editing?'Edit':'Add'} ${schema.title}`} width="900px" onClose={()=>!busy&&setOpen(false)} footer={<><button className="bf-btn bf-btn-ghost" disabled={busy} onClick={()=>setOpen(false)}>Cancel</button><button className="bf-btn bf-btn-primary" disabled={busy} onClick={save}>{busy?'Saving…':editing?'Save Changes':'Create Record'}</button></>}>
      <div className="bf-form-grid">
        {(schema.fields||[]).map(field=>{
          const value=form[field.key]??'';
          const set=(next)=>setForm(prev=>({...prev,[field.key]:next}));
          if(field.type==='site')return <div className="bf-field" key={field.key}><label>{field.label}</label><select className="bf-select" value={value} onChange={e=>set(e.target.value)}><option value="">No specific site</option>{sites.map(site=><option key={site.id} value={site.id}>{site.name}</option>)}</select></div>;
          if(field.type==='select')return <div className="bf-field" key={field.key}><label>{field.label}</label><select className="bf-select" value={value} onChange={e=>set(e.target.value)}>{(field.options||[]).map(option=><option key={option} value={option}>{nice(option)}</option>)}</select></div>;
          if(field.type==='textarea')return <div className={`bf-field ${field.full?'full':''}`} key={field.key}><label>{field.label}</label><textarea className="bf-textarea" value={value} onChange={e=>set(e.target.value)} /></div>;
          return <div className={`bf-field ${field.full?'full':''}`} key={field.key}><label>{field.label}</label><input className="bf-input" type={field.type||'text'} placeholder={field.placeholder||''} value={value} onChange={e=>set(e.target.value)}/></div>;
        })}
      </div>
    </Modal>
  </>;
}
