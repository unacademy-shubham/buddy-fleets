import React,{useMemo,useState} from 'react';
import * as XLSX from 'xlsx';
import {Download,Printer} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import {useClientPortal} from '../ClientPortalContext';
import {getFleetPack} from '../config/fleetPacks';

const REPORT_MODULE_HINTS={
  general_transport:{
    'LR Register':['lr_bilty','goods_consignment'],'Trip Register':['trips'],'Dispatch Register':['dispatch','goods_load_planning'],
    'Consignor/Consignee Business':['goods_consignment'],'Vehicle Revenue':['goods_freight','trips'],'Freight Outstanding':['goods_freight','invoices'],
    'Pending POD':['goods_delivery','epod'],'Route Performance':['route_planning'],'Vehicle Utilization':['trips'],
  },
  container:{
    'Container Movement Register':['container_movement'],'Port/ICD Movement':['container_port_ops'],'Gate In/Out':['container_gate'],
    'Empty Return':['container_empty_return'],'Container Detention':['container_detention'],'Vehicle Utilization':['container_movement','trips'],
    'Freight Settlement':['invoices','party_ledgers'],'Pending POD':['epod','delivery_records'],
  },
  cement_bulker:{
    'Plant Placement':['bulker_placement'],'Bulker Loading':['bulker_loading'],'Tonnage':['bulker_weighbridge','bulker_loading'],
    'Weighbridge':['bulker_weighbridge'],'Unloading':['bulker_unloading'],'Turnaround':['bulker_tat'],'Detention':['bulker_tat'],
    'Vehicle Utilization':['trips','bulker_placement'],'Driver Trips':['trips'],'Plant Comparison':['bulker_loading','bulker_unloading'],
  },
  staff_transport:{
    'Route Register':['staff_routes'],'Shift-wise Trips':['staff_shifts','trips'],'Vehicle Allocation':['staff_allocation'],
    'Driver Duty':['staff_roster','staff_allocation'],'Boarding/Attendance':['staff_attendance'],'Corporate Billing':['staff_contracts','invoices'],
    'Vehicle Utilization':['staff_allocation','trips'],'Route Cost':['staff_routes','expenses'],
  },
  school_transport:{
    'Route & Stop Register':['school_routes'],'Student Route Assignment':['school_assignments'],'Pickup/Drop Register':['school_pickup_drop'],
    'Transport Attendance':['school_attendance'],'Vehicle Allocation':['school_assignments','trips'],'Driver/Attendant Duty':['school_attendants'],
    'Vehicle Utilization':['school_pickup_drop','trips'],'Route Performance':['school_routes','school_attendance'],
  },
};

function niceKey(key){return String(key||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());}
function genericRow(row,moduleKey,siteName){
  const preferred={
    Site:siteName(row.site_id||row.home_site_id||row.primary_site_id),
    Module:niceKey(moduleKey),
    Reference:row.reference_no||row.lr_no||row.plan_no||row.container_no||row.route_code||row.trip_no||row.dispatch_no||row.id||'—',
    Title:row.title||row.route_name||row.shift_name||row.student_name||row.movement_type||row.loading_point||'—',
    Party:row.party_name||row.consignor||row.consignee||row.customer||'—',
    Vehicle:row.vehicle_number||row.vehicle||'—',
    Driver:row.driver_name||row.driver||'—',
    Origin:row.origin||row.from||'—',
    Destination:row.destination||row.to||row.stop||'—',
    Quantity:row.quantity??row.net_mt??row.quantity_mt??row.planned_load??row.students??row.boarded??'',
    Amount:row.amount??'',
    Status:String(row.status||'—').replaceAll('_',' '),
    Scheduled:row.scheduled_at||row.due_date||row.date||'',
  };
  const hasCanonical=Object.values(preferred).some(v=>v!==''&&v!=='—');
  if(hasCanonical)return preferred;
  const out={Module:niceKey(moduleKey)};
  for(const [k,v] of Object.entries(row||{}))if(!['id','company_id','created_at','updated_at','data'].includes(k))out[niceKey(k)]=v;
  return out;
}

export default function ReportsPage(){
  const {company,data,sites=[],selectedSiteId}=useClientPortal();
  const pack=getFleetPack(company?.fleetPack);
  const [report,setReport]=useState(pack?.reports?.[0]||'Fleet Summary');
  const siteName=id=>sites.find(s=>s.id===id)?.name||'—';
  const siteOk=r=>selectedSiteId==='all'||(r.site_id||r.home_site_id||r.primary_site_id)===selectedSiteId;

  const rows=useMemo(()=>{
    const lower=report.toLowerCase();
    if(lower.includes('vehicle')&&['travels','bagged_cement'].includes(company?.fleetPack))return (data?.vehicles||[]).filter(siteOk).map(v=>({Site:siteName(v.home_site_id),Vehicle:v.vehicle_number,Type:v.vehicle_type,Ownership:v.ownership,Status:v.status,Payload:v.payload_mt||'',Seats:v.seating_capacity||''}));
    if(lower.includes('driver')&&['travels','bagged_cement'].includes(company?.fleetPack))return (data?.drivers||[]).filter(siteOk).map(d=>({Site:siteName(d.primary_site_id),Driver:d.full_name,Code:d.driver_code,Mobile:d.mobile,DL:d.dl_number,'DL Expiry':d.dl_expiry,Status:d.status}));
    if(company?.fleetPack==='bagged_cement')return (data?.dispatches||[]).filter(siteOk).map(d=>({Plant:siteName(d.site_id),Dispatch:d.dispatch_no,Vehicle:d.vehicle_number,Dealer:d.dealer,Destination:d.destination,Bags:d.bags,'Net MT':d.net_weight_mt,Status:d.status,POD:d.pod_status,'TAT Hrs':d.turnaround_hours}));
    if(company?.fleetPack==='travels')return (data?.bookings||[]).filter(siteOk).map(b=>({Booking:b.booking_no,Customer:b.customer,Pickup:b.pickup,Drop:b.drop,Vehicle:b.vehicle_number,Driver:b.driver_name,Amount:b.amount,Advance:b.advance,Status:b.status}));

    const moduleRows=data?.moduleRows||{};
    const hints=REPORT_MODULE_HINTS[company?.fleetPack]?.[report]||[];
    const selected=hints.length?hints:Object.keys(moduleRows);
    const generic=selected.flatMap(moduleKey=>(moduleRows[moduleKey]||[]).filter(siteOk).map(row=>genericRow(row,moduleKey,siteName)));
    if(generic.length)return generic;

    if(lower.includes('vehicle'))return (data?.vehicles||[]).filter(siteOk).map(v=>({Site:siteName(v.home_site_id),Vehicle:v.vehicle_number,Type:v.vehicle_type,Ownership:v.ownership,Status:v.status}));
    if(lower.includes('driver')||lower.includes('attendant'))return (data?.drivers||[]).filter(siteOk).map(d=>({Site:siteName(d.primary_site_id),Driver:d.full_name,Code:d.driver_code,Mobile:d.mobile,Status:d.status}));
    return [];
  },[report,data,selectedSiteId,company?.fleetPack,sites]);

  const exportExcel=()=>{const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Report');XLSX.writeFile(wb,`${report.replace(/[^a-z0-9]+/gi,'_')}.xlsx`)};
  const columns=rows.length?Object.keys(rows[0]).map(k=>({key:k,label:k,render:k==='Status'?(v=><span className={`bf-status ${String(v||'').replaceAll(' ','_')}`}>{v}</span>):undefined})):[{key:'empty',label:'Report'}];
  return <>
    <PageHeader title="Reports" subtitle="Backend-connected, site-scoped operational reports with consolidated All Authorized Sites view." actions={<><button className="bf-btn bf-btn-secondary" onClick={()=>window.print()}><Printer size={14}/> Print / PDF</button><button className="bf-btn bf-btn-primary" onClick={exportExcel} disabled={!rows.length}><Download size={14}/> Export Excel</button></>}/>
    <div className="bf-card" style={{marginBottom:16}}><div className="bf-toolbar"><div className="bf-toolbar-left"><label className="bf-field"><span style={{fontSize:9,fontWeight:800}}>REPORT</span><select className="bf-select" value={report} onChange={e=>setReport(e.target.value)}>{(pack?.reports||['Fleet Summary']).map(r=><option key={r}>{r}</option>)}</select></label></div><div className="bf-muted" style={{fontSize:10}}>Rows: {rows.length}</div></div></div>
    <div className="bf-card"><DataTable columns={columns} rows={rows}/></div>
  </>;
}
