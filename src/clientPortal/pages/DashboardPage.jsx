import React, { useMemo } from 'react';
import {
  AlertTriangle, BusFront, CalendarCheck2, Clock3, IndianRupee, PackageCheck, Route,
  Scale, Truck, UsersRound, Wrench, Building2, FileText, Boxes, GraduationCap,
  Gauge, UserCheck
} from 'lucide-react';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useClientPortal } from '../ClientPortalContext';
import { getFleetPack } from '../config/fleetPacks';

const siteName = (sites, id) => sites.find((s)=>s.id===id)?.name || '—';
const ICONS = { Truck, UsersRound, Building2, Route, FileText, Boxes, Container: Boxes, GraduationCap, Gauge, UserCheck, IndianRupee, PackageCheck, Clock3, Scale, CalendarCheck2, BusFront, AlertTriangle, Wrench };

function GenericFleetDashboard({ company, data, sites, selectedSiteId }) {
  const pack = getFleetPack(company?.fleetPack);
  const filter = (rows=[]) => selectedSiteId === 'all' ? rows : rows.filter((row)=>(row.site_id || row.home_site_id || row.primary_site_id) === selectedSiteId);
  const vehicles = filter(data?.vehicles || []);
  const drivers = filter(data?.drivers || []);
  const expenses = filter(data?.expenses || []);
  const moduleRows = data?.moduleRows || {};
  const rowsFor = (key) => filter(moduleRows[key] || []);
  const count = (key, statuses=null) => {
    const rows = rowsFor(key);
    if (!statuses?.length) return rows.length;
    return rows.filter((row)=>statuses.includes(String(row.status||'').toLowerCase())).length;
  };
  const total = (key, field='quantity') => rowsFor(key).reduce((sum,row)=>sum+Number(row?.[field]||0),0);
  const amount = (key) => rowsFor(key).reduce((sum,row)=>sum+Number(row?.amount||0),0);
  const money = (value) => `₹${Number(value||0).toLocaleString('en-IN',{maximumFractionDigits:2})}`;
  const common = {
    vehicles:vehicles.length,
    drivers:drivers.filter(d=>!['inactive','blocked','disabled'].includes(String(d.status||'').toLowerCase())).length,
    sites:selectedSiteId==='all' ? sites.length : Math.min(1, sites.length),
    expenses:money(expenses.reduce((a,b)=>a+Number(b.amount||0),0)),
  };

  const defaultsByPack = {
    general_transport:[
      {title:'Total Vehicles',value:common.vehicles,icon:'Truck'},
      {title:'Active Drivers',value:common.drivers,icon:'UsersRound'},
      {title:'Active Consignments',value:count('goods_consignment',['booked','load_planned','dispatched','in_transit']),icon:'FileText'},
      {title:'Vehicles on Trip',value:count('trips',['assigned','started','in_transit']),icon:'Route',tone:'blue'},
      {title:'Pending POD',value:count('goods_delivery',['in_transit','arrived','pod_pending']),icon:'PackageCheck',tone:'orange'},
      {title:'Load Plans Open',value:count('goods_load_planning',['draft','ready','assigned','loaded']),icon:'Boxes'},
      {title:'Freight Pending',value:money(amount('goods_freight')),icon:'IndianRupee',tone:'orange'},
      {title:'Authorized Sites',value:common.sites,icon:'Building2'},
    ],
    container:[
      {title:'Total Vehicles',value:common.vehicles,icon:'Truck'},
      {title:'Containers in Movement',value:count('container_movement',['planned','gate_in','loaded','in_transit','at_icd','gate_out']),icon:'Container'},
      {title:'Gate In / Inside',value:count('container_gate',['gate_in','inside']),icon:'Route',tone:'green'},
      {title:'Gate Out',value:count('container_gate',['gate_out','closed']),icon:'Truck',tone:'blue'},
      {title:'Empty Return Pending',value:count('container_empty_return',['pending','scheduled','overdue']),icon:'Boxes',tone:'orange'},
      {title:'Detention Cases',value:count('container_detention',['attention','detention']),icon:'Clock3',tone:'orange'},
      {title:'Port / ICD Jobs',value:count('container_port_ops',['planned','at_port','customs','ready','released']),icon:'Building2'},
      {title:'Recorded Expenses',value:common.expenses,icon:'IndianRupee'},
    ],
    cement_bulker:[
      {title:'Total Bulkers',value:common.vehicles,icon:'Truck'},
      {title:'Placement Required',value:count('bulker_placement',['open','assigned','reported']),icon:'Truck'},
      {title:'Plant Queue',value:count('bulker_queue',['reported','queued','gate_in','loading']),icon:'Building2',tone:'blue'},
      {title:'Loading',value:count('bulker_loading',['waiting','loading']),icon:'Gauge',tone:'orange'},
      {title:'Tonnage Recorded',value:`${(total('bulker_weighbridge')||total('bulker_loading')).toFixed(1)} MT`,icon:'Scale'},
      {title:'Unloading Active',value:count('bulker_unloading',['arrived','unloading']),icon:'Route',tone:'blue'},
      {title:'Detention',value:count('bulker_tat',['detention']),icon:'Clock3',tone:'orange'},
      {title:'Recorded Expenses',value:common.expenses,icon:'IndianRupee'},
    ],
    staff_transport:[
      {title:'Total Vehicles',value:common.vehicles,icon:'Truck'},
      {title:'Active Drivers',value:common.drivers,icon:'UsersRound'},
      {title:'Active Routes',value:count('staff_routes',['active']),icon:'Route'},
      {title:'Active Shifts',value:count('staff_shifts',['active']),icon:'Clock3',tone:'blue'},
      {title:'Vehicles Allocated',value:count('staff_allocation',['planned','assigned','dispatched']),icon:'BusFront',tone:'green'},
      {title:'Rosters',value:count('staff_roster',['draft','published','in_progress']),icon:'CalendarCheck2'},
      {title:'Attendance Runs',value:count('staff_attendance',['scheduled','boarding','completed','exception']),icon:'UserCheck'},
      {title:'Active Contracts',value:count('staff_contracts',['active','renewal_due']),icon:'FileText'},
    ],
    school_transport:[
      {title:'School Buses',value:common.vehicles,icon:'BusFront'},
      {title:'Active Drivers',value:common.drivers,icon:'UsersRound'},
      {title:'Active Routes',value:count('school_routes',['active']),icon:'Route'},
      {title:'Students / Riders',value:count('school_students',['active']),icon:'GraduationCap'},
      {title:'Route Assignments',value:count('school_assignments',['active','pending','changed']),icon:'CalendarCheck2'},
      {title:'Pickup / Drop Runs',value:count('school_pickup_drop',['scheduled','boarded','pickup_complete','drop_complete']),icon:'UserCheck',tone:'green'},
      {title:'Exceptions / Missed',value:count('school_pickup_drop',['missed','exception'])+count('school_attendance',['exception']),icon:'Clock3',tone:'orange'},
      {title:'Inspection Due',value:count('vehicle_inspection',['scheduled','attention','failed']),icon:'AlertTriangle',tone:'orange'},
    ],
  };
  const defaults = defaultsByPack[company?.fleetPack] || [
    { title:'Total Vehicles', value:common.vehicles, icon:'Truck' },
    { title:'Active Drivers', value:common.drivers, icon:'UsersRound' },
    { title:'Authorized Sites', value:common.sites, icon:'Building2' },
    { title:'Recorded Expenses', value:common.expenses, icon:'IndianRupee', tone:'orange' },
  ];
  const metrics = (data?.dashboardMetrics?.length ? data.dashboardMetrics : defaults).slice(0, 8);

  const packTableKeys = {
    general_transport:['goods_consignment','goods_delivery'],
    container:['container_movement','container_empty_return'],
    cement_bulker:['bulker_loading','bulker_unloading'],
    staff_transport:['staff_allocation','staff_attendance'],
    school_transport:['school_pickup_drop','school_students'],
  };
  const liveTables=(packTableKeys[company?.fleetPack]||[]).map((moduleKey)=>({
    title:(moduleKey||'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()),
    columns:[
      {key:'reference_no',label:'Reference'},
      {key:'title',label:'Title'},
      {key:'vehicle_number',label:'Vehicle'},
      {key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{String(v||'—').replaceAll('_',' ')}</span>},
    ],
    rows:rowsFor(moduleKey).slice(0,7),
  }));
  const tables = data?.dashboardTables?.length ? data.dashboardTables : liveTables.filter(table=>table.rows.length);

  return <>
    <PageHeader
      title={`${pack?.shortName || pack?.name || 'Fleet'} Dashboard`}
      subtitle={selectedSiteId==='all' ? 'Live consolidated view across all authorized sites.' : `Live site view: ${siteName(sites, selectedSiteId)}`}
    />
    <div className="bf-grid bf-grid-4">
      {metrics.map((metric, index)=>{
        const Icon = ICONS[metric.icon] || Truck;
        return <KpiCard key={`${metric.title}-${index}`} title={metric.title} value={metric.value} note={metric.note} icon={Icon} tone={metric.tone}/>;
      })}
    </div>
    <div className="bf-grid bf-grid-2" style={{marginTop:16}}>
      {(tables.length ? tables.slice(0,2) : [
        { title:'Fleet Snapshot', columns:[{key:'vehicle_number',label:'Vehicle'},{key:'vehicle_type',label:'Type'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}], rows:vehicles.slice(0,7) },
        { title:'Driver Snapshot', columns:[{key:'full_name',label:'Driver'},{key:'mobile',label:'Mobile'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}], rows:drivers.slice(0,7) },
      ]).map((table, index)=><div className="bf-card" key={`${table.title}-${index}`}><div className="bf-card-head"><h3>{table.title}</h3></div><DataTable columns={(table.columns||[]).map(col=>({...col,render:col.key==='status'&&!col.render?(v=><span className={`bf-status ${v}`}>{v}</span>):col.render}))} rows={table.rows||[]}/></div>)}
    </div>
  </>;
}

export default function DashboardPage() {
  const { company, data, sites = [], selectedSiteId } = useClientPortal();
  const isCement = company?.fleetPack === 'bagged_cement';
  const isTravels = company?.fleetPack === 'travels';
  const filter = (rows=[]) => selectedSiteId === 'all' ? rows : rows.filter((row)=>(row.site_id || row.home_site_id || row.primary_site_id) === selectedSiteId);
  const vehicles = filter(data?.vehicles || []);
  const drivers = filter(data?.drivers || []);
  const bookings = filter(data?.bookings || []);
  const dispatches = filter(data?.dispatches || []);
  const placements = filter(data?.placements || []);
  const expenses = filter(data?.expenses || []);

  const cementStats = useMemo(()=>({
    vehicles: vehicles.length,
    atPlant: vehicles.filter(v=>v.status==='at_plant').length,
    inTransit: vehicles.filter(v=>v.status==='in_transit').length + dispatches.filter(d=>d.status==='in_transit').length,
    delivered: dispatches.filter(d=>d.status==='delivered').length,
    tonnage: dispatches.reduce((a,b)=>a+Number(b.net_weight_mt||0),0),
    pendingPod: dispatches.filter(d=>d.pod_status==='pending').length,
    required: placements.reduce((a,b)=>a+Number(b.required_vehicles||0),0),
    assigned: placements.reduce((a,b)=>a+Number(b.assigned_vehicles||0),0),
    tat: dispatches.length ? dispatches.reduce((a,b)=>a+Number(b.turnaround_hours||0),0)/dispatches.length : 0,
  }),[vehicles,dispatches,placements]);

  const travelStats = useMemo(()=>({
    vehicles: vehicles.length,
    available: vehicles.filter(v=>v.status==='available').length,
    onTrip: vehicles.filter(v=>v.status==='on_trip').length,
    bookings: bookings.length,
    revenue: bookings.reduce((a,b)=>a+Number(b.amount||0),0),
    balance: bookings.reduce((a,b)=>a+Math.max(0,Number(b.amount||0)-Number(b.advance||0)),0),
    drivers: drivers.length,
    expenses: expenses.reduce((a,b)=>a+Number(b.amount||0),0),
  }),[vehicles,bookings,drivers,expenses]);

  if (!isCement && !isTravels) return <GenericFleetDashboard company={company} data={data} sites={sites} selectedSiteId={selectedSiteId}/>;

  return <>
    <PageHeader title="Dashboard" subtitle={selectedSiteId==='all' ? 'Consolidated view across all authorized sites.' : `Site view: ${siteName(sites, selectedSiteId)}`} />
    {isCement ? <>
      <div className="bf-grid bf-grid-4">
        <KpiCard title="Total Vehicles" value={cementStats.vehicles} icon={Truck}/>
        <KpiCard title="Vehicles at Plant" value={cementStats.atPlant} icon={Clock3} tone="orange"/>
        <KpiCard title="In Transit" value={cementStats.inTransit} icon={Route} tone="blue"/>
        <KpiCard title="Delivered" value={cementStats.delivered} icon={PackageCheck} tone="green"/>
        <KpiCard title="Today's Tonnage" value={`${cementStats.tonnage.toFixed(1)} MT`} icon={Scale}/>
        <KpiCard title="Placement" value={`${cementStats.assigned}/${cementStats.required}`} note="Assigned / Required" icon={BusFront} tone="blue"/>
        <KpiCard title="Pending POD" value={cementStats.pendingPod} icon={AlertTriangle} tone="orange"/>
        <KpiCard title="Avg Turnaround" value={`${cementStats.tat.toFixed(1)} hr`} icon={Clock3} tone="green"/>
      </div>
      <div className="bf-grid bf-grid-2" style={{marginTop:16}}>
        <div className="bf-card"><div className="bf-card-head"><h3>Plant Performance</h3></div><DataTable columns={[{key:'name',label:'Plant'},{key:'required',label:'Required'},{key:'assigned',label:'Assigned'},{key:'reported',label:'Reported'},{key:'loaded',label:'Loaded'}]} rows={sites.filter(s=>selectedSiteId==='all'||s.id===selectedSiteId).map(site=>{const p=placements.filter(x=>x.site_id===site.id);return {id:site.id,name:site.name,required:p.reduce((a,b)=>a+Number(b.required_vehicles||0),0),assigned:p.reduce((a,b)=>a+Number(b.assigned_vehicles||0),0),reported:p.reduce((a,b)=>a+Number(b.reported_vehicles||0),0),loaded:p.reduce((a,b)=>a+Number(b.loaded_vehicles||0),0)}})}/></div>
        <div className="bf-card"><div className="bf-card-head"><h3>Recent Dispatches</h3></div><DataTable columns={[{key:'dispatch_no',label:'Dispatch'},{key:'vehicle_number',label:'Vehicle'},{key:'net_weight_mt',label:'MT'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}]} rows={dispatches.slice(0,6)}/></div>
      </div>
    </> : <>
      <div className="bf-grid bf-grid-4">
        <KpiCard title="Total Vehicles" value={travelStats.vehicles} icon={Truck}/>
        <KpiCard title="Available" value={travelStats.available} icon={CalendarCheck2} tone="green"/>
        <KpiCard title="On Trip" value={travelStats.onTrip} icon={Route} tone="blue"/>
        <KpiCard title="Drivers" value={travelStats.drivers} icon={UsersRound}/>
        <KpiCard title="Active Bookings" value={travelStats.bookings} icon={CalendarCheck2}/>
        <KpiCard title="Booked Revenue" value={`₹${travelStats.revenue.toLocaleString('en-IN')}`} icon={IndianRupee} tone="green"/>
        <KpiCard title="Pending Balance" value={`₹${travelStats.balance.toLocaleString('en-IN')}`} icon={IndianRupee} tone="orange"/>
        <KpiCard title="Recorded Expenses" value={`₹${travelStats.expenses.toLocaleString('en-IN')}`} icon={Wrench}/>
      </div>
      <div className="bf-grid bf-grid-2" style={{marginTop:16}}>
        <div className="bf-card"><div className="bf-card-head"><h3>Upcoming Bookings</h3></div><DataTable columns={[{key:'booking_no',label:'Booking'},{key:'customer',label:'Customer'},{key:'vehicle_number',label:'Vehicle'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}]} rows={bookings.slice(0,6)}/></div>
        <div className="bf-card"><div className="bf-card-head"><h3>Vehicle Availability</h3></div><DataTable columns={[{key:'vehicle_number',label:'Vehicle'},{key:'vehicle_type',label:'Type'},{key:'status',label:'Status',render:v=><span className={`bf-status ${v}`}>{v}</span>}]} rows={vehicles.slice(0,7)}/></div>
      </div>
    </>}
  </>;
}
