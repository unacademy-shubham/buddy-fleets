import { useState } from 'react';
import BackendWorkspacePage from '../shared/BackendWorkspacePage';
import SaasManagementDialog from '../shared/SaasManagementDialog';

export default function PlansPage() {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <BackendWorkspacePage
      workspaceKey='leaf:entitlements:plans'
      title='Plans'
      description='Manage Launch, Accelerate, Scale and Apex commercial plans. Pricing is published separately from the live Pricing workspace.'
      onConfigureItem={(item) => {
        if (item.title === 'Configuration') return false;
        setDomainOpen(true);
        return true;
      }}
      customDialog={domainOpen ? <SaasManagementDialog mode='plans' onClose={() => setDomainOpen(false)} /> : null}
    />
  );
}
