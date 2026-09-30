import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {ChevronRight,LogOut,Moon,Sun} from 'lucide-react';
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
import AuditActivityPage from './pages/AuditActivityPage';
import FleetWorkspacePage from './pages/FleetWorkspacePage';
import ComingSoonPage from './pages/ComingSoonPage';
import {DEMO_FLEET_ORDER,getFleetPackBySlug,getFleetPack} from './config/fleetPacks';
import {getModuleByRoute} from './config/moduleCatalog';
import {iconFor} from './config/portalNavigation';
import {clientPortalApi} from './services/clientPortalApi';

const THEME_KEY='bf_client_theme_config_v2';
function readPickerTheme(){try{return {...JSON.parse(localStorage.getItem(THEME_KEY)||'{}')}}catch{return{}}}
function pickerVars(theme){
  const dark=theme==='dark';

  return {
    '--bf-primary':'#5551D7',
    '--bf-primary-2':'#4541BC',
    '--bf-primary-rgb':'85 81 215',

    '--bf-bg':dark?'#0E1929':'#ECECF3',
    '--bf-surface':dark?'#172235':'#FFFFFF',
    '--bf-surface-2':dark?'#131E2E':'#F7F8FB',

    '--bf-text':dark?'#F4F7FB':'#25252B',
    '--bf-text-2':dark?'#B4C0D0':'#667085',
    '--bf-text-3':dark?'#8190A5':'#8B95A7',

    '--bf-border':dark?'#2B384A':'#E1E5EC',
    '--bf-shadow':dark
      ?'0 18px 45px rgba(0,0,0,.20)'
      :'0 16px 38px rgba(30,41,59,.08)',

    '--bf-header-bg':'#5551D7',
    '--bf-header-text':'#FFFFFF',
    '--bf-header-muted':'rgba(255,255,255,.78)',
    '--bf-header-border':'rgba(255,255,255,.14)'
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
          ...readPickerTheme(),
          theme:next,
          primaryColor:'#5551D7',
          backgroundDark:'#0E1929',
          sidebarStyle:'dark',
          headerStyle:'color',
        })
      );
    }catch{}
  };

  const signedInAs=currentUser?.name||currentUser?.email||'Demo User';

  return (
    <div
      className="bf-demo-v2 bf-demo-premium"
      data-theme={theme}
      style={pickerVars(theme)}
    >
      <header className="bf-demo-v2-top">
        <div className="bf-demo-v2-top-inner">
          <div className="bf-demo-v2-brand">
            <div className="bf-client-brand-mark">BF</div>

            <div className="bf-demo-v2-brand-copy">
              <strong>Buddy Fleets Demo</strong>
              <span>Secure demo workspace</span>
            </div>
          </div>

          <div className="bf-demo-v2-actions">
            <div className="bf-demo-v2-user">
              <span className="bf-demo-v2-user-dot"/>
              <div>
                <small>Signed in as</small>
                <strong>{signedInAs}</strong>
              </div>
            </div>

            <button
              type="button"
              className="bf-client-header-icon"
              onClick={toggle}
              title="Light / Dark"
              aria-label="Toggle theme"
            >
              {theme==='dark'?<Sun size={16}/>:<Moon size={16}/>}
            </button>

            <button
              type="button"
              className="bf-client-header-icon"
              onClick={onLogout}
              title="Logout"
              aria-label="Logout demo"
            >
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </header>

      <main className="bf-demo-v2-body">
        <section className="bf-demo-v2-hero">
          <div className="bf-demo-v2-eyebrow">
            <span className="bf-demo-v2-status-dot"/>
            Authenticated Demo Workspace
          </div>

          <div className="bf-demo-v2-hero-grid">
            <div>
              <h1>Choose your fleet workspace</h1>

              <p>
                Explore each Buddy Fleets fleet pack using isolated sample data,
                the same secure application shell and the same permission-driven
                product architecture used by the live company portal.
              </p>
            </div>

            <div className="bf-demo-v2-summary">
              <div>
                <strong>7</strong>
                <span>Fleet Packs</span>
              </div>

              <div>
                <strong>Secure</strong>
                <span>Authenticated Access</span>
              </div>

              <div>
                <strong>Isolated</strong>
                <span>Demo Data</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bf-demo-v2-section">
          <div className="bf-demo-v2-section-head">
            <div>
              <span>Fleet dashboards</span>
              <h2>Select a transport operation</h2>
            </div>

            <p>
              Open any workspace below. You can return to this page from the
              Demo Home control inside every demo dashboard.
            </p>
          </div>

          <div className="bf-demo-v2-grid">
            {DEMO_FLEET_ORDER.map((key,index)=>{
              const pack=getFleetPack(key);
              const Icon=iconFor(pack?.icon);

              return (
                <Link
                  className="bf-demo-v2-card"
                  key={key}
                  to={`/demo/${pack.slug}/dashboard`}
                >
                  <div className="bf-demo-v2-card-top">
                    <div className="bf-demo-v2-card-icon">
                      <Icon size={21}/>
                    </div>

                    <span className="bf-demo-v2-card-index">
                      {String(index+1).padStart(2,'0')}
                    </span>
                  </div>

                  <div className="bf-demo-v2-card-copy">
                    <span className="bf-demo-v2-card-kicker">Demo Fleet Pack</span>
                    <h3>{pack.name}</h3>
                    <p>{pack.description}</p>
                  </div>

                  <div className="bf-demo-v2-card-foot">
                    <span>
                      Open Dashboard
                      <ChevronRight size={14}/>
                    </span>

                    <small>Sample data</small>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="bf-demo-v2-footer">
          <span>Buddy Fleets</span>
          <span>Authenticated backend demo environment</span>
        </footer>
      </main>
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

