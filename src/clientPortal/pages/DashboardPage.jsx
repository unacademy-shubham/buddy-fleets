import React, { useMemo } from 'react';
import { AlertTriangle, BusFront, CalendarCheck2, Clock3, IndianRupee, PackageCheck, Route, Scale, Truck, UsersRound, Wrench } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useClientPortal } from '../ClientPortalContext';

const siteName = (sites, id) => sites.find((s)=>s.id===id)?.name || '—';

export default function DashboardPage() {
  const { company, data, sites = [], selectedSiteId } = useClientPortal();
  const isCement = company?.fleetPack === 'bagged_cement';
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
