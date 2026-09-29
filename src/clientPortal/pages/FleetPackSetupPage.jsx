import React from 'react';
import { Building2, CheckCircle2, Layers3, ShieldCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useClientPortal } from '../ClientPortalContext';

export default function FleetPackSetupPage(){
  const { company, currentUser, runtime } = useClientPortal();
  return <>
    <PageHeader title="Company Type Setup Required" subtitle="Your secure Buddy Fleets account is active, but a fleet dashboard has not been assigned yet." />
    <div className="bf-grid bf-grid-2">
      <div className="bf-card bf-card-body">
        <div className="bf-section-title">Why no fleet dashboard is shown</div>
        <p className="bf-muted" style={{lineHeight:1.75,margin:'8px 0 16px'}}>
          Buddy Fleets no longer treats the compatibility value “travels” as your real company type. Your primary Fleet Pack must be explicitly selected during onboarding or by Buddy Fleets Developer Control.
        </p>
        <div className="bf-list">
          <div className="bf-list-row"><span><ShieldCheck size={14}/> Account access</span><strong>Verified</strong></div>
          <div className="bf-list-row"><span><Building2 size={14}/> Company</span><strong>{company?.company_name||'Company'}</strong></div>
          <div className="bf-list-row"><span><Layers3 size={14}/> Fleet Pack</span><strong>Pending selection</strong></div>
          <div className="bf-list-row"><span><CheckCircle2 size={14}/> Effective plan</span><strong>{runtime?.effectivePlanKey||'Trial / plan context ready'}</strong></div>
        </div>
      </div>
      <div className="bf-card bf-card-body">
        <div className="bf-section-title">What happens next</div>
        <p className="bf-muted" style={{lineHeight:1.75,margin:'8px 0'}}>
          After your company type is selected, Buddy Fleets automatically resolves the correct dashboard, modules, sidebar, plan entitlements, company overrides, role permissions and site scope.
        </p>
        <div className="bf-note" style={{marginTop:14}}>
          Signed in as <strong>{currentUser?.name||currentUser?.email||'Company User'}</strong>. You do not need a new account after the Fleet Pack is assigned.
        </div>
      </div>
    </div>
  </>;
}
