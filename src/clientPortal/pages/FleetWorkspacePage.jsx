import React from 'react';
import { Activity, Building2, ClipboardCheck, FileText, Route, Truck, UsersRound } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import { useClientPortal } from '../ClientPortalContext';
import { findNavigationNodeByRoute } from '../config/portalNavigation';
import { getModuleByRoute } from '../config/moduleCatalog';
import { getFleetPack } from '../config/fleetPacks';

export default function FleetWorkspacePage({ route }) {
  const { company, data, sites = [], selectedSiteId, demo } = useClientPortal();
  const packKey = company?.fleetPack || 'travels';
  const pack = getFleetPack(packKey);
  const node = findNavigationNodeByRoute(packKey, route);
  const module = getModuleByRoute(route);
  const title = node?.label || module?.label || 'Fleet Workspace';
  const moduleKey = node?.moduleKey || module?.key || '';
  const rawRows = data?.moduleRows?.[moduleKey] || [];
  const rows = selectedSiteId === 'all' ? rawRows : rawRows.filter(row => !row.site_id || row.site_id === selectedSiteId);
  const siteCount = selectedSiteId === 'all' ? sites.length : Math.min(1, sites.length);
  const vehicles = (data?.vehicles || []).filter(row => selectedSiteId === 'all' || !row.home_site_id || row.home_site_id === selectedSiteId);
  const drivers = (data?.drivers || []).filter(row => selectedSiteId === 'all' || !row.primary_site_id || row.primary_site_id === selectedSiteId);
  const columns = rows.length ? Object.keys(rows[0]).filter(key=>!['id','site_id'].includes(key)).slice(0,7).map(key=>({
    key,
    label:key.replaceAll('_',' ').replace(/\b\w/g, c=>c.toUpperCase()),
    render:key==='status' ? (v=><span className={`bf-status ${v}`}>{String(v||'—').replaceAll('_',' ')}</span>) : undefined,
  })) : [];

  return <>
    <PageHeader title={title} subtitle={`${pack?.name || 'Fleet'} • ${selectedSiteId==='all'?'All Authorized Sites':'Selected Site'}`} />
    <div className="bf-grid bf-grid-4" style={{marginBottom:16}}>
      <KpiCard title="Workspace Records" value={rows.length} icon={FileText}/>
      <KpiCard title="Vehicles in Scope" value={vehicles.length} icon={Truck} tone="blue"/>
      <KpiCard title="Drivers in Scope" value={drivers.length} icon={UsersRound}/>
      <KpiCard title="Sites in Scope" value={siteCount} icon={Building2} tone="green"/>
    </div>
    {rows.length ? <div className="bf-card"><div className="bf-card-head"><h3>{title} Register</h3></div><DataTable columns={columns} rows={rows}/></div> : <div className="bf-grid bf-grid-2">
      <div className="bf-card bf-card-body">
        <div className="bf-section-title">{demo ? 'Demo workspace' : 'Workspace ready'}</div>
        <p className="bf-muted" style={{fontSize:11,lineHeight:1.7,margin:0}}>
          {demo
            ? 'This module is part of the selected fleet pack. Demo screens use isolated sample data and do not touch a real company tenant.'
            : 'This module is registered in your company portal and follows the same role, site and plan entitlement framework as the rest of Buddy Fleets.'}
        </p>
      </div>
      <div className="bf-card bf-card-body">
        <div className="bf-section-title">Shared control model</div>
        <div className="bf-list">
          <div className="bf-list-row"><span><Route size={14}/> Site-aware operations</span><strong>{selectedSiteId==='all'?'All authorized sites':'Selected site'}</strong></div>
          <div className="bf-list-row"><span><ClipboardCheck size={14}/> Module permission</span><strong>Role controlled</strong></div>
          <div className="bf-list-row"><span><Activity size={14}/> Activity history</span><strong>Audit-ready</strong></div>
        </div>
      </div>
    </div>}
  </>;
}
