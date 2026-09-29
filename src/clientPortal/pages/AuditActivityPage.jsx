import React,{useMemo} from 'react';
import {Download,History} from 'lucide-react';
import * as XLSX from 'xlsx';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import {useClientPortal} from '../ClientPortalContext';

function formatDate(value){if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?String(value):d.toLocaleString('en-IN');}
export default function AuditActivityPage(){
  const {data,sites=[],selectedSiteId,demo}=useClientPortal();
  const siteMap=useMemo(()=>new Map(sites.map(s=>[s.id,s.name])),[sites]);
  const rows=useMemo(()=> (data?.audit||[]).filter(r=>selectedSiteId==='all'||!r.site_id||r.site_id===selectedSiteId).map(r=>({
    ...r,site_name:r.site_id?siteMap.get(r.site_id)||'—':'All / System',module:r.module_key||'—',action:String(r.action_type||'—').replaceAll('_',' '),when:r.created_at,
  })),[data?.audit,selectedSiteId,siteMap]);
  const exportExcel=()=>{const clean=rows.map(r=>({Date:formatDate(r.when),Site:r.site_name,Module:r.module,Action:r.action,Entity:r.entity_type||'',Description:r.description||''}));const ws=XLSX.utils.json_to_sheet(clean);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Audit');XLSX.writeFile(wb,'Buddy_Fleets_Audit_Activity.xlsx');};
  return <>
    <PageHeader title="Audit & Activity" subtitle={demo?'Persisted demo workspace activity.':'Server-recorded company activity scoped to your authorized sites.'} actions={<button className="bf-btn bf-btn-primary" onClick={exportExcel} disabled={!rows.length}><Download size={14}/> Export</button>}/>
    <div className="bf-card"><div className="bf-card-head"><h3><History size={15}/> Recent Activity</h3><span className="bf-muted" style={{fontSize:10}}>{rows.length} record(s)</span></div><DataTable columns={[{key:'when',label:'Date / Time',render:formatDate},{key:'site_name',label:'Site'},{key:'module',label:'Module'},{key:'action',label:'Action'},{key:'entity_type',label:'Entity'},{key:'description',label:'Description'}]} rows={rows}/></div>
  </>;
}
