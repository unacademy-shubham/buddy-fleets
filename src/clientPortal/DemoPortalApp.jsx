import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChevronRight,LogOut,Moon,Sun} from 'lucide-react';
import './clientPortal.css';
import './clientPortalTheme.css';
import {ClientPortalProvider} from './ClientPortalContext';
import ClientPortalShell from './components/ClientPortalShell';
import SessionControl from '../components/SessionControl';
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
      className="bf-demo-v4"
      data-theme={theme}
      style={pickerVars(theme)}
    >
      <header className="bf-demo-v4-header">
        <div className="bf-demo-v4-header-inner">
          <div className="bf-demo-v4-brand">
            <div className="bf-client-brand-mark">BF</div>
            <div>
              <strong>Buddy Fleets Demo</strong>
              <span>Interactive Fleet Workspace</span>
            </div>
          </div>

          <div className="bf-demo-v4-header-actions">
            <div className="bf-demo-v4-secure">
              <span className="bf-demo-v4-online"/>
              Secure Demo
            </div>

            <div className="bf-demo-v4-user">
              <small>Signed in as</small>
              <strong>{signedInAs}</strong>
            </div>

            <button
              type="button"
              className="bf-demo-v4-icon-btn"
              onClick={toggle}
              title="Light / Dark"
              aria-label="Toggle theme"
            >
              {theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}
            </button>

            <button
              type="button"
              className="bf-demo-v4-icon-btn"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout demo"
            >
              <LogOut size={17}/>
            </button>
          </div>
        </div>
      </header>

      <main className="bf-demo-v4-main">
        <section className="bf-demo-v4-hero">
          <div className="bf-demo-v4-hero-copy">
            <div className="bf-demo-v4-badge">
              <span/>
              7 Transport Workspaces â€¢ One Platform
            </div>

            <h1>
              Pick a fleet.
              <span> Explore the real workflow.</span>
            </h1>

            <p>
              Open any demo workspace and experience Buddy Fleets with
              authenticated access, isolated sample data and the same
              permission-driven architecture used by the live product.
            </p>

            <div className="bf-demo-v4-hero-pills">
              <span>Live-style Dashboard</span>
              <span>Sample Operations</span>
              <span>Role-based Access</span>
              <span>Return Without Logout</span>
            </div>
          </div>

          <div className="bf-demo-v4-preview" aria-hidden="true">
            <div className="bf-demo-v4-preview-top">
              <div className="bf-demo-v4-preview-dots">
                <span/><span/><span/>
              </div>
              <span>Demo Operations Console</span>
            </div>

            <div className="bf-demo-v4-preview-grid">
              <div className="bf-demo-v4-preview-kpi">
                <small>Active Vehicles</small>
                <strong>124</strong>
                <span>+8 today</span>
              </div>
              <div className="bf-demo-v4-preview-kpi">
                <small>Trips Running</small>
                <strong>38</strong>
                <span>On schedule</span>
              </div>
              <div className="bf-demo-v4-preview-kpi">
                <small>Alerts</small>
                <strong>05</strong>
                <span>Needs review</span>
              </div>
            </div>

            <div className="bf-demo-v4-route-card">
              <div className="bf-demo-v4-route-head">
                <span>Live Fleet View</span>
                <small>Updated now</small>
              </div>

              <div className="bf-demo-v4-map">
                <span className="route route-a"/>
                <span className="route route-b"/>
                <span className="pin pin-a"/>
                <span className="pin pin-b"/>
                <span className="pin pin-c"/>
              </div>
            </div>
          </div>
        </section>

        <section className="bf-demo-v4-workspaces">
          <div className="bf-demo-v4-section-head">
            <div>
              <span>Choose your business type</span>
              <h2>Demo fleet workspaces</h2>
            </div>

            <p>
              Each workspace has its own modules, sample data and operational flow.
            </p>
          </div>

          <div className="bf-demo-v4-grid">
            {DEMO_FLEET_ORDER.map((key,index)=>{
              const pack=getFleetPack(key);
              const Icon=iconFor(pack?.icon);
              const tone=`tone-${(index%7)+1}`;

              return (
                <Link
                  className={`bf-demo-v4-card ${tone}`}
                  key={key}
                  to={`/demo/${pack.slug}/dashboard`}
                >
                  <div className="bf-demo-v4-card-glow"/>

                  <div className="bf-demo-v4-card-head">
                    <div className="bf-demo-v4-card-icon">
                      <Icon size={25}/>
                    </div>

                    <span className="bf-demo-v4-card-no">
                      {String(index+1).padStart(2,'0')}
                    </span>
                  </div>

                  <div className="bf-demo-v4-card-body">
                    <span className="bf-demo-v4-card-label">Fleet Pack</span>
                    <h3>{pack.name}</h3>
                    <p>{pack.description}</p>
                  </div>

                  <div className="bf-demo-v4-mini-data">
                    <span><b>Demo</b><small>Workspace</small></span>
                    <span><b>Live</b><small>Workflow</small></span>
                    <span><b>Safe</b><small>Sample Data</small></span>
                  </div>

                  <div className="bf-demo-v4-card-action">
                    <span>
                      Open Dashboard
                      <ChevronRight size={16}/>
                    </span>
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
  if(!pack)return <><SessionControl showBadge={false}/><DemoFleetPicker currentUser={currentUser} onLogout={onLogout}/></>;
  return <DemoFleetWorkspace key={pack.key} pack={pack} currentUser={currentUser} onLogout={onLogout}/>;
}



