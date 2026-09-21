import {
  clearDeveloperSessionCookie,
  requireDeveloperSession,
  setDeveloperApiHeaders,
} from '../../server/auth/requireDeveloperSession.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function send(res, status, payload) {
  setDeveloperApiHeaders(res);
  return res.status(status).json(payload);
}
function clean(value, max = 5000) { return String(value ?? '').trim().slice(0, max); }
function money(value) { const n = Number(value); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; }
function asDate(value) { if (!value) return null; const t = Date.parse(value); return Number.isFinite(t) ? new Date(t).toISOString().slice(0,10) : undefined; }

async function history(db, actorUserId, companyId, action, details = {}) {
  try {
    await db.from('developer_saas_history').insert({
      domain: 'company_360', entity_id: companyId, action,
      before_payload: null, after_payload: details, actor_user_id: actorUserId || null,
    });
  } catch {}
}

async function loadCompany(db, companyId) {
  const { data: company, error } = await db.from('companies')
    .select('id,company_code,company_name,status,confirmed_at,account_owner_user_id,subdomain_slug')
    .eq('id', companyId).maybeSingle();
  if (error) throw error;
  if (!company) return null;

  const [profileR, subscriptionR, overrideR, plansR, employeesR, invoicesR, paymentsR, documentsR, announcementsR, notesR, modulesR, portalR, policiesR] = await Promise.all([
    db.from('developer_company_profiles').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('subscriptions').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_company_overrides').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_plans').select('*').order('display_order', { ascending: true }),
    db.from('developer_company_employees').select('*').eq('company_id', companyId).order('created_at', { ascending: true }),
    db.from('developer_company_invoices').select('*').eq('company_id', companyId).order('invoice_date', { ascending: false }),
    db.from('developer_company_payments').select('*').eq('company_id', companyId).order('payment_date', { ascending: false }),
    db.from('developer_company_documents').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
    db.from('developer_company_announcements').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(100),
    db.from('developer_company_notes').select('*').eq('company_id', companyId).order('created_at', { ascending: false }).limit(200),
    db.from('developer_module_catalog').select('*').order('sort_order', { ascending: true }),
    db.from('developer_company_portal_config').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_lifecycle_access_policy').select('*'),
  ]);
  for (const r of [profileR,subscriptionR,overrideR,plansR,employeesR,invoicesR,paymentsR,documentsR,announcementsR,notesR,modulesR,portalR,policiesR]) {
    if (r.error) throw r.error;
  }

  const subscription = subscriptionR.data || null;
  const override = overrideR.data || null;
  const plans = plansR.data || [];
  const planKey = override?.enabled && override?.plan_key ? override.plan_key : subscription?.plan_id || '';
  const plan = plans.find((p) => p.plan_key === planKey || p.id === planKey) || null;
  const lifecycle = Object.fromEntries((policiesR.data || []).map((p) => [p.policy_key, p.config]));
  const baseLimits = plan?.limits || {};
  const effectiveLimits = { ...baseLimits, ...(override?.enabled ? (override?.limits_override || {}) : {}) };
  const planEntitlements = new Set(Array.isArray(plan?.entitlements) ? plan.entitlements : []);
  const overrideEntitlements = new Set(Array.isArray(override?.entitlements_override) ? override.entitlements_override : []);
  const expired = ['trial_expired'].includes(company.status) || ['expired','past_due'].includes(subscription?.status);
  const trial = company.status === 'trial_active' || subscription?.status === 'trial_active';
  const suspended = company.status === 'suspended';

  const effectiveModules = (modulesR.data || []).map((m) => {
    let access = planEntitlements.has(m.module_key) ? 'full' : 'none';
    if (trial) access = m.trial_access || access;
    if (expired) access = m.expired_access === 'read_only' ? 'read_only' : m.expired_access === 'hidden' ? 'none' : 'blocked';
    if (suspended) access = 'blocked';
    if (override?.enabled && overrideEntitlements.has(m.module_key)) access = 'full';
    return { ...m, effective_access: access };
  });

  const totalInvoiced = (invoicesR.data || []).reduce((s, i) => s + Number(i.grand_total || 0), 0);
  const totalPaid = (paymentsR.data || []).filter((p) => p.status === 'verified').reduce((s,p)=>s+Number(p.amount||0),0);

  return {
    company,
    profile: profileR.data || null,
    subscription,
    override,
    plans,
    employees: employeesR.data || [],
    invoices: invoicesR.data || [],
    payments: paymentsR.data || [],
    documents: documentsR.data || [],
    announcements: announcementsR.data || [],
    notes: notesR.data || [],
    modules: effectiveModules,
    portalConfig: portalR.data || null,
    lifecycle,
    effective: { planKey, plan, limits: effectiveLimits, modules: effectiveModules },
    billingSummary: { totalInvoiced, totalPaid, outstanding: Math.max(0, totalInvoiced - totalPaid) },
  };
}

async function employeeAction(db, actor, companyId, body) {
  const action = clean(body.action, 50);
  if (action === 'create_employee') {
    const fullName = clean(body.fullName, 150);
    const email = clean(body.email, 254).toLowerCase();
    const password = String(body.password || '');
    if (!fullName || !EMAIL.test(email) || password.length < 8) return { status:400, payload:{ok:false,code:'INVALID_EMPLOYEE'} };
    const { data: created, error: authError } = await db.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: fullName, mobile: clean(body.mobile, 30), created_via: 'developer_company_360' },
    });
    if (authError) return { status:409, payload:{ok:false,code:'AUTH_USER_CREATE_FAILED',message:authError.message} };
    const userId = created.user.id;
    try {
      const membership = await db.from('company_memberships').insert({
        company_id: companyId, user_id: userId, status: 'active', access_scope: 'company', joined_at: new Date().toISOString(),
      });
      if (membership.error) throw membership.error;
      const emp = await db.from('developer_company_employees').insert({
        company_id: companyId, user_id: userId, full_name: fullName, email,
        mobile: clean(body.mobile,30), employee_code: clean(body.employeeCode,50), designation: clean(body.designation,120),
        branch: clean(body.branch,120), role_key: clean(body.roleKey,80) || 'viewer', status: 'active',
        force_password_change: Boolean(body.forcePasswordChange), notes: clean(body.notes,2000), created_by: actor, updated_by: actor,
      }).select('*').single();
      if (emp.error) throw emp.error;
      await history(db, actor, companyId, 'employee_create', { user_id:userId, email, role_key:emp.data.role_key });
      return { status:201, payload:{ok:true,employee:emp.data} };
    } catch (error) {
      await db.auth.admin.deleteUser(userId).catch(()=>{});
      throw error;
    }
  }

  const employeeId = clean(body.employeeId, 80);
  const { data: emp, error } = await db.from('developer_company_employees').select('*').eq('id', employeeId).eq('company_id', companyId).maybeSingle();
  if (error) throw error;
  if (!emp) return { status:404, payload:{ok:false,code:'EMPLOYEE_NOT_FOUND'} };

  if (action === 'reset_password') {
    const password = String(body.password || '');
    if (password.length < 8) return { status:400, payload:{ok:false,code:'INVALID_PASSWORD'} };
    const { error: authError } = await db.auth.admin.updateUserById(emp.user_id, { password });
    if (authError) throw authError;
    await db.from('developer_company_employees').update({ force_password_change:Boolean(body.forcePasswordChange), updated_by:actor, updated_at:new Date().toISOString() }).eq('id', emp.id);
    await history(db, actor, companyId, 'employee_password_reset', { employee_id: emp.id });
    return { status:200, payload:{ok:true} };
  }
  if (['block_employee','unblock_employee','disable_employee'].includes(action)) {
    const next = action === 'block_employee' ? 'blocked' : action === 'disable_employee' ? 'disabled' : 'active';
    await db.from('developer_company_employees').update({ status:next, updated_by:actor, updated_at:new Date().toISOString() }).eq('id', emp.id);
    if (next !== 'active') {
      await db.from('security_sessions').update({ status:'revoked', revoked_at:new Date().toISOString(), revoke_reason:'COMPANY_EMPLOYEE_BLOCKED' }).eq('company_id', companyId).eq('user_id', emp.user_id).eq('status','active');
    }
    await history(db, actor, companyId, action, { employee_id:emp.id, status:next });
    return { status:200, payload:{ok:true,status:next} };
  }
  if (action === 'update_employee') {
    const patch = {
      full_name: clean(body.fullName ?? emp.full_name,150), mobile: clean(body.mobile ?? emp.mobile,30),
      employee_code: clean(body.employeeCode ?? emp.employee_code,50), designation: clean(body.designation ?? emp.designation,120),
      branch: clean(body.branch ?? emp.branch,120), role_key: clean(body.roleKey ?? emp.role_key,80) || 'viewer',
      notes: clean(body.notes ?? emp.notes,2000), updated_by:actor, updated_at:new Date().toISOString(),
    };
    const { data, error: uErr } = await db.from('developer_company_employees').update(patch).eq('id',emp.id).select('*').single();
    if (uErr) throw uErr;
    await history(db, actor, companyId, 'employee_update', { employee_id:emp.id, role_key:data.role_key });
    return { status:200, payload:{ok:true,employee:data} };
  }
  return { status:400, payload:{ok:false,code:'INVALID_EMPLOYEE_ACTION'} };
}

async function createInvoice(db, actor, companyId, body, companyData) {
  const items = Array.isArray(body.items) ? body.items.slice(0,100) : [];
  if (!items.length) return {status:400,payload:{ok:false,code:'INVOICE_ITEMS_REQUIRED'}};
  const normalized = items.map((i,idx)=>{
    const q=Number(i.quantity||1), r=money(i.rate), d=money(i.discount||0), tr=Number(i.taxRate||0);
    if (!clean(i.description,500) || !Number.isFinite(q) || q<=0 || r===null || d===null || !Number.isFinite(tr) || tr<0 || tr>100) return null;
    const base=Math.max(0,q*r-d); return {description:clean(i.description,500),quantity:q,rate:r,discount:d,tax_rate:tr,hsn_sac:clean(i.hsnSac,50),amount:base,sort_order:idx};
  });
  if (normalized.some((x)=>!x)) return {status:400,payload:{ok:false,code:'INVALID_INVOICE_ITEM'}};
  const subtotal=normalized.reduce((s,i)=>s+i.quantity*i.rate,0), discount=normalized.reduce((s,i)=>s+i.discount,0), taxable=Math.max(0,subtotal-discount);
  const tax=normalized.reduce((s,i)=>s+(i.amount*i.tax_rate/100),0);
  const interstate=Boolean(body.interstate); const cgst=interstate?0:tax/2, sgst=interstate?0:tax/2, igst=interstate?tax:0;
  const roundOff=Number(body.roundOff||0); const grand=Math.round((taxable+tax+roundOff)*100)/100;
  const { data: numData, error:numErr } = await db.rpc('developer_next_invoice_number'); if (numErr) throw numErr;
  const profile=companyData.profile||{};
  const { data: invoice, error } = await db.from('developer_company_invoices').insert({
    company_id:companyId, invoice_number:numData, invoice_type:clean(body.invoiceType,50)||'subscription', invoice_date:asDate(body.invoiceDate)||new Date().toISOString().slice(0,10), due_date:asDate(body.dueDate),
    subtotal,discount,taxable_amount:taxable,cgst,sgst,igst,round_off:roundOff,grand_total:grand,status:clean(body.status,30)||'issued',
    billing_period_start:asDate(body.billingPeriodStart), billing_period_end:asDate(body.billingPeriodEnd), place_of_supply:clean(body.placeOfSupply,120), notes:clean(body.notes,5000), terms:clean(body.terms,5000),
    company_snapshot:{company_name:companyData.company.company_name,company_code:companyData.company.company_code,gstin:profile.gstin||'',pan:profile.pan||'',address:[profile.address_line1,profile.address_line2,profile.city,profile.state,profile.postal_code].filter(Boolean).join(', ')},
    plan_snapshot:{plan_key:companyData.effective.planKey,plan_name:companyData.effective.plan?.name||'',limits:companyData.effective.limits}, created_by:actor,updated_by:actor,
  }).select('*').single();
  if (error) throw error;
  const { error: itemErr } = await db.from('developer_company_invoice_items').insert(normalized.map(i=>({...i,invoice_id:invoice.id})));
  if (itemErr) throw itemErr;
  await history(db, actor, companyId, 'invoice_create', { invoice_id:invoice.id, invoice_number:invoice.invoice_number, total:grand });
  return {status:201,payload:{ok:true,invoice}};
}

async function handlePost(db, actor, companyId, body) {
  const action=clean(body.action,80);
  if (action.includes('employee')) return employeeAction(db,actor,companyId,body);
  const companyData=await loadCompany(db,companyId); if(!companyData) return {status:404,payload:{ok:false,code:'COMPANY_NOT_FOUND'}};

  if(action==='create_invoice') return createInvoice(db,actor,companyId,body,companyData);
  if(action==='record_payment'){
    const amount=money(body.amount); const paymentDate=asDate(body.paymentDate); if(amount===null||!paymentDate) return {status:400,payload:{ok:false,code:'INVALID_PAYMENT'}};
    const {data,error}=await db.from('developer_company_payments').insert({company_id:companyId,invoice_id:UUID.test(body.invoiceId||'')?body.invoiceId:null,amount,payment_date:paymentDate,payment_mode:clean(body.paymentMode,50)||'bank_transfer',transaction_reference:clean(body.transactionReference,200),proof_url:clean(body.proofUrl,1000),status:clean(body.status,30)||'submitted',remarks:clean(body.remarks,3000),created_by:actor}).select('*').single();
    if(error) throw error;
    await history(db,actor,companyId,'payment_record',{payment_id:data.id,amount:data.amount,status:data.status});
    return {status:201,payload:{ok:true,payment:data}};
  }
  if(action==='verify_payment'){
    const paymentId=clean(body.paymentId,80); const {data,error}=await db.from('developer_company_payments').update({status:'verified',verified_by:actor,verified_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',paymentId).eq('company_id',companyId).select('*').single(); if(error) throw error;
    if(data.invoice_id){ const {data:invoice}=await db.from('developer_company_invoices').select('id,grand_total,paid_amount').eq('id',data.invoice_id).maybeSingle(); if(invoice){ const paid=Number(invoice.paid_amount||0)+Number(data.amount||0); await db.from('developer_company_invoices').update({paid_amount:paid,status:paid>=Number(invoice.grand_total||0)?'paid':'partially_paid',updated_at:new Date().toISOString()}).eq('id',invoice.id); }}
    const {data:receiptNo,error:rErr}=await db.rpc('developer_next_receipt_number');
    if(rErr) throw rErr;
    const receiptNumber=receiptNo||`BFR/${new Date().getFullYear()}/${String(Date.now()).slice(-8)}`;
    const receiptResult=await db.from('developer_company_receipts').insert({company_id:companyId,payment_id:data.id,receipt_number:receiptNumber,snapshot:{amount:data.amount,payment_date:data.payment_date,payment_mode:data.payment_mode,transaction_reference:data.transaction_reference},created_by:actor});
    if(receiptResult.error) throw receiptResult.error;
    await history(db,actor,companyId,'payment_verify',{payment_id:data.id}); return {status:200,payload:{ok:true,payment:data}};
  }
  if(action==='add_document'){
    const {data,error}=await db.from('developer_company_documents').insert({company_id:companyId,document_type:clean(body.documentType,100)||'other',document_name:clean(body.documentName,200),file_url:clean(body.fileUrl,1000),status:clean(body.status,30)||'pending',expiry_date:asDate(body.expiryDate),notes:clean(body.notes,3000)}).select('*').single(); if(error) throw error; await history(db,actor,companyId,'document_add',{document_id:data.id}); return {status:201,payload:{ok:true,document:data}};
  }
  if(action==='send_announcement'){
    const title=clean(body.title,200), message=clean(body.message,10000); if(!title||!message)return {status:400,payload:{ok:false,code:'INVALID_ANNOUNCEMENT'}};
    const {data:ann,error}=await db.from('developer_company_announcements').insert({company_id:companyId,title,message,priority:clean(body.priority,20)||'normal',audience_type:'all_employees',require_acknowledgement:Boolean(body.requireAcknowledgement),allow_dismiss:body.allowDismiss!==false,starts_at:body.startsAt||new Date().toISOString(),expires_at:body.expiresAt||null,status:'published',created_by:actor}).select('*').single(); if(error) throw error;
    const recipients=(companyData.employees||[]).filter(e=>e.status==='active').map(e=>({announcement_id:ann.id,company_id:companyId,user_id:e.user_id,delivered_at:new Date().toISOString()})); if(recipients.length){const rr=await db.from('developer_company_announcement_recipients').insert(recipients); if(rr.error) throw rr.error;}
    await history(db,actor,companyId,'announcement_publish',{announcement_id:ann.id,recipients:recipients.length}); return {status:201,payload:{ok:true,announcement:ann,recipients:recipients.length}};
  }
  if(action==='add_note'){
    const bodyText=clean(body.body,10000); if(!bodyText)return {status:400,payload:{ok:false,code:'NOTE_REQUIRED'}}; const {data,error}=await db.from('developer_company_notes').insert({company_id:companyId,note_type:clean(body.noteType,50)||'internal',title:clean(body.title,200),body:bodyText,follow_up_at:body.followUpAt||null,created_by:actor}).select('*').single(); if(error) throw error; return {status:201,payload:{ok:true,note:data}};
  }
  if(action==='save_portal_config'){
    const {data,error}=await db.from('developer_company_portal_config').upsert({company_id:companyId,dashboard_widgets:Array.isArray(body.dashboardWidgets)?body.dashboardWidgets:[],sidebar_overrides:body.sidebarOverrides&&typeof body.sidebarOverrides==='object'?body.sidebarOverrides:{},branding:body.branding&&typeof body.branding==='object'?body.branding:{},landing_path:clean(body.landingPath,200)||'/dashboard',revision:Number(body.revision||0)+1,updated_by:actor,updated_at:new Date().toISOString()},{onConflict:'company_id'}).select('*').single(); if(error) throw error; await history(db,actor,companyId,'portal_config_save',{revision:data.revision}); return {status:200,payload:{ok:true,portalConfig:data}};
  }
  return {status:400,payload:{ok:false,code:'INVALID_ACTION'}};
}

export default async function handler(req,res){
  const auth=await requireDeveloperSession(req);
  if(!auth.ok){ if(auth.clearCookie) clearDeveloperSessionCookie(res); return send(res,auth.status||401,{ok:false,code:auth.code||'UNAUTHORIZED'}); }
  const db=auth.supabaseAdmin, actor=auth.user?.id||null;
  try{
    const companyId=clean(req.method==='GET'?req.query?.companyId:req.body?.companyId,80);
    if(!UUID.test(companyId)) return send(res,400,{ok:false,code:'INVALID_COMPANY_ID'});
    if(req.method==='GET'){
      const data=await loadCompany(db,companyId); if(!data)return send(res,404,{ok:false,code:'COMPANY_NOT_FOUND'}); return send(res,200,{ok:true,...data});
    }
    if(req.method==='POST'||req.method==='PATCH'){
      const result=await handlePost(db,actor,companyId,req.body||{}); return send(res,result.status,result.payload);
    }
    return send(res,405,{ok:false,code:'METHOD_NOT_ALLOWED'});
  }catch(error){ console.error('Company 360 API failed:',error); return send(res,500,{ok:false,code:'COMPANY_360_FAILED',message:error?.message||'Unexpected error'}); }
}
