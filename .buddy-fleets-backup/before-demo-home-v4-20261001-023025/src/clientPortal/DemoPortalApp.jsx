import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChevronRight,LogOut,Moon,Sun} from 'lucide-react';
import './clientPortal.css';
import './clientPortalTheme.css';
import {ClientPortalProvider} from './ClientPortalContext';
import ClientPortalShell from './components/ClientPortalShell';
import PortalFooter from './components/PortalFooter';
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
import AuditActivityPage from './pages/AuditActivityPage';
import FleetWorkspacePage from './pages/FleetWorkspacePage';
import ComingSoonPage from './pages/ComingSoonPage';
import {DEMO_FLEET_ORDER,getFleetPackBySlug,getFleetPack} from './config/fleetPacks';
import {getModuleByRoute} from './config/moduleCatalog';
import {iconFor} from './config/portalNavigation';
import {clientPortalApi} from './services/clientPortalApi';

const THEME_KEY='bf_demo_picker_theme_v1';
function readPickerTheme(){try{return {...JSON.parse(localStorage.getItem(THEME_KEY)||'{}')}}catch{return{}}}
function pickerVars(theme){
  const dark=theme==='dark';

  return {
    '--bf-primary':'#5551D7',
    '--bf-primary-2':'#4541BC',
    '--bf-primary-rgb':'85 81 215',

    '--bf-bg':dark?'#0E1929':'#ECECF3',
    '--bf-surface':dark?'#172235':'#FFFFFF',
    '--bf-surface-2':dark?'#1C293C':'#F7F8FB',

    '--bf-text':dark?'#F4F7FB':'#20242D',
    '--bf-text-2':dark?'#C1CBDA':'#566277',
    '--bf-text-3':dark?'#8E9CAF':'#7B879B',

    '--bf-border':dark?'#2B384A':'#DCE2EA',
    '--bf-shadow':dark
      ?'0 14px 34px rgba(0,0,0,.18)'
      :'0 12px 30px rgba(30,41,59,.08)',

    '--bf-header-bg':'#5551D7',
    '--bf-header-text':'#FFFFFF',
    '--bf-header-muted':'rgba(255,255,255,.80)',
    '--bf-header-border':'rgba(255,255,255,.16)'
  };
}

function page(route,allowedKeys=[]){
  const m=getModuleByRoute(route);
  const unrestricted=route==='profile-security'||route.startsWith('profile-security/');
  if(!unrestricted&&m&&!allowedKeys.includes(m.key))return <ComingSoonPage title="Access restricted" description="The current demo lifecycle does not allow this module."/>;
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
  if(m)return <FleetWorkspacePage route={route}/>;
  return <ComingSoonPage title="Module"/>;
}

function DemoFleetPicker({currentUser,onLogout}){
  const saved=readPickerTheme();
  const [theme,setTheme]=useState(saved.theme==='light'?'light':'dark');

  const toggle=()=>{
    const next=theme==='dark'?'light':'dark';
    setTheme(next);

    try{
      localStorage.setItem(
        THEME_KEY,
        JSON.stringify({
          theme:next,
          primaryColor:'#5551D7',
        })
      );
    }catch{}
  };

  const signedInAs=currentUser?.name||currentUser?.email||'Demo User';

  return (
    <div
      className="bf-demo-v3"
      data-theme={theme}
      style={pickerVars(theme)}
    >
      <header className="bf-demo-v3-header">
        <div className="bf-demo-v3-header-inner">
          <div className="bf-demo-v3-brand">
            <div className="bf-client-brand-mark">BF</div>

            <div>
              <strong>Buddy Fleets Demo</strong>
              <span>Demo Control Center</span>
            </div>
          </div>

          <div className="bf-demo-v3-header-actions">
            <div className="bf-demo-v3-user">
              <span className="bf-demo-v3-online"/>
              <div>
                <small>Signed in as</small>
                <strong>{signedInAs}</strong>
              </div>
            </div>

            <button
              type="button"
              className="bf-demo-v3-icon-btn"
              onClick={toggle}
              title="Light / Dark"
              aria-label="Toggle theme"
            >
              {theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}
            </button>

            <button
              type="button"
              className="bf-demo-v3-icon-btn"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout demo"
            >
              <LogOut size={17}/>
            </button>
          </div>
        </div>
      </header>

      <main className="bf-demo-v3-main">
        <section className="bf-demo-v3-page-head">
          <div>
            <div className="bf-demo-v3-badge">
              <span/>
              Authenticated Demo Workspace
            </div>

            <h1>Choose a fleet dashboard</h1>

            <p>
              Select a transport operation to open its isolated Buddy Fleets
              demo workspace. Each dashboard runs through the authenticated
              backend with sample data and the same permission-driven product
              architecture.
            </p>
          </div>

          <div className="bf-demo-v3-stats">
            <div>
              <strong>7</strong>
              <span>Fleet Packs</span>
            </div>
            <div>
              <strong>Secure</strong>
              <span>Access</span>
            </div>
            <div>
              <strong>Isolated</strong>
              <span>Sample Data</span>
            </div>
          </div>
        </section>

        <section className="bf-demo-v3-workspaces">
          <div className="bf-demo-v3-section-head">
            <div>
              <span>Available Demo Workspaces</span>
              <h2>Select your transport business type</h2>
            </div>

            <p>
              Use the Demo Home button inside any fleet dashboard to return
              here without logging out.
            </p>
          </div>

          <div className="bf-demo-v3-grid">
            {DEMO_FLEET_ORDER.map((key,index)=>{
              const pack=getFleetPack(key);
              const Icon=iconFor(pack?.icon);

              return (
                <Link
                  className="bf-demo-v3-card"
                  key={key}
                  to={`/demo/${pack.slug}/dashboard`}
                >
                  <div className="bf-demo-v3-card-head">
                    <div className="bf-demo-v3-card-icon">
                      <Icon size={23}/>
                    </div>

                    <span className="bf-demo-v3-card-no">
                      {String(index+1).padStart(2,'0')}
                    </span>
                  </div>

                  <div className="bf-demo-v3-card-body">
                    <span className="bf-demo-v3-card-label">Demo Fleet Pack</span>
                    <h3>{pack.name}</h3>
                    <p>{pack.description}</p>
                  </div>

                  <div className="bf-demo-v3-card-action">
                    <span>
                      Open Dashboard
                      <ChevronRight size={16}/>
                    </span>

                    <small>Sample Data</small>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <PortalFooter/>
    </div>
  );
}
function DemoFleetWorkspace({pack,currentUser,onLogout}){
  const location=useLocation();
  const basePath=`/demo/${pack.slug}`;
  const route=location.pathname.replace(basePath,'').replace(/^\/+|\/+$/g,'')||'dashboard';
  const [state,setState]=useState({loading:true,error:'',company:null,settings:null,sites:[],userAccess:null,runtime:null,data:{}});

  const load=useCallback(async()=>{
    setState(s=>({...s,loading:true,error:''}));
    try{
      const res=await clientPortalApi.demoBootstrap(pack.key);
      setState({loading:false,error:'',company:{...(res.company||{}),fleetPack:pack.key},settings:res.settings||{fleet_pack:pack.key},sites:res.sites||[],userAccess:res.userAccess||{moduleKeys:[],companyModuleKeys:[],modulePermissions:{}},runtime:res.runtime||{},data:res.data||{}});
    }catch(error){setState(s=>({...s,loading:false,error:error.message||'Unable to load demo workspace.'}));}
  },[pack.key]);

  useEffect(()=>{load();},[load]);

  const value=useMemo(()=>{
    const snapshotUser=state.data?.currentUser||{};
    const user={...snapshotUser,...(currentUser||{}),role:currentUser?.role||snapshotUser.role||'Company Owner',roleName:'Company Owner'};
    return {
      ...state,
      currentUser:user,
      runtimeNavigation:[],
      demo:true,
      demoMode:pack.slug,
      basePath,
      onLogout,
      refresh:load,
      apiAction:async(action,payload)=>clientPortalApi.demoAction(pack.key,action,payload),
      mutateDemo:()=>{},
    };
  },[state,basePath,pack.key,pack.slug,currentUser,onLogout,load]);

  if(state.loading)return <div className="bf-demo-home"><div className="bf-card bf-card-body">Loading persisted {pack.name} demoâ€¦</div></div>;
  if(state.error)return <div className="bf-demo-home"><div className="bf-card bf-card-body"><h3>Demo workspace unavailable</h3><p className="bf-muted">{state.error}</p><button className="bf-btn bf-btn-primary" onClick={load}>Retry</button></div></div>;

  return <ClientPortalProvider value={value}><ClientPortalShell>{page(route,state.userAccess?.moduleKeys||[])}</ClientPortalShell></ClientPortalProvider>;
}

export default function DemoPortalApp({currentUser,onLogout}){
  const location=useLocation();
  const parts=location.pathname.split('/').filter(Boolean);
  const pack=getFleetPackBySlug(parts[1]);
  if(!pack)return <DemoFleetPicker currentUser={currentUser} onLogout={onLogout}/>;
  return <DemoFleetWorkspace key={pack.key} pack={pack} currentUser={currentUser} onLogout={onLogout}/>;
}


