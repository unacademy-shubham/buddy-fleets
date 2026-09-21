export async function resolveCompanyAccess(db, companyId) {
  const [companyR, subscriptionR, overrideR, plansR, modulesR, policiesR, portalR] = await Promise.all([
    db.from('companies').select('id,company_code,company_name,status,subdomain_slug').eq('id', companyId).maybeSingle(),
    db.from('subscriptions').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_company_overrides').select('*').eq('company_id', companyId).maybeSingle(),
    db.from('developer_plans').select('*').order('display_order',{ascending:true}),
    db.from('developer_module_catalog').select('*').order('sort_order',{ascending:true}),
    db.from('developer_lifecycle_access_policy').select('*'),
    db.from('developer_company_portal_config').select('*').eq('company_id', companyId).maybeSingle(),
  ]);
  for (const r of [companyR,subscriptionR,overrideR,plansR,modulesR,policiesR,portalR]) if (r.error) throw r.error;
  const company=companyR.data; if(!company) return null;
  const subscription=subscriptionR.data||null, override=overrideR.data||null, plans=plansR.data||[];
  const planKey=override?.enabled&&override?.plan_key?override.plan_key:subscription?.plan_id||'';
  const plan=plans.find(p=>p.plan_key===planKey||p.id===planKey)||null;
  const baseLimits=plan?.limits||{}; const limits={...baseLimits,...(override?.enabled?(override.limits_override||{}):{})};
  const planEnt=new Set(Array.isArray(plan?.entitlements)?plan.entitlements:[]); const overEnt=new Set(Array.isArray(override?.entitlements_override)?override.entitlements_override:[]);
  const trial=company.status==='trial_active'||subscription?.status==='trial_active';
  const expired=company.status==='trial_expired'||['expired','past_due'].includes(subscription?.status); const suspended=company.status==='suspended';
  const modules=(modulesR.data||[]).map(m=>{let access=planEnt.has(m.module_key)?'full':'none';if(trial)access=m.trial_access||access;if(expired)access=m.expired_access==='read_only'?'read_only':m.expired_access==='hidden'?'none':'blocked';if(suspended)access='blocked';if(override?.enabled&&overEnt.has(m.module_key))access='full';return{module_key:m.module_key,module_name:m.module_name,category:m.category,access,unavailable_behavior:m.unavailable_behavior,show_in_sidebar:m.show_in_sidebar,show_on_dashboard:m.show_on_dashboard,dependencies:m.dependencies||[]};});
  return {company,subscription,plan:plan?{plan_key:plan.plan_key,name:plan.name}:null,limits,modules,portalConfig:portalR.data||null,policies:Object.fromEntries((policiesR.data||[]).map(p=>[p.policy_key,p.config]))};
}
