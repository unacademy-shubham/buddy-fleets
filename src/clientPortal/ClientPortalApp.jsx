import React,{lazy,Suspense,useCallback,useEffect,useMemo,useState} from 'react';
import {useLocation,useNavigate,useParams} from 'react-router-dom';
import './clientPortal.css';
import './clientPortalTheme.css';
import {ClientPortalProvider} from './ClientPortalContext';
import ClientPortalShell from './components/ClientPortalShell';
const DashboardPage=lazy(()=>import('./pages/DashboardPage'));
const SitesPage=lazy(()=>import('./pages/SitesPage'));
const UsersPage=lazy(()=>import('./pages/UsersPage'));
const VehiclesPage=lazy(()=>import('./pages/VehiclesPage'));
const DriversPage=lazy(()=>import('./pages/DriversPage'));
const PartiesPage=lazy(()=>import('./pages/PartiesPage'));
const ReportsPage=lazy(()=>import('./pages/ReportsPage'));
const TravelsPage=lazy(()=>import('./pages/TravelsPage'));
const CementPage=lazy(()=>import('./pages/CementPage'));
const FinancePage=lazy(()=>import('./pages/FinancePage'));
const SettingsPage=lazy(()=>import('./pages/SettingsPage'));
const ProfileSecurityPage=lazy(()=>import('./pages/ProfileSecurityPage'));
const SubscriptionPage=lazy(()=>import('./pages/SubscriptionPage'));
const AuditActivityPage=lazy(()=>import('./pages/AuditActivityPage'));
const FleetWorkspacePage=lazy(()=>import('./pages/FleetWorkspacePage'));
const FleetPackSetupPage=lazy(()=>import('./pages/FleetPackSetupPage'));
const ComingSoonPage=lazy(()=>import('./pages/ComingSoonPage'));
import {clientPortalApi} from './services/clientPortalApi';
import {getModuleByRoute} from './config/moduleCatalog';

function routeAfterBase(pathname,basePath){const clean=pathname.replace(basePath,'').replace(/^\/+|\/+$/g,'');return clean||'dashboard';}

function PageForRoute({route,allowedKeys=[],setupRequired=false}){
  const setupSafe = route==='profile-security' || route.startsWith('profile-security/') || route==='subscription' || route.startsWith('subscription/');
  if(setupRequired && !setupSafe) return <FleetPackSetupPage/>;
  const routeModule=getModuleByRoute(route);
  const unrestricted = route==='profile-security' || route.startsWith('profile-security/') || (setupRequired && (route==='subscription' || route.startsWith('subscription/')));
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
  if(route==='audit-activity'||route.startsWith('audit-activity/'))return <AuditActivityPage/>;

  if(route.startsWith('travels/'))return <TravelsPage section={route.split('/')[1]||'bookings'}/>;
  if(route.startsWith('cement/'))return <CementPage section={route.split('/')[1]||'dispatch'}/>;

  if(routeModule)return <FleetWorkspacePage route={route}/>;
  return <ComingSoonPage title="Module" description="This route is not registered for the current Buddy Fleets fleet pack."/>;
}

export default function ClientPortalApp({currentUser,onLogout}){
  const {companySlug}=useParams();
  const location=useLocation();
  const navigate=useNavigate();
  const basePath=`/${companySlug}`;
  const [state,setState]=useState({loading:true,error:'',company:null,settings:null,sites:[],userAccess:null,runtime:null,data:{}});

  const load=useCallback(async()=>{
    setState(s=>({...s,loading:true,error:''}));
    try{
      const res=await clientPortalApi.bootstrap();
      const packKey=res.runtime?.fleetPackSetupRequired ? null : (res.company?.fleetPack||res.settings?.fleet_pack||null);
      setState({
        loading:false,error:'',
        company:{...(res.company||{}),fleetPack:packKey},
        settings:res.settings||{},
        sites:res.sites||[],
        userAccess:res.userAccess||{moduleKeys:[],companyModuleKeys:[],modulePermissions:{}},
        runtime:res.runtime||{},
        data:res.data||{},
      });
    }catch(e){setState(s=>({...s,loading:false,error:e.message||'Unable to load portal.'}));}
  },[]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{
    if(state.loading||state.error)return;
    const current=location.pathname.replace(/\/+$/,'')||'/';
    const base=basePath.replace(/\/+$/,'')||'/';
    if(current!==base)return;
    const configured=state.runtime?.fleetPackSetupRequired===true ? '/dashboard' : (state.runtime?.portalConfig?.landing_path||'/dashboard');
    const requested=String(configured||'/dashboard').replace(/^\/+|\/+$/g,'')||'dashboard';
    const availableRoutes=[];
    const collect=(nodes)=>{for(const node of Array.isArray(nodes)?nodes:[]){if(node?.route)availableRoutes.push(String(node.route).replace(/^\/+|\/+$/g,''));collect(node?.children);}};
    collect(state.runtime?.navigation||[]);
    const target=requested==='dashboard'||availableRoutes.includes(requested)?requested:'dashboard';
    navigate(`${basePath}/${target}`.replace(/\/+/g,'/'),{replace:true});
  },[state.loading,state.error,state.runtime?.fleetPackSetupRequired,state.runtime?.portalConfig?.landing_path,location.pathname,basePath,navigate]);
  const route=routeAfterBase(location.pathname,basePath);
  const self=state.data?.selfProfile||{};
  const value=useMemo(()=>({
    ...state,
    currentUser:{...currentUser,...self,name:self.full_name||currentUser?.name,roleName:state.userAccess?.roleName||currentUser?.roleName||currentUser?.role,photoUrl:self.photo_url||currentUser?.photoUrl},
    runtimeNavigation:state.runtime?.navigation||[],
    demo:false,
    basePath,
    onLogout,
    refresh:load,
    apiAction:(action,payload)=>clientPortalApi.action(action,payload),
    mutateDemo:()=>{},
  }),[state,currentUser,basePath,onLogout,load]);

  if(state.loading)return <div className="bf-demo-home"><div className="bf-card bf-card-body">Loading secure company workspace…</div></div>;
  if(state.error)return <div className="bf-demo-home"><div className="bf-card bf-card-body"><h3>Company workspace unavailable</h3><p className="bf-muted">{state.error}</p><button className="bf-btn bf-btn-primary" onClick={load}>Retry</button></div></div>;

  return <ClientPortalProvider value={value}>
    <ClientPortalShell>
      <Suspense fallback={<div className="bf-card bf-card-body" role="status">Loading module…</div>}><PageForRoute route={route} allowedKeys={state.userAccess?.moduleKeys||[]} setupRequired={state.runtime?.fleetPackSetupRequired===true}/></Suspense>
    </ClientPortalShell>
  </ClientPortalProvider>;
}
