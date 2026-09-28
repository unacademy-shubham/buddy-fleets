import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {useLocation,useParams} from 'react-router-dom';
import './clientPortal.css';
import './clientPortalTheme.css';
import {ClientPortalProvider} from './ClientPortalContext';
import ClientPortalShell from './components/ClientPortalShell';
import DashboardPage from './pages/DashboardPage';
import SitesPage from './pages/SitesPage';
import UsersPage from './pages/UsersPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import PartiesPage from './pages/PartiesPage';
import ReportsPage from './pages/ReportsPage';
import TravelsPage from './pages/TravelsPage';
import CementPage from './pages/CementPage';
import FinancePage from './pages/FinancePage';
import SettingsPage from './pages/SettingsPage';
import ProfileSecurityPage from './pages/ProfileSecurityPage';
import SubscriptionPage from './pages/SubscriptionPage';
import FleetWorkspacePage from './pages/FleetWorkspacePage';
import ComingSoonPage from './pages/ComingSoonPage';
import {clientPortalApi} from './services/clientPortalApi';
import {getFleetPack} from './config/fleetPacks';
import {MODULE_CATALOG,defaultPermissionSet,getModuleByRoute} from './config/moduleCatalog';

function routeAfterBase(pathname,basePath){const clean=pathname.replace(basePath,'').replace(/^\/+|\/+$/g,'');return clean||'dashboard';}

function PageForRoute({route,allowedKeys=[]}){
  const routeModule=getModuleByRoute(route);
  const unrestricted = route==='profile-security' || route.startsWith('profile-security/');
  if(!unrestricted&&routeModule&&!allowedKeys.includes(routeModule.key))return <ComingSoonPage title="Access restricted" description="This module is not enabled for your user account. Ask the company owner/admin to update Module Access."/>;

  if(route==='dashboard')return <DashboardPage/>;
  if(route==='sites')return <SitesPage/>;
  if(route==='users')return <UsersPage/>;
  if(route==='vehicles')return <VehiclesPage/>;
  if(route==='drivers')return <DriversPage/>;
  if(route==='parties')return <PartiesPage/>;
  if(route==='reports'||route.startsWith('reports/'))return <ReportsPage/>;
  if(route==='finance'||route==='expenses'||route.startsWith('finance/'))return <FinancePage/>;
  if(route==='settings')return <SettingsPage/>;
  if(route==='profile-security'||route.startsWith('profile-security/'))return <ProfileSecurityPage/>;
  if(route==='subscription'||route.startsWith('subscription/'))return <SubscriptionPage section={route.replace(/^subscription\/?/,'')}/>;

  if(route.startsWith('travels/')){
    const section=route.split('/')[1];
    if(['bookings','enquiries','availability','tours'].includes(section))return <TravelsPage section={section}/>;
  }
  if(route.startsWith('cement/')){
    const section=route.split('/')[1];
    if(['placement','queue','loading','dispatch','delivery','tat'].includes(section))return <CementPage section={section}/>;
  }

  if(routeModule)return <FleetWorkspacePage route={route}/>;
  return <ComingSoonPage title="Module" description="This route is not registered for the current Buddy Fleets fleet pack."/>;
}

function allAccessForPack(packKey){const pack=getFleetPack(packKey);const keys=pack?.recommendedModules||MODULE_CATALOG.map(m=>m.key);return {allSites:true,siteIds:[],moduleKeys:keys,companyModuleKeys:keys,modulePermissions:Object.fromEntries(keys.map(k=>[k,defaultPermissionSet(true)]))};}

export default function ClientPortalApp({currentUser,onLogout}){
  const {companySlug}=useParams();
  const location=useLocation();
  const basePath=`/${companySlug}`;
  const [state,setState]=useState({loading:true,error:'',company:null,settings:null,sites:[],userAccess:null,data:{}});
  const load=useCallback(async()=>{
    setState(s=>({...s,loading:true,error:''}));
    try{
      const res=await clientPortalApi.bootstrap();
      const packKey=res.settings?.fleet_pack||'travels';
      setState({loading:false,error:'',company:{...res.company,fleetPack:packKey},settings:res.settings||{},sites:res.sites||[],userAccess:res.userAccess||allAccessForPack(packKey),data:res.data||{}});
    }catch(e){setState(s=>({...s,loading:false,error:e.message||'Unable to load portal.'}));}
  },[]);
  useEffect(()=>{load();},[load]);
  const route=routeAfterBase(location.pathname,basePath);
  const value=useMemo(()=>({...state,currentUser:{...currentUser,roleName:state.userAccess?.roleName||currentUser?.roleName||currentUser?.role},demo:false,basePath,onLogout,refresh:load,apiAction:(action,payload)=>clientPortalApi.action(action,payload),mutateDemo:()=>{}}),[state,currentUser,basePath,onLogout,load]);
  if(state.loading)return <div className="bf-demo-home"><div className="bf-card bf-card-body">Loading secure company workspace…</div></div>;
  if(state.error)return <div className="bf-demo-home"><div className="bf-card bf-card-body"><h3>Company workspace unavailable</h3><p className="bf-muted">{state.error}</p><button className="bf-btn bf-btn-primary" onClick={load}>Retry</button></div></div>;
  return <ClientPortalProvider value={value}><ClientPortalShell><PageForRoute route={route} allowedKeys={state.userAccess?.moduleKeys||[]}/></ClientPortalShell></ClientPortalProvider>;
}
