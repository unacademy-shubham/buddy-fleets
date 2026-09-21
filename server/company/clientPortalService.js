import { createClient } from '@supabase/supabase-js';
import { resolveCompanyAccess } from './resolveCompanyAccess.js';

const PHOTO_BUCKET = 'company-profile-photos';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ACTIONS = ['view','create','edit','delete','approve','verify','print','export','manage'];
const ALWAYS_MODULES = ['dashboard','sites','vehicles','drivers','parties','reports','users_roles','settings','notifications'];
const PACK_MODULES = {
  travels: ['dashboard','sites','vehicles','drivers','parties','travel_enquiries','travel_quotations','travel_bookings','travel_availability','travel_tours','trips','route_planning','expenses','fuel','driver_payments','invoices','party_ledgers','compliance','maintenance','tyres','spare_parts','challans','reports','users_roles','settings','notifications'],
  bagged_cement: ['dashboard','sites','vehicles','drivers','parties','cement_placement','cement_queue','cement_loading','cement_dispatch','trips','dispatch','cement_delivery','epod','cement_tat','expenses','fuel','driver_payments','invoices','party_ledgers','compliance','maintenance','tyres','spare_parts','challans','reports','users_roles','settings','notifications'],
};
const BASIC_USER_MODULES = ['dashboard','vehicles','drivers','reports'];

function clean(value, max = 500) { return String(value ?? '').trim().slice(0, max); }
function nullable(value, max = 500) { const v = clean(value, max); return v || null; }
function num(value, fallback = null) { if (value === '' || value === null || value === undefined) return fallback; const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function date(value) { const v = clean(value, 20); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null; }
function datetime(value) { const v = clean(value, 60); const n = Date.parse(v); return Number.isFinite(n) ? new Date(n).toISOString() : null; }
function slug(value) { return clean(value, 80).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'') || 'viewer'; }
function uuidLike(value) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||'')); }
function normalizeGstin(value) { return clean(value, 15).toUpperCase().replace(/\s+/g,''); }
function validGstin(value) { return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value); }
function isOwnerRole(roleName, currentUser) { return currentUser?.isAccountOwner === true; }
function isAdminRole(roleName, currentUser) { return isOwnerRole(roleName,currentUser) || /company admin/i.test(String(roleName||'')); }
function allPermissions(enabled=true) { return Object.fromEntries(ACTIONS.map(a=>[a,Boolean(enabled)])); }
function viewPermission() { return {...allPermissions(false),view:true,print:true}; }
function normalizePermissionSet(value) { const v=value&&typeof value==='object'?value:{}; return Object.fromEntries(ACTIONS.map(a=>[a,Boolean(v[a])])); }
function normalizeModulePermissions(value) { const out={}; if(value&&typeof value==='object') for(const [k,v] of Object.entries(value)) out[clean(k,80)]=normalizePermissionSet(v); return out; }
function siteAllowed(userAccess, siteId) { if (!siteId) return true; return userAccess?.allSites === true || (userAccess?.siteIds || []).includes(siteId); }

async function one(db, table, queryBuilder) { const q=queryBuilder(db.from(table)); const {data,error}=await q; if(error) throw error; return data; }
async function audit(db,{companyId,userId,siteId=null,moduleKey=null,actionType,entityType=null,entityId=null,description='',beforeData=null,afterData=null}) {
  const {error}=await db.from('company_portal_audit').insert({company_id:companyId,user_id:userId,site_id:siteId,module_key:moduleKey,action_type:actionType,entity_type:entityType,entity_id:entityId?String(entityId):null,description:clean(description,1000),before_data:beforeData,after_data:afterData});
  if(error) console.error('Client portal audit failed:', error.message);
}

function packFor(settings) { return ['travels','bagged_cement'].includes(settings?.fleet_pack) ? settings.fleet_pack : 'travels'; }
function recommendedModules(settings) { const pack=packFor(settings); const custom=Array.isArray(settings?.enabled_modules)?settings.enabled_modules.filter(Boolean):[]; return [...new Set([...ALWAYS_MODULES,...(PACK_MODULES[pack]||[]),...custom])]; }

async function effectiveCompanyModules(db, companyId, settings) {
  const recommended = recommendedModules(settings);
  let platformAccess = null;
  try { platformAccess = await resolveCompanyAccess(db, companyId); } catch (e) { console.error('Client module resolver fallback:', e.message); }
  const platformMap = new Map((platformAccess?.modules||[]).map(m=>[m.module_key,m.access]));
  return recommended.filter(key => {
    if(!platformMap.has(key)) return true;
    return !['none','blocked'].includes(platformMap.get(key));
  });
}

async function ensureSettings(db, companyId) {
  let {data,error}=await db.from('company_portal_settings').select('*').eq('company_id',companyId).maybeSingle();
  if(error) throw error;
  if(data) return data;
  const ins=await db.from('company_portal_settings').insert({company_id:companyId,fleet_pack:'travels',enabled_packs:['travels']}).select('*').single();
  if(ins.error) throw ins.error;
  return ins.data;
}

async function loadCurrentEmployee(db, companyId, userId) {
  const [empR,accessR,profileR] = await Promise.all([
    db.from('developer_company_employees').select('*').eq('company_id',companyId).eq('user_id',userId).maybeSingle(),
    db.from('company_portal_user_access').select('*').eq('company_id',companyId).eq('user_id',userId).maybeSingle(),
    db.from('company_portal_user_profiles').select('*').eq('company_id',companyId).eq('user_id',userId).maybeSingle(),
  ]);
  if(empR.error && empR.error.code!=='42P01') throw empR.error;
  if(accessR.error) throw accessR.error;
  if(profileR.error) throw profileR.error;
  return {employee:empR.data||null,access:accessR.data||null,profile:profileR.data||null};
}

function buildUserAccess({employee,access,currentUser,companyModuleKeys,siteIds}) {
  const roleName=access?.role_name || employee?.role_key || (currentUser?.isAccountOwner?'Company Owner':'Viewer');
  const owner=isOwnerRole(roleName,currentUser), admin=isAdminRole(roleName,currentUser);
  let allowedSites = access?.all_sites || owner || admin ? siteIds : (Array.isArray(access?.site_ids)?access.site_ids:[]).filter(id=>siteIds.includes(id));
  const allSites = owner || admin || access?.all_sites === true;
  if(!allSites && !allowedSites.length && access?.primary_site_id && siteIds.includes(access.primary_site_id)) allowedSites=[access.primary_site_id];
  const rawPerms=normalizeModulePermissions(access?.permission_overrides);
  const rawMods=access?.module_overrides && typeof access.module_overrides==='object' ? access.module_overrides : {};
  const modulePermissions={};
  for(const key of companyModuleKeys){
    if(owner||admin) modulePermissions[key]=allPermissions(true);
    else if(rawPerms[key]) modulePermissions[key]=rawPerms[key];
    else if(rawMods[key]===true) modulePermissions[key]=viewPermission();
    else if(BASIC_USER_MODULES.includes(key)) modulePermissions[key]=viewPermission();
    else modulePermissions[key]=allPermissions(false);
  }
  const moduleKeys=companyModuleKeys.filter(k=>modulePermissions[k]?.view);
  return {roleName,allSites,siteIds:allSites?siteIds:allowedSites,primarySiteId:access?.primary_site_id||null,moduleKeys,companyModuleKeys,modulePermissions,isOwner:owner,isAdmin:admin,preferences:access?.preferences||{}};
}

function assertPermission(userAccess,moduleKey,action='view') {
  if(userAccess?.isOwner || userAccess?.isAdmin) return;
  const p=userAccess?.modulePermissions?.[moduleKey];
  if(!p?.[action] && !p?.manage) { const e=new Error('PERMISSION_DENIED'); e.status=403; e.code='PERMISSION_DENIED'; throw e; }
}
function assertSite(userAccess,siteId) { if(siteId && !siteAllowed(userAccess,siteId)){ const e=new Error('SITE_ACCESS_DENIED'); e.status=403; e.code='SITE_ACCESS_DENIED'; throw e; } }

async function signedUrl(db,path) { if(!path) return null; const {data,error}=await db.storage.from(PHOTO_BUCKET).createSignedUrl(path,60*30); if(error) return null; return data?.signedUrl||null; }
async function decoratePhotos(db,rows,pathKey='photo_path') { return Promise.all((rows||[]).map(async r=>({...r,photo_url:await signedUrl(db,r[pathKey])}))); }

async function bootstrap({db,companyId,userId,currentUser}) {
  const settings=await ensureSettings(db,companyId);
  const [companyR,sitesR,employeeCtx,employeesR,vehiclesR,driversR,partiesR,bookingsR,placementsR,dispatchesR,expensesR,sessionsR] = await Promise.all([
    db.from('companies').select('id,company_code,company_name,status,subdomain_slug').eq('id',companyId).single(),
    db.from('company_portal_sites').select('*').eq('company_id',companyId).neq('status','archived').order('is_primary',{ascending:false}).order('name'),
    loadCurrentEmployee(db,companyId,userId),
    db.from('developer_company_employees').select('*').eq('company_id',companyId).order('created_at'),
    db.from('company_portal_vehicles').select('*').eq('company_id',companyId).order('vehicle_number'),
    db.from('company_portal_drivers').select('*').eq('company_id',companyId).order('full_name'),
    db.from('company_portal_parties').select('*').eq('company_id',companyId).order('party_name'),
    db.from('company_portal_travel_bookings').select('*').eq('company_id',companyId).order('created_at',{ascending:false}).limit(500),
    db.from('company_portal_cement_placements').select('*').eq('company_id',companyId).order('requirement_date',{ascending:false}).limit(500),
    db.from('company_portal_cement_dispatches').select('*').eq('company_id',companyId).order('created_at',{ascending:false}).limit(500),
    db.from('company_portal_expenses').select('*').eq('company_id',companyId).order('expense_date',{ascending:false}).limit(1000),
    db.from('security_sessions').select('id,created_at,last_seen_at,ip_address,status').eq('company_id',companyId).eq('user_id',userId).order('created_at',{ascending:false}).limit(20),
  ]);
  for(const r of [companyR,sitesR,employeesR,vehiclesR,driversR,partiesR,bookingsR,placementsR,dispatchesR,expensesR,sessionsR]) if(r.error && r.error.code!=='42P01') throw r.error;
  const siteIds=(sitesR.data||[]).map(s=>s.id);
  const companyModuleKeys=await effectiveCompanyModules(db,companyId,settings);
  const userAccess=buildUserAccess({employee:employeeCtx.employee,access:employeeCtx.access,currentUser,companyModuleKeys,siteIds});
  const allowedSites=userAccess.allSites ? (sitesR.data||[]) : (sitesR.data||[]).filter(s=>userAccess.siteIds.includes(s.id));
  const scope=(rows,field)=> userAccess.allSites?rows:(rows||[]).filter(r=>!r[field]||userAccess.siteIds.includes(r[field]));
  const usersBase=employeesR.data||[];
  const userIds=usersBase.map(u=>u.user_id).filter(Boolean);
  let accessRows=[], profileRows=[], securityRows=[];
  if(userIds.length){
    const [a,p,s]=await Promise.all([
      db.from('company_portal_user_access').select('*').eq('company_id',companyId).in('user_id',userIds),
      db.from('company_portal_user_profiles').select('*').eq('company_id',companyId).in('user_id',userIds),
      db.from('user_security').select('user_id,mfa_enabled,is_locked').in('user_id',userIds),
    ]);
    if(a.error) throw a.error;if(p.error) throw p.error;if(s.error) throw s.error; accessRows=a.data||[];profileRows=p.data||[];securityRows=s.data||[];
  }
  const accessMap=new Map(accessRows.map(x=>[x.user_id,x])),profileMap=new Map(profileRows.map(x=>[x.user_id,x])),securityMap=new Map(securityRows.map(x=>[x.user_id,x]));
  const users=await decoratePhotos(db,usersBase.map(u=>{const a=accessMap.get(u.user_id)||{},p=profileMap.get(u.user_id)||{},sec=securityMap.get(u.user_id)||{};const visibleSiteIds=a.all_sites?siteIds:(a.site_ids||[]);return {...u,id:u.user_id,full_name:p.full_name||u.full_name,email:p.email||u.email,mobile:p.mobile||u.mobile,designation:p.designation||u.designation,department:p.department||'',role_name:a.role_name||u.role_key||'Viewer',site_ids:visibleSiteIds,site_names:(sitesR.data||[]).filter(s=>visibleSiteIds.includes(s.id)).map(s=>s.name),module_permissions:a.permission_overrides||{},module_keys:Object.entries(a.permission_overrides||{}).filter(([,v])=>v?.view).map(([k])=>k),mfa_enabled:sec.mfa_enabled===true,photo_path:p.photo_path||null};}));
  const drivers=await decoratePhotos(db,scope(driversR.data||[],'primary_site_id'));
  const selfProfile={...(employeeCtx.profile||{}),photo_url:await signedUrl(db,employeeCtx.profile?.photo_path)};
  return {
    ok:true,
    company:{...companyR.data,fleetPack:packFor(settings)},settings,sites:allowedSites,userAccess,
    data:{
      users: userAccess.modulePermissions?.users_roles?.view || userAccess.isAdmin ? users : [],
      vehicles: userAccess.modulePermissions?.vehicles?.view ? scope(vehiclesR.data||[],'home_site_id') : [],
      drivers: userAccess.modulePermissions?.drivers?.view ? drivers : [],
      parties: (userAccess.modulePermissions?.parties?.view || userAccess.modulePermissions?.party_ledgers?.view) ? (partiesR.data||[]) : [],
      bookings: userAccess.modulePermissions?.travel_bookings?.view ? scope((bookingsR.data||[]).map(x=>({...x,drop:x.drop_location})),'site_id') : [],
      placements: userAccess.modulePermissions?.cement_placement?.view ? scope(placementsR.data||[],'site_id') : [],
      dispatches: ['cement_dispatch','cement_delivery','cement_queue','cement_loading','cement_tat'].some(k=>userAccess.modulePermissions?.[k]?.view) ? scope(dispatchesR.data||[],'site_id') : [],
      expenses: userAccess.modulePermissions?.expenses?.view ? scope((expensesR.data||[]).map(x=>({...x,date:x.expense_date})),'site_id') : [],
      selfProfile,
      sessions:sessionsR.data||[],
    }
  };
}

function vehiclePayload(p){return {vehicle_number:clean(p.vehicle_number,30).toUpperCase(),vehicle_code:nullable(p.vehicle_code,50),vehicle_type:nullable(p.vehicle_type,100),body_type:nullable(p.body_type,120),ownership:clean(p.ownership,50)||'Own',home_site_id:uuidLike(p.home_site_id)?p.home_site_id:null,current_site_id:uuidLike(p.current_site_id)?p.current_site_id:null,status:clean(p.status,30)||'available',maker:nullable(p.maker,80),model:nullable(p.model,80),variant:nullable(p.variant,80),manufacturing_year:num(p.manufacturing_year),chassis_number:nullable(p.chassis_number,100),engine_number:nullable(p.engine_number,100),fuel_type:nullable(p.fuel_type,40),gvw:num(p.gvw),unladen_weight:num(p.unladen_weight),payload_mt:num(p.payload_mt),seating_capacity:num(p.seating_capacity),axle_count:num(p.axle_count),tyre_count:num(p.tyre_count),fuel_tank_capacity:num(p.fuel_tank_capacity),rc_number:nullable(p.rc_number,80),registration_date:date(p.registration_date),rc_validity:date(p.rc_validity),owner_name:nullable(p.owner_name,150),rto:nullable(p.rto,100),insurance_policy_no:nullable(p.insurance_policy_no,100),insurance_company:nullable(p.insurance_company,120),insurance_expiry:date(p.insurance_expiry),fitness_no:nullable(p.fitness_no,100),fitness_expiry:date(p.fitness_expiry),puc_no:nullable(p.puc_no,100),puc_expiry:date(p.puc_expiry),national_permit_no:nullable(p.national_permit_no,100),national_permit_expiry:date(p.national_permit_expiry),state_permit_no:nullable(p.state_permit_no,100),state_permit_expiry:date(p.state_permit_expiry)};}
function driverPayload(p){return {driver_code:nullable(p.driver_code,50),full_name:clean(p.full_name,150),father_name:nullable(p.father_name,150),dob:date(p.dob),blood_group:nullable(p.blood_group,20),mobile:clean(p.mobile,30),alternate_mobile:nullable(p.alternate_mobile,30),email:nullable(p.email,254),address:nullable(p.address,500),city:nullable(p.city,100),state:nullable(p.state,100),pincode:nullable(p.pincode,12),emergency_contact:nullable(p.emergency_contact,100),driver_type:clean(p.driver_type,80)||'Own Driver',joining_date:date(p.joining_date),primary_site_id:uuidLike(p.primary_site_id)?p.primary_site_id:null,status:clean(p.status,30)||'active',photo_path:nullable(p.photo_path,600),dl_number:nullable(p.dl_number,80),dl_class:nullable(p.dl_class,80),dl_issue_date:date(p.dl_issue_date),dl_expiry:date(p.dl_expiry),issuing_rto:nullable(p.issuing_rto,100),badge_number:nullable(p.badge_number,80),badge_expiry:date(p.badge_expiry),medical_fitness_date:date(p.medical_fitness_date),police_verification_status:nullable(p.police_verification_status,80)};}

async function assertTargetIsNotAccountOwner(db, companyId, targetUserId) {
  const {data,error}=await db.from('companies').select('account_owner_user_id').eq('id',companyId).maybeSingle();
  if(error) throw error;
  if(data?.account_owner_user_id===targetUserId){const e=new Error('OWNER_PROTECTED');e.status=409;e.code='OWNER_PROTECTED';throw e;}
}

async function action({db,companyId,userId,sessionId,currentUser,userAccess,actionName,payload}) {
  const p=payload||{};
  if(actionName==='create_site'){
    assertPermission(userAccess,'sites','create');
    const row={company_id:companyId,code:clean(p.code,50).toUpperCase(),name:clean(p.name,150),site_type:clean(p.site_type,80)||'Branch Office',address:nullable(p.address,500),city:nullable(p.city,100),state:nullable(p.state,100),pincode:nullable(p.pincode,12),is_primary:Boolean(p.is_primary),status:'active'};
    if(!row.code||!row.name) throw Object.assign(new Error('INVALID_SITE'),{status:400,code:'INVALID_SITE'});
    const r=await db.from('company_portal_sites').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,moduleKey:'sites',actionType:'create',entityType:'site',entityId:r.data.id,description:`Created site ${r.data.name}`,afterData:r.data});return {ok:true,site:r.data};
  }
  if(actionName==='create_vehicle'){
    assertPermission(userAccess,'vehicles','create'); const row={company_id:companyId,...vehiclePayload(p)}; assertSite(userAccess,row.home_site_id); if(!row.vehicle_number) throw Object.assign(new Error('INVALID_VEHICLE'),{status:400,code:'INVALID_VEHICLE'}); const r=await db.from('company_portal_vehicles').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,siteId:row.home_site_id,moduleKey:'vehicles',actionType:'create',entityType:'vehicle',entityId:r.data.id,description:`Added vehicle ${r.data.vehicle_number}`});return {ok:true,vehicle:r.data};
  }
  if(actionName==='create_driver'){
    assertPermission(userAccess,'drivers','create'); const row={company_id:companyId,...driverPayload(p)};assertSite(userAccess,row.primary_site_id);if(!row.full_name||!row.mobile)throw Object.assign(new Error('INVALID_DRIVER'),{status:400,code:'INVALID_DRIVER'});const r=await db.from('company_portal_drivers').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,siteId:row.primary_site_id,moduleKey:'drivers',actionType:'create',entityType:'driver',entityId:r.data.id,description:`Added driver ${r.data.full_name}`});return {ok:true,driver:{...r.data,photo_url:await signedUrl(db,r.data.photo_path)}};
  }
  if(actionName==='create_party'){
    assertPermission(userAccess,'parties','create'); const gstin=normalizeGstin(p.gstin); const row={company_id:companyId,party_name:clean(p.party_name,180),party_type:clean(p.party_type,80)||'Customer',gstin:gstin||null,legal_name:nullable(p.legal_name,250),trade_name:nullable(p.trade_name,250),gst_status:nullable(p.gst_status,80),gst_verified:Boolean(p.gst_verified),gst_verified_at:p.gst_verified?new Date().toISOString():null,pan:nullable(p.pan,20),address:nullable(p.address,700),city:nullable(p.city,120),state:nullable(p.state,120),state_code:nullable(p.state_code,5),pincode:nullable(p.pincode,12),mobile:nullable(p.mobile,30),email:nullable(p.email,254),credit_days:num(p.credit_days,0),status:'active'};if(!row.party_name)throw Object.assign(new Error('INVALID_PARTY'),{status:400,code:'INVALID_PARTY'});const r=await db.from('company_portal_parties').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,moduleKey:'parties',actionType:'create',entityType:'party',entityId:r.data.id,description:`Added party ${r.data.party_name}`});return {ok:true,party:r.data};
  }
  if(actionName==='create_expense'){
    assertPermission(userAccess,'expenses','create'); const siteId=uuidLike(p.site_id)?p.site_id:null;assertSite(userAccess,siteId);const amount=num(p.amount);if(amount===null||amount<0)throw Object.assign(new Error('INVALID_EXPENSE'),{status:400,code:'INVALID_EXPENSE'});const row={company_id:companyId,site_id:siteId,expense_date:date(p.date)||new Date().toISOString().slice(0,10),category:clean(p.category,100)||'Other',amount,gst_amount:num(p.gst_amount,0)||0,vehicle_number:nullable(p.vehicle_number,30),driver_name:nullable(p.driver_name,150),vendor:nullable(p.vendor,180),payment_mode:nullable(p.payment_mode,50),reference_no:nullable(p.reference_no,120),bill_no:nullable(p.bill_no,120),bill_date:date(p.bill_date),remarks:nullable(p.remarks,1000),created_by:userId};const r=await db.from('company_portal_expenses').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,siteId,moduleKey:'expenses',actionType:'create',entityType:'expense',entityId:r.data.id,description:`Recorded ${row.category} expense`});return {ok:true,expense:{...r.data,date:r.data.expense_date}};
  }
  if(actionName==='create_booking'){
    assertPermission(userAccess,'travel_bookings','create');const siteId=uuidLike(p.site_id)?p.site_id:null;assertSite(userAccess,siteId);if(!siteId)throw Object.assign(new Error('SITE_REQUIRED'),{status:400,code:'SITE_REQUIRED'});const row={company_id:companyId,site_id:siteId,booking_no:clean(p.booking_no,80),customer:clean(p.customer,180),pickup:clean(p.pickup,250),drop_location:clean(p.drop,250),pickup_at:datetime(p.pickup_at),return_at:datetime(p.return_at),trip_type:nullable(p.trip_type,80),vehicle_category:nullable(p.vehicle_category,100),vehicle_number:nullable(p.vehicle_number,30),driver_name:nullable(p.driver_name,150),passenger_count:num(p.passenger_count),rate_type:nullable(p.rate_type,80),estimated_km:num(p.estimated_km),amount:num(p.amount,0)||0,advance:num(p.advance,0)||0,payment_status:clean(p.payment_status,40)||'pending',status:clean(p.status,40)||'confirmed',special_instructions:nullable(p.special_instructions,1000)};if(!row.booking_no||!row.customer||!row.pickup||!row.drop_location)throw Object.assign(new Error('INVALID_BOOKING'),{status:400,code:'INVALID_BOOKING'});const r=await db.from('company_portal_travel_bookings').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,siteId,moduleKey:'travel_bookings',actionType:'create',entityType:'booking',entityId:r.data.id,description:`Created booking ${row.booking_no}`});return {ok:true,booking:{...r.data,drop:r.data.drop_location}};
  }
  if(actionName==='create_placement'){
    assertPermission(userAccess,'cement_placement','create');const siteId=uuidLike(p.site_id)?p.site_id:null;assertSite(userAccess,siteId);if(!siteId)throw Object.assign(new Error('SITE_REQUIRED'),{status:400,code:'SITE_REQUIRED'});const row={company_id:companyId,site_id:siteId,placement_no:clean(p.placement_no,80),requirement_date:date(p.requirement_date)||new Date().toISOString().slice(0,10),required_vehicles:num(p.required_vehicles,0)||0,assigned_vehicles:num(p.assigned_vehicles,0)||0,reported_vehicles:num(p.reported_vehicles,0)||0,loaded_vehicles:num(p.loaded_vehicles,0)||0,status:clean(p.status,40)||'open',notes:nullable(p.notes,1000)};const r=await db.from('company_portal_cement_placements').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,siteId,moduleKey:'cement_placement',actionType:'create',entityType:'placement',entityId:r.data.id,description:`Created placement ${row.placement_no}`});return {ok:true,placement:r.data};
  }
  if(actionName==='create_dispatch'){
    assertPermission(userAccess,'cement_dispatch','create');const siteId=uuidLike(p.site_id)?p.site_id:null;assertSite(userAccess,siteId);if(!siteId)throw Object.assign(new Error('SITE_REQUIRED'),{status:400,code:'SITE_REQUIRED'});const row={company_id:companyId,site_id:siteId,dispatch_no:clean(p.dispatch_no,80),vehicle_number:clean(p.vehicle_number,30).toUpperCase(),driver_name:nullable(p.driver_name,150),dealer:nullable(p.dealer,180),destination:nullable(p.destination,250),material:clean(p.material,120)||'Bagged Cement',bags:num(p.bags,0)||0,gross_weight_mt:num(p.gross_weight_mt),tare_weight_mt:num(p.tare_weight_mt),net_weight_mt:num(p.net_weight_mt),loading_slip_no:nullable(p.loading_slip_no,100),weighbridge_slip_no:nullable(p.weighbridge_slip_no,100),reported_at:datetime(p.reported_at),loading_started_at:datetime(p.loading_started_at),dispatched_at:datetime(p.dispatched_at),delivered_at:datetime(p.delivered_at),received_by:nullable(p.received_by,150),receiver_mobile:nullable(p.receiver_mobile,30),pod_number:nullable(p.pod_number,100),pod_status:clean(p.pod_status,40)||'pending',shortage_bags:num(p.shortage_bags,0)||0,damage_bags:num(p.damage_bags,0)||0,turnaround_hours:num(p.turnaround_hours),detention_hours:num(p.detention_hours),status:clean(p.status,50)||'at_plant',remarks:nullable(p.remarks,1000)};if(!row.dispatch_no||!row.vehicle_number)throw Object.assign(new Error('INVALID_DISPATCH'),{status:400,code:'INVALID_DISPATCH'});const r=await db.from('company_portal_cement_dispatches').insert(row).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,siteId,moduleKey:'cement_dispatch',actionType:'create',entityType:'dispatch',entityId:r.data.id,description:`Created dispatch ${row.dispatch_no}`});return {ok:true,dispatch:r.data};
  }
  if(actionName==='save_settings'){
    assertPermission(userAccess,'settings','edit'); const fleetPack=['travels','bagged_cement'].includes(p.fleet_pack)?p.fleet_pack:'travels'; const patch={fleet_pack:fleetPack,enabled_packs:[fleetPack],company_display_name:nullable(p.company_display_name,200),default_scope:p.default_scope==='primary'?'primary':'all',date_format:['DD/MM/YYYY','YYYY-MM-DD'].includes(p.date_format)?p.date_format:'DD/MM/YYYY',time_format:p.time_format==='24h'?'24h':'12h',updated_at:new Date().toISOString()};const r=await db.from('company_portal_settings').upsert({company_id:companyId,...patch},{onConflict:'company_id'}).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,moduleKey:'settings',actionType:'edit',entityType:'company_settings',entityId:companyId,description:'Updated company portal settings',afterData:patch});return {ok:true,settings:r.data};
  }
  if(actionName==='save_profile'){
    const existing=await db.from('company_portal_user_profiles').select('*').eq('company_id',companyId).eq('user_id',userId).maybeSingle();if(existing.error)throw existing.error;const patch={company_id:companyId,user_id:userId,full_name:nullable(p.full_name,150),mobile:nullable(p.mobile,30),alternate_mobile:nullable(p.alternate_mobile,30),designation:nullable(p.designation,120),address:nullable(p.address,600),emergency_contact:nullable(p.emergency_contact,120),updated_at:new Date().toISOString()};const r=await db.from('company_portal_user_profiles').upsert({...existing.data,...patch},{onConflict:'company_id,user_id'}).select('*').single();if(r.error)throw r.error;await audit(db,{companyId,userId,moduleKey:'profile',actionType:'edit',entityType:'user_profile',entityId:userId,description:'Updated profile'});return {ok:true,profile:r.data};
  }
  if(actionName==='create_user'){
    assertPermission(userAccess,'users_roles','create'); if(!userAccess.isAdmin) throw Object.assign(new Error('ADMIN_REQUIRED'),{status:403,code:'ADMIN_REQUIRED'});const requestedRole=clean(p.role_name,100)||'Viewer';if(/company owner/i.test(requestedRole))throw Object.assign(new Error('OWNER_ROLE_PROTECTED'),{status:409,code:'OWNER_ROLE_PROTECTED'});const fullName=clean(p.full_name,150),email=clean(p.email,254).toLowerCase(),password=String(p.temporary_password||'');if(!fullName||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<8)throw Object.assign(new Error('INVALID_USER'),{status:400,code:'INVALID_USER'});const created=await db.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:fullName,mobile:clean(p.mobile,30),created_via:'company_portal'}});if(created.error)throw created.error;const newUserId=created.data.user.id;try{const m=await db.from('company_memberships').insert({company_id:companyId,user_id:newUserId,status:'active',access_scope:'company',joined_at:new Date().toISOString()});if(m.error)throw m.error;const emp=await db.from('developer_company_employees').insert({company_id:companyId,user_id:newUserId,full_name:fullName,email,mobile:nullable(p.mobile,30),employee_code:nullable(p.employee_code,50),designation:nullable(p.designation,120),branch:null,role_key:slug(requestedRole),status:'active',force_password_change:Boolean(p.force_password_change),created_by:userId,updated_by:userId}).select('*').single();if(emp.error)throw emp.error;const siteIds=Array.isArray(p.site_ids)?p.site_ids.filter(uuidLike):[];for(const s of siteIds)assertSite(userAccess,s);const a=await db.from('company_portal_user_access').insert({company_id:companyId,user_id:newUserId,role_name:requestedRole,primary_site_id:uuidLike(p.primary_site_id)?p.primary_site_id:null,site_ids:siteIds,all_sites:false,permission_overrides:{dashboard:viewPermission(),vehicles:viewPermission(),drivers:viewPermission(),reports:viewPermission()},force_password_change:Boolean(p.force_password_change)});if(a.error)throw a.error;const pr=await db.from('company_portal_user_profiles').insert({company_id:companyId,user_id:newUserId,employee_code:nullable(p.employee_code,50),full_name:fullName,designation:nullable(p.designation,120),department:nullable(p.department,120),mobile:nullable(p.mobile,30),email,photo_path:nullable(p.photo_path,600)});if(pr.error)throw pr.error;await audit(db,{companyId,userId,moduleKey:'users_roles',actionType:'create',entityType:'user',entityId:newUserId,description:`Created user ${fullName}`});return {ok:true,user_id:newUserId};}catch(e){await db.auth.admin.deleteUser(newUserId).catch(()=>{});throw e;}
  }
  if(actionName==='save_user_access'){
    assertPermission(userAccess,'users_roles','manage');if(!userAccess.isAdmin)throw Object.assign(new Error('ADMIN_REQUIRED'),{status:403,code:'ADMIN_REQUIRED'});const target=clean(p.user_id,80);if(!uuidLike(target))throw Object.assign(new Error('INVALID_USER'),{status:400,code:'INVALID_USER'});const companyEmp=await db.from('developer_company_employees').select('user_id,role_key').eq('company_id',companyId).eq('user_id',target).maybeSingle();if(companyEmp.error)throw companyEmp.error;if(!companyEmp.data)throw Object.assign(new Error('USER_NOT_FOUND'),{status:404,code:'USER_NOT_FOUND'});await assertTargetIsNotAccountOwner(db,companyId,target);if(/company owner/i.test(clean(p.role_name,100)))throw Object.assign(new Error('OWNER_ROLE_PROTECTED'),{status:409,code:'OWNER_ROLE_PROTECTED'});const siteIds=Array.isArray(p.site_ids)?p.site_ids.filter(uuidLike):[];for(const s of siteIds)assertSite(userAccess,s);const modulePermissions=normalizeModulePermissions(p.module_permissions);for(const key of Object.keys(modulePermissions))if(!userAccess.companyModuleKeys.includes(key))delete modulePermissions[key];const row={company_id:companyId,user_id:target,role_name:clean(p.role_name,100)||'Viewer',site_ids:siteIds,all_sites:Boolean(p.all_sites)&&userAccess.isAdmin,permission_overrides:modulePermissions,module_overrides:Object.fromEntries(Object.entries(modulePermissions).map(([k,v])=>[k,Boolean(v.view)])),updated_at:new Date().toISOString()};const r=await db.from('company_portal_user_access').upsert(row,{onConflict:'company_id,user_id'}).select('*').single();if(r.error)throw r.error;await db.from('developer_company_employees').update({role_key:slug(row.role_name),updated_by:userId,updated_at:new Date().toISOString()}).eq('company_id',companyId).eq('user_id',target);await audit(db,{companyId,userId,moduleKey:'users_roles',actionType:'manage',entityType:'user_access',entityId:target,description:'Updated user modules, actions and site access'});return {ok:true,access:r.data};
  }
  if(['block_user','unblock_user','disable_user','revoke_user_sessions'].includes(actionName)){
    assertPermission(userAccess,'users_roles','manage');if(!userAccess.isAdmin)throw Object.assign(new Error('ADMIN_REQUIRED'),{status:403,code:'ADMIN_REQUIRED'});const target=clean(p.user_id,80);await assertTargetIsNotAccountOwner(db,companyId,target);const emp=await db.from('developer_company_employees').select('user_id,status').eq('company_id',companyId).eq('user_id',target).maybeSingle();if(emp.error)throw emp.error;if(!emp.data)throw Object.assign(new Error('USER_NOT_FOUND'),{status:404,code:'USER_NOT_FOUND'});if(actionName!=='revoke_user_sessions'){const next=actionName==='block_user'?'blocked':actionName==='disable_user'?'disabled':'active';const u=await db.from('developer_company_employees').update({status:next,updated_by:userId,updated_at:new Date().toISOString()}).eq('company_id',companyId).eq('user_id',target);if(u.error)throw u.error;}if(actionName!=='unblock_user'){const rev=await db.from('security_sessions').update({status:'revoked',revoked_at:new Date().toISOString(),revoke_reason:`COMPANY_${actionName.toUpperCase()}`}).eq('company_id',companyId).eq('user_id',target).eq('status','active');if(rev.error)throw rev.error;}await audit(db,{companyId,userId,moduleKey:'users_roles',actionType:actionName,entityType:'user',entityId:target,description:actionName.replaceAll('_',' ')});return {ok:true,status:actionName==='unblock_user'?'active':actionName==='block_user'?'blocked':actionName==='disable_user'?'disabled':'sessions_revoked'};
  }
  if(actionName==='reset_user_password'){
    assertPermission(userAccess,'users_roles','manage');if(!userAccess.isAdmin)throw Object.assign(new Error('ADMIN_REQUIRED'),{status:403,code:'ADMIN_REQUIRED'});const target=clean(p.user_id,80),password=String(p.temporary_password||'');await assertTargetIsNotAccountOwner(db,companyId,target);if(password.length<8)throw Object.assign(new Error('INVALID_PASSWORD'),{status:400,code:'INVALID_PASSWORD'});const emp=await db.from('developer_company_employees').select('user_id').eq('company_id',companyId).eq('user_id',target).maybeSingle();if(emp.error)throw emp.error;if(!emp.data)throw Object.assign(new Error('USER_NOT_FOUND'),{status:404,code:'USER_NOT_FOUND'});const u=await db.auth.admin.updateUserById(target,{password});if(u.error)throw u.error;await db.from('developer_company_employees').update({force_password_change:Boolean(p.force_password_change),updated_by:userId,updated_at:new Date().toISOString()}).eq('company_id',companyId).eq('user_id',target);await db.from('company_portal_user_access').upsert({company_id:companyId,user_id:target,force_password_change:Boolean(p.force_password_change),updated_at:new Date().toISOString()},{onConflict:'company_id,user_id'});await db.from('security_sessions').update({status:'revoked',revoked_at:new Date().toISOString(),revoke_reason:'PASSWORD_RESET_BY_COMPANY_ADMIN'}).eq('company_id',companyId).eq('user_id',target).eq('status','active');await audit(db,{companyId,userId,moduleKey:'users_roles',actionType:'password_reset',entityType:'user',entityId:target,description:'Admin reset user password and revoked active sessions'});return {ok:true};
  }
  if(actionName==='change_password'){
    const current=String(p.current_password||''),next=String(p.new_password||'');if(current.length<1||next.length<8)throw Object.assign(new Error('INVALID_PASSWORD'),{status:400,code:'INVALID_PASSWORD'});if(!SUPABASE_URL||!SERVICE_KEY)throw new Error('AUTH_ENV_MISSING');const profile=await db.from('profiles').select('email').eq('id',userId).maybeSingle();if(profile.error)throw profile.error;const email=profile.data?.email||currentUser?.email;if(!email)throw Object.assign(new Error('EMAIL_NOT_FOUND'),{status:400,code:'EMAIL_NOT_FOUND'});const verifier=createClient(SUPABASE_URL,SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});const sign=await verifier.auth.signInWithPassword({email,password:current});if(sign.error||sign.data?.user?.id!==userId)throw Object.assign(new Error('CURRENT_PASSWORD_INVALID'),{status:401,code:'CURRENT_PASSWORD_INVALID'});const u=await db.auth.admin.updateUserById(userId,{password:next});if(u.error)throw u.error;await db.from('security_sessions').update({status:'revoked',revoked_at:new Date().toISOString(),revoke_reason:'PASSWORD_CHANGED'}).eq('company_id',companyId).eq('user_id',userId).eq('status','active').neq('id',sessionId);await audit(db,{companyId,userId,moduleKey:'profile',actionType:'password_change',entityType:'user',entityId:userId,description:'User changed password'});return {ok:true};
  }
  if(actionName==='revoke_other_sessions'){
    const r=await db.from('security_sessions').update({status:'revoked',revoked_at:new Date().toISOString(),revoke_reason:'USER_REVOKED_OTHER_SESSIONS'}).eq('company_id',companyId).eq('user_id',userId).eq('status','active').neq('id',sessionId);if(r.error)throw r.error;await audit(db,{companyId,userId,moduleKey:'profile',actionType:'session_revoke',entityType:'user',entityId:userId,description:'User revoked other sessions'});return {ok:true};
  }
  if(actionName==='upload_photo'){
    const ownerType=clean(p.ownerType,20),ownerId=clean(p.ownerId,80);if(!['user','driver'].includes(ownerType))throw Object.assign(new Error('INVALID_PHOTO_TARGET'),{status:400,code:'INVALID_PHOTO_TARGET'});if(ownerType==='user'&&ownerId!==userId){assertPermission(userAccess,'users_roles','edit');if(!userAccess.isAdmin)throw Object.assign(new Error('ADMIN_REQUIRED'),{status:403,code:'ADMIN_REQUIRED'});}if(ownerType==='driver')assertPermission(userAccess,'drivers','edit');const match=String(p.dataUrl||'').match(/^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/);if(!match)throw Object.assign(new Error('INVALID_IMAGE'),{status:400,code:'INVALID_IMAGE'});const bytes=Buffer.from(match[2],'base64');if(bytes.length>1048576)throw Object.assign(new Error('IMAGE_TOO_LARGE'),{status:413,code:'IMAGE_TOO_LARGE'});const ext=match[1]==='jpg'?'jpeg':match[1];const finalOwnerId=uuidLike(ownerId)?ownerId:`pending-${crypto.randomUUID()}`;const path=`company/${companyId}/${ownerType}s/${finalOwnerId}.${ext==='jpeg'?'jpg':ext}`;const up=await db.storage.from(PHOTO_BUCKET).upload(path,bytes,{contentType:`image/${ext}`,upsert:true});if(up.error)throw up.error;if(ownerType==='user'&&uuidLike(ownerId)){const r=await db.from('company_portal_user_profiles').upsert({company_id:companyId,user_id:ownerId,photo_path:path,updated_at:new Date().toISOString()},{onConflict:'company_id,user_id'});if(r.error)throw r.error;}if(ownerType==='driver'&&uuidLike(ownerId)){const r=await db.from('company_portal_drivers').update({photo_path:path,updated_at:new Date().toISOString()}).eq('company_id',companyId).eq('id',ownerId);if(r.error)throw r.error;}return {ok:true,path,photoUrl:await signedUrl(db,path)};
  }
  if(actionName==='gst_lookup'){
    const gstin=normalizeGstin(p.gstin);if(!validGstin(gstin))throw Object.assign(new Error('INVALID_GSTIN'),{status:400,code:'INVALID_GSTIN'});const existing=await db.from('company_portal_parties').select('*').eq('company_id',companyId).eq('gstin',gstin).maybeSingle();if(existing.error)throw existing.error;if(existing.data)return {ok:true,source:'existing_party',gst:{gstin,legalName:existing.data.legal_name||'',tradeName:existing.data.trade_name||existing.data.party_name||'',status:existing.data.gst_status||'',address:existing.data.address||'',city:existing.data.city||'',state:existing.data.state||'',stateCode:existing.data.state_code||gstin.slice(0,2),pincode:existing.data.pincode||'',pan:existing.data.pan||gstin.slice(2,12),verified:existing.data.gst_verified===true}};const url=process.env.GST_LOOKUP_URL;if(!url)return {ok:false,code:'GST_PROVIDER_NOT_CONFIGURED',message:'GST lookup provider is not configured.'};const headers={'Content-Type':'application/json','Accept':'application/json'};if(process.env.GST_LOOKUP_BEARER_TOKEN)headers.Authorization=`Bearer ${process.env.GST_LOOKUP_BEARER_TOKEN}`;if(process.env.GST_LOOKUP_API_KEY)headers['X-API-Key']=process.env.GST_LOOKUP_API_KEY;const resp=await fetch(url,{method:'POST',headers,body:JSON.stringify({gstin}),signal:AbortSignal.timeout(8000)});const json=await resp.json().catch(()=>({}));if(!resp.ok)throw Object.assign(new Error('GST_LOOKUP_FAILED'),{status:502,code:'GST_LOOKUP_FAILED'});const d=json.data||json.result||json;return {ok:true,source:'provider',gst:{gstin,legalName:d.legal_name||d.legalName||d.lgnm||'',tradeName:d.trade_name||d.tradeName||d.tradeNam||'',status:d.status||d.gst_status||d.sts||'',address:d.address||d.pradr?.adr||'',city:d.city||'',state:d.state||'',stateCode:d.state_code||gstin.slice(0,2),pincode:d.pincode||d.pin||'',pan:gstin.slice(2,12),verified:true}};
  }
  throw Object.assign(new Error('INVALID_ACTION'),{status:400,code:'INVALID_ACTION'});
}

export async function getClientPortalBootstrap(args){return bootstrap(args);}
export async function runClientPortalAction(args){
  const settings=await ensureSettings(args.db,args.companyId);
  const sitesR=await args.db.from('company_portal_sites').select('id').eq('company_id',args.companyId).neq('status','archived');if(sitesR.error)throw sitesR.error;
  const employeeCtx=await loadCurrentEmployee(args.db,args.companyId,args.userId);
  const companyModuleKeys=await effectiveCompanyModules(args.db,args.companyId,settings);
  const userAccess=buildUserAccess({employee:employeeCtx.employee,access:employeeCtx.access,currentUser:args.currentUser,companyModuleKeys,siteIds:(sitesR.data||[]).map(s=>s.id)});
  return action({...args,userAccess});
}
