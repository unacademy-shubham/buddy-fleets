param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$demoPath = "src/clientPortal/DemoPortalApp.jsx"
$themePath = "src/clientPortal/clientPortalTheme.css"

function Step($message) {
  Write-Host ""
  Write-Host "==> $message" -ForegroundColor Cyan
}

Step "Checking Buddy Fleets project"

$insideGit = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $insideGit.Trim() -ne "true") {
  throw "Run this from the Buddy Fleets project root."
}

foreach ($path in @($demoPath, $themePath)) {
  if (-not (Test-Path $path)) {
    throw "Could not find $path"
  }
}

Step "Backing up current Demo Home"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path ".buddy-fleets-backup" "before-demo-home-v4-$timestamp"

foreach ($path in @($demoPath, $themePath)) {
  $target = Join-Path $backupRoot $path
  New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
  Copy-Item $path $target -Force
}

Write-Host "Backup created: $backupRoot" -ForegroundColor DarkGray

Step "Building visual Demo Home V4"

$demo = Get-Content $demoPath -Raw

$pickerStart = $demo.IndexOf("function DemoFleetPicker({currentUser,onLogout}){")
$workspaceStart = $demo.IndexOf("function DemoFleetWorkspace(", $pickerStart)

if ($pickerStart -lt 0 -or $workspaceStart -lt 0) {
  throw "Could not locate DemoFleetPicker / DemoFleetWorkspace."
}

$newPicker = @'
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
              7 Transport Workspaces • One Platform
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

'@

$demo = $demo.Substring(0, $pickerStart) + $newPicker + $demo.Substring($workspaceStart)
Set-Content -Path $demoPath -Value $demo -Encoding utf8

Step "Applying visual styles"

$css = Get-Content $themePath -Raw

# Remove older picker blocks if they exist.
$blocks = @(
  @("/* BF_DEMO_PICKER_PREMIUM_START */","/* BF_DEMO_PICKER_PREMIUM_END */"),
  @("/* BF_DEMO_PICKER_V3_START */","/* BF_DEMO_PICKER_V3_END */"),
  @("/* BF_DEMO_PICKER_V4_START */","/* BF_DEMO_PICKER_V4_END */")
)

foreach ($pair in $blocks) {
  $startMarker = $pair[0]
  $endMarker = $pair[1]

  if ($css.Contains($startMarker)) {
    $start = $css.IndexOf($startMarker)
    $end = $css.IndexOf($endMarker, $start)

    if ($end -ge 0) {
      $end += $endMarker.Length
      $css = $css.Remove($start, $end - $start)
    }
  }
}

$v4Css = @'

/* BF_DEMO_PICKER_V4_START */
/* ============================================================
   BUDDY FLEETS DEMO HOME V4
   Visual, interactive, readable — Developer dashboard family
============================================================ */

.bf-demo-v4,
.bf-demo-v4 * {
  box-sizing: border-box;
}

.bf-demo-v4 {
  min-height:100dvh;
  display:flex;
  flex-direction:column;
  background:
    radial-gradient(circle at 12% 6%, rgb(var(--bf-primary-rgb)/.13), transparent 30rem),
    radial-gradient(circle at 88% 16%, rgba(22,137,229,.08), transparent 28rem),
    var(--bf-bg);
  color:var(--bf-text);
  font-family:Inter,Roboto,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}

.bf-demo-v4-header {
  position:sticky;
  top:0;
  z-index:50;
  height:68px;
  background:var(--bf-header-bg);
  color:#fff;
  border-bottom:1px solid var(--bf-header-border);
  box-shadow:0 4px 18px rgba(0,0,0,.15);
}

.bf-demo-v4-header-inner {
  width:100%;
  height:100%;
  padding:0 clamp(18px,2.4vw,40px);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
}

.bf-demo-v4-brand {
  display:flex;
  align-items:center;
  gap:12px;
  min-width:0;
}

.bf-demo-v4 .bf-client-brand-mark {
  width:42px;
  height:42px;
  display:grid;
  place-items:center;
  flex:0 0 auto;
  border-radius:10px;
  color:#fff;
  font-size:12px;
  font-weight:900;
  letter-spacing:.06em;
  background:linear-gradient(135deg,#1689E5,#22C55E);
  box-shadow:0 8px 22px rgba(0,0,0,.18);
}

.bf-demo-v4-brand strong {
  display:block;
  color:#fff;
  font-size:15px;
  font-weight:850;
  letter-spacing:-.015em;
}

.bf-demo-v4-brand span {
  display:block;
  margin-top:2px;
  color:var(--bf-header-muted);
  font-size:11px;
  font-weight:600;
}

.bf-demo-v4-header-actions {
  display:flex;
  align-items:center;
  gap:9px;
}

.bf-demo-v4-secure {
  height:34px;
  padding:0 11px;
  display:flex;
  align-items:center;
  gap:7px;
  border:1px solid rgba(255,255,255,.16);
  border-radius:999px;
  background:rgba(255,255,255,.07);
  color:#fff;
  font-size:11px;
  font-weight:700;
}

.bf-demo-v4-online {
  width:8px;
  height:8px;
  border-radius:50%;
  background:#34D399;
  box-shadow:0 0 0 3px rgba(52,211,153,.14);
}

.bf-demo-v4-user {
  max-width:290px;
  padding:0 10px;
  border-left:1px solid rgba(255,255,255,.16);
}

.bf-demo-v4-user small {
  display:block;
  color:var(--bf-header-muted);
  font-size:9px;
  font-weight:650;
}

.bf-demo-v4-user strong {
  display:block;
  max-width:250px;
  margin-top:1px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#fff;
  font-size:11px;
  font-weight:750;
}

.bf-demo-v4-icon-btn {
  width:38px;
  height:38px;
  display:grid;
  place-items:center;
  flex:0 0 auto;
  border:1px solid rgba(255,255,255,.16);
  border-radius:8px;
  background:transparent;
  color:#fff;
  cursor:pointer;
  transition:.16s ease;
}

.bf-demo-v4-icon-btn:hover {
  background:rgba(255,255,255,.11);
  transform:translateY(-1px);
}

.bf-demo-v4-main {
  width:min(94vw,1550px);
  margin:0 auto;
  padding:34px 0 36px;
  flex:1;
}

.bf-demo-v4-hero {
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(420px,.95fr);
  gap:28px;
  align-items:stretch;
}

.bf-demo-v4-hero-copy {
  position:relative;
  overflow:hidden;
  padding:34px 34px 30px;
  border:1px solid var(--bf-border);
  border-radius:18px;
  background:
    linear-gradient(135deg,rgb(var(--bf-primary-rgb)/.10),transparent 55%),
    var(--bf-surface);
  box-shadow:var(--bf-shadow);
}

.bf-demo-v4-hero-copy::after {
  content:"";
  position:absolute;
  width:220px;
  height:220px;
  right:-80px;
  bottom:-120px;
  border-radius:50%;
  background:rgb(var(--bf-primary-rgb)/.13);
  filter:blur(2px);
}

.bf-demo-v4-badge {
  position:relative;
  z-index:1;
  display:inline-flex;
  align-items:center;
  gap:8px;
  color:#A7A4FF;
  font-size:11px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.bf-demo-v4[data-theme="light"] .bf-demo-v4-badge {
  color:var(--bf-primary);
}

.bf-demo-v4-badge > span {
  width:8px;
  height:8px;
  border-radius:50%;
  background:#34D399;
  box-shadow:0 0 0 3px rgba(52,211,153,.12);
}

.bf-demo-v4-hero h1 {
  position:relative;
  z-index:1;
  margin:14px 0 0;
  max-width:760px;
  color:var(--bf-text);
  font-size:clamp(38px,4vw,58px);
  font-weight:900;
  line-height:1.02;
  letter-spacing:-.045em;
}

.bf-demo-v4-hero h1 span {
  color:#A7A4FF;
}

.bf-demo-v4[data-theme="light"] .bf-demo-v4-hero h1 span {
  color:var(--bf-primary);
}

.bf-demo-v4-hero p {
  position:relative;
  z-index:1;
  max-width:760px;
  margin:16px 0 0;
  color:var(--bf-text-2);
  font-size:14px;
  line-height:1.75;
}

.bf-demo-v4-hero-pills {
  position:relative;
  z-index:1;
  margin-top:22px;
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}

.bf-demo-v4-hero-pills span {
  padding:7px 10px;
  border:1px solid var(--bf-border);
  border-radius:999px;
  background:var(--bf-surface-2);
  color:var(--bf-text-2);
  font-size:11px;
  font-weight:700;
}

.bf-demo-v4-preview {
  min-height:330px;
  overflow:hidden;
  border:1px solid var(--bf-border);
  border-radius:18px;
  background:linear-gradient(180deg,#111C2E,#0E1727);
  color:#fff;
  box-shadow:var(--bf-shadow);
}

.bf-demo-v4-preview-top {
  height:46px;
  padding:0 15px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.02);
}

.bf-demo-v4-preview-top > span {
  color:#B8C4D4;
  font-size:11px;
  font-weight:700;
}

.bf-demo-v4-preview-dots {
  display:flex;
  gap:5px;
}

.bf-demo-v4-preview-dots span {
  width:7px;
  height:7px;
  border-radius:50%;
  background:#475569;
}

.bf-demo-v4-preview-dots span:nth-child(1){background:#FB7185;}
.bf-demo-v4-preview-dots span:nth-child(2){background:#FBBF24;}
.bf-demo-v4-preview-dots span:nth-child(3){background:#34D399;}

.bf-demo-v4-preview-grid {
  padding:14px;
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:10px;
}

.bf-demo-v4-preview-kpi {
  min-width:0;
  padding:13px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:11px;
  background:rgba(255,255,255,.045);
}

.bf-demo-v4-preview-kpi small {
  display:block;
  color:#8190A5;
  font-size:9px;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.06em;
}

.bf-demo-v4-preview-kpi strong {
  display:block;
  margin-top:7px;
  color:#fff;
  font-size:24px;
  font-weight:900;
}

.bf-demo-v4-preview-kpi span {
  display:block;
  margin-top:2px;
  color:#34D399;
  font-size:9px;
  font-weight:700;
}

.bf-demo-v4-route-card {
  margin:0 14px 14px;
  padding:13px;
  border:1px solid rgba(255,255,255,.08);
  border-radius:12px;
  background:rgba(255,255,255,.035);
}

.bf-demo-v4-route-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.bf-demo-v4-route-head span {
  color:#F1F5F9;
  font-size:11px;
  font-weight:800;
}

.bf-demo-v4-route-head small {
  color:#34D399;
  font-size:9px;
  font-weight:700;
}

.bf-demo-v4-map {
  position:relative;
  height:132px;
  margin-top:10px;
  overflow:hidden;
  border-radius:10px;
  background:
    linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px),
    #0B1422;
  background-size:22px 22px;
}

.bf-demo-v4-map .route {
  position:absolute;
  height:3px;
  border-radius:999px;
  background:linear-gradient(90deg,#5551D7,#1689E5,#22C55E);
  transform-origin:left center;
}

.bf-demo-v4-map .route-a {
  width:74%;
  left:12%;
  top:62%;
  transform:rotate(-11deg);
}

.bf-demo-v4-map .route-b {
  width:52%;
  left:24%;
  top:34%;
  transform:rotate(17deg);
  opacity:.75;
}

.bf-demo-v4-map .pin {
  position:absolute;
  width:12px;
  height:12px;
  border:3px solid #fff;
  border-radius:50%;
  background:#5551D7;
  box-shadow:0 0 0 4px rgba(85,81,215,.18);
}

.bf-demo-v4-map .pin-a{left:18%;top:67%;}
.bf-demo-v4-map .pin-b{left:50%;top:40%;background:#1689E5;}
.bf-demo-v4-map .pin-c{right:15%;top:24%;background:#22C55E;}

.bf-demo-v4-workspaces {
  margin-top:30px;
}

.bf-demo-v4-section-head {
  margin-bottom:16px;
  display:flex;
  align-items:end;
  justify-content:space-between;
  gap:26px;
}

.bf-demo-v4-section-head > div > span {
  color:#A7A4FF;
  font-size:11px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.bf-demo-v4[data-theme="light"] .bf-demo-v4-section-head > div > span {
  color:var(--bf-primary);
}

.bf-demo-v4-section-head h2 {
  margin:5px 0 0;
  color:var(--bf-text);
  font-size:24px;
  font-weight:850;
  letter-spacing:-.025em;
}

.bf-demo-v4-section-head > p {
  max-width:470px;
  margin:0;
  color:var(--bf-text-3);
  font-size:12px;
  line-height:1.6;
  text-align:right;
}

.bf-demo-v4-grid {
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:16px;
}

.bf-demo-v4-card {
  --tone:#5551D7;
  position:relative;
  min-height:300px;
  padding:20px;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border:1px solid var(--bf-border);
  border-radius:15px;
  background:
    linear-gradient(180deg,color-mix(in srgb,var(--tone) 8%,transparent),transparent 38%),
    var(--bf-surface);
  color:var(--bf-text);
  text-decoration:none;
  box-shadow:var(--bf-shadow);
  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease;
}

.bf-demo-v4-card.tone-1{--tone:#5551D7;}
.bf-demo-v4-card.tone-2{--tone:#1689E5;}
.bf-demo-v4-card.tone-3{--tone:#0EA5E9;}
.bf-demo-v4-card.tone-4{--tone:#22C55E;}
.bf-demo-v4-card.tone-5{--tone:#F59E0B;}
.bf-demo-v4-card.tone-6{--tone:#A855F7;}
.bf-demo-v4-card.tone-7{--tone:#14B8A6;}

.bf-demo-v4-card::before {
  content:"";
  position:absolute;
  left:0;
  top:0;
  width:100%;
  height:3px;
  background:linear-gradient(90deg,var(--tone),transparent);
}

.bf-demo-v4-card-glow {
  position:absolute;
  width:180px;
  height:180px;
  right:-90px;
  top:-95px;
  border-radius:50%;
  background:color-mix(in srgb,var(--tone) 18%,transparent);
  filter:blur(2px);
  pointer-events:none;
}

.bf-demo-v4-card:hover {
  transform:translateY(-5px);
  border-color:color-mix(in srgb,var(--tone) 65%,var(--bf-border));
  box-shadow:0 22px 44px rgba(0,0,0,.20);
}

.bf-demo-v4-card-head {
  position:relative;
  z-index:1;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
}

.bf-demo-v4-card-icon {
  width:50px;
  height:50px;
  display:grid;
  place-items:center;
  border:1px solid color-mix(in srgb,var(--tone) 32%,transparent);
  border-radius:13px;
  background:color-mix(in srgb,var(--tone) 14%,transparent);
  color:color-mix(in srgb,var(--tone) 82%,white);
}

.bf-demo-v4[data-theme="light"] .bf-demo-v4-card-icon {
  color:var(--tone);
}

.bf-demo-v4-card-no {
  color:var(--bf-text-3);
  font-size:12px;
  font-weight:850;
}

.bf-demo-v4-card-body {
  position:relative;
  z-index:1;
  margin-top:20px;
}

.bf-demo-v4-card-label {
  color:color-mix(in srgb,var(--tone) 80%,white);
  font-size:10px;
  font-weight:850;
  text-transform:uppercase;
  letter-spacing:.08em;
}

.bf-demo-v4[data-theme="light"] .bf-demo-v4-card-label {
  color:var(--tone);
}

.bf-demo-v4-card h3 {
  margin:7px 0 0;
  color:var(--bf-text);
  font-size:20px;
  font-weight:900;
  line-height:1.25;
  letter-spacing:-.025em;
}

.bf-demo-v4-card p {
  margin:10px 0 0;
  color:var(--bf-text-2);
  font-size:13px;
  line-height:1.65;
}

.bf-demo-v4-mini-data {
  position:relative;
  z-index:1;
  margin-top:18px;
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  overflow:hidden;
  border:1px solid var(--bf-border);
  border-radius:10px;
  background:var(--bf-surface-2);
}

.bf-demo-v4-mini-data > span {
  min-width:0;
  padding:9px 7px;
  text-align:center;
}

.bf-demo-v4-mini-data > span + span {
  border-left:1px solid var(--bf-border);
}

.bf-demo-v4-mini-data b {
  display:block;
  color:var(--bf-text);
  font-size:11px;
  font-weight:850;
}

.bf-demo-v4-mini-data small {
  display:block;
  margin-top:2px;
  color:var(--bf-text-3);
  font-size:8px;
  font-weight:650;
}

.bf-demo-v4-card-action {
  position:relative;
  z-index:1;
  margin-top:auto;
  padding-top:18px;
}

.bf-demo-v4-card-action > span {
  width:100%;
  height:38px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:7px;
  border:1px solid color-mix(in srgb,var(--tone) 34%,transparent);
  border-radius:9px;
  background:color-mix(in srgb,var(--tone) 12%,transparent);
  color:color-mix(in srgb,var(--tone) 82%,white);
  font-size:12px;
  font-weight:850;
  transition:.18s ease;
}

.bf-demo-v4[data-theme="light"] .bf-demo-v4-card-action > span {
  color:var(--tone);
}

.bf-demo-v4-card:hover .bf-demo-v4-card-action > span {
  background:color-mix(in srgb,var(--tone) 18%,transparent);
}

.bf-demo-v4-card:hover .bf-demo-v4-card-action svg {
  transform:translateX(3px);
}

.bf-demo-v4-card-action svg {
  transition:transform .18s ease;
}

.bf-demo-v4 > .bf-portal-footer {
  margin-top:auto;
  padding:15px 20px;
  text-align:center;
  background:var(--bf-surface);
  color:var(--bf-text-2);
  border-top:1px solid var(--bf-border);
  font-size:12px;
  line-height:1.55;
}

.bf-demo-v4 > .bf-portal-footer p {
  margin:2px 0;
}

.bf-demo-v4 > .bf-portal-footer a {
  color:#A7A4FF;
  text-decoration:none;
}

.bf-demo-v4[data-theme="light"] > .bf-portal-footer a {
  color:var(--bf-primary);
}

.bf-demo-v4 > .bf-portal-footer a:hover {
  text-decoration:underline;
}

@media (min-width:1720px) {
  .bf-demo-v4-main {
    width:min(92vw,1720px);
  }

  .bf-demo-v4-grid {
    grid-template-columns:repeat(4,minmax(0,1fr));
  }
}

@media (max-width:1180px) {
  .bf-demo-v4-hero {
    grid-template-columns:1fr;
  }

  .bf-demo-v4-preview {
    min-height:300px;
  }

  .bf-demo-v4-grid {
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
}

@media (max-width:760px) {
  .bf-demo-v4-header-inner {
    padding:0 13px;
  }

  .bf-demo-v4-secure,
  .bf-demo-v4-user {
    display:none;
  }

  .bf-demo-v4-brand span {
    display:none;
  }

  .bf-demo-v4-main {
    width:100%;
    padding:22px 13px 28px;
  }

  .bf-demo-v4-hero-copy {
    padding:25px 20px;
  }

  .bf-demo-v4-hero h1 {
    font-size:38px;
  }

  .bf-demo-v4-preview-grid {
    grid-template-columns:1fr;
  }

  .bf-demo-v4-section-head {
    align-items:flex-start;
    flex-direction:column;
    gap:7px;
  }

  .bf-demo-v4-section-head > p {
    max-width:none;
    text-align:left;
  }

  .bf-demo-v4-grid {
    grid-template-columns:1fr;
  }

  .bf-demo-v4-card {
    min-height:280px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bf-demo-v4 *,
  .bf-demo-v4 *::before,
  .bf-demo-v4 *::after {
    animation-duration:.01ms!important;
    transition-duration:.01ms!important;
  }
}
/* BF_DEMO_PICKER_V4_END */
'@

$css = $css.TrimEnd() + "`r`n" + $v4Css + "`r`n"
Set-Content -Path $themePath -Value $css -Encoding utf8

Step "Verifying Demo Home V4"

$verifyDemo = Get-Content $demoPath -Raw
$verifyCss = Get-Content $themePath -Raw

$checks = @(
  @{Name="V4 root"; Value=$verifyDemo.Contains("bf-demo-v4")},
  @{Name="Visual dashboard preview"; Value=$verifyDemo.Contains("Demo Operations Console")},
  @{Name="Fleet mini data"; Value=$verifyDemo.Contains("bf-demo-v4-mini-data")},
  @{Name="Original footer"; Value=$verifyDemo.Contains("<PortalFooter/>")},
  @{Name="V4 CSS"; Value=$verifyCss.Contains("BF_DEMO_PICKER_V4_START")}
)

foreach ($check in $checks) {
  if (-not $check.Value) {
    throw "Verification failed: $($check.Name)"
  }
  Write-Host "  OK - $($check.Name)" -ForegroundColor Green
}

if (-not $SkipBuild) {
  Step "Running production build"
  npm run build
  if ($LASTEXITCODE -ne 0) {
    throw "Build failed. Backup: $backupRoot"
  }
}

Step "Demo Home V4 complete"

Write-Host ""
Write-Host "Changed files:" -ForegroundColor Green
Write-Host "  - src/clientPortal/DemoPortalApp.jsx"
Write-Host "  - src/clientPortal/clientPortalTheme.css"
Write-Host ""
git status --short
