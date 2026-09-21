import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {useLocation,useParams} from 'react-router-dom';
import './clientPortal.css';
import {ClientPortalProvider} from './ClientPortalContext';
import ClientPortalShell from './components/ClientPortalShell';
import DashboardPage from './pages/DashboardPage'; import SitesPage from './pages/SitesPage'; import UsersPage from './pages/UsersPage'; import VehiclesPage from './pages/VehiclesPage'; import DriversPage from './pages/DriversPage'; import PartiesPage from './pages/PartiesPage'; import ReportsPage from './pages/ReportsPage'; import TravelsPage from './pages/TravelsPage'; import CementPage from './pages/CementPage'; import FinancePage from './pages/FinancePage'; import SettingsPage from './pages/SettingsPage'; import ProfileSecurityPage from './pages/ProfileSecurityPage'; import ComingSoonPage from './pages/ComingSoonPage';
import {clientPortalApi} from './services/clientPortalApi'; import {getFleetPack} from './config/fleetPacks'; import {MODULE_CATALOG,defaultPermissionSet,getModuleByRoute} from './config/moduleCatalog';

function routeAfterBase(pathname,basePath){const clean=pathname.replace(basePath,'').replace(/^\/+|\/+$/g,'');return clean||'dashboard';}
function PageForRoute({route,allowedKeys=[]}){
 const routeModule=getModuleByRoute(route); if(route!=='profile-security'&&routeModule&&!allowedKeys.includes(routeModule.key))return <ComingSoonPage title="Access restricted" description="This module is not enabled for your user account. Ask the company owner/admin to update Module Access."/>;
 if(route==='dashboard')return <DashboardPage/>; if(route==='sites')return <SitesPage/>; if(route==='users')return <UsersPage/>; if(route==='vehicles')return <VehiclesPage/>; if(route==='drivers')return <DriversPage/>; if(route==='parties')return <PartiesPage/>; if(route==='reports')return <ReportsPage/>; if(route==='finance'||route==='expenses')return <FinancePage/>; if(route==='settings')return <SettingsPage/>; if(route==='profile-security')return <ProfileSecurityPage/>;
 if(route.startsWith('travels/'))return <TravelsPage section={route.split('/')[1]}/>; if(route.startsWith('cement/'))return <CementPage section={route.split('/')[1]}/>;
 const module=getModuleByRoute(route); return <ComingSoonPage title={module?.label||'Module'} description={module ? `${module.label} is registered in the current Buddy Fleets module catalog.` : 'This module is not available for your current configuration.'}/>;
}
function allAccessForPack(packKey){const pack=getFleetPack(packKey);const keys=pack?.recommendedModules||MODULE_CATALOG.map(m=>m.key);return {allSites:true,siteIds:[],moduleKeys:keys,companyModuleKeys:keys,modulePermissions:Object.fromEntries(keys.map(k=>[k,defaultPermissionSet(true)]))};}

export default function ClientPortalApp({currentUser,onLogout}){
 const {companySlug}=useParams(); const location=useLocation(); const basePath=`/${companySlug}`; const [state,setState]=useState({loading:true,error:'',company:null,settings:null,sites:[],userAccess:null,data:{}});
 const load=useCallback(async()=>{setState(s=>({...s,loading:true,error:''}));try{const res=await clientPortalApi.bootstrap();setState({loading:false,error:'',company:{...res.company,fleetPack:res.settings?.fleet_pack||'travels'},settings:res.settings||{},sites:res.sites||[],userAccess:res.userAccess||allAccessForPack(res.settings?.fleet_pack||'travels'),data:res.data||{}})}catch(e){setState(s=>({...s,loading:false,error:e.message||'Unable to load portal.'}))}},[]);
 useEffect(()=>{load()},[load]);
 const route=routeAfterBase(location.pathname,basePath);
 const value=useMemo(()=>({...state,currentUser,demo:false,basePath,onLogout,refresh:load,apiAction:(action,payload)=>clientPortalApi.action(action,payload),mutateDemo:()=>{}}),[state,currentUser,basePath,onLogout,load]);
 if(state.loading)return <div className="bf-demo-home"><div className="bf-card bf-card-body">Loading secure company workspace…</div></div>;
 if(state.error)return <div className="bf-demo-home"><div className="bf-card bf-card-body"><h3>Company workspace unavailable</h3><p className="bf-muted">{state.error}</p><button className="bf-btn bf-btn-primary" onClick={load}>Retry</button></div></div>;
 return <ClientPortalProvider value={value}><ClientPortalShell><PageForRoute route={route} allowedKeys={state.userAccess?.moduleKeys||[]}/></ClientPortalShell></ClientPortalProvider>;
}
