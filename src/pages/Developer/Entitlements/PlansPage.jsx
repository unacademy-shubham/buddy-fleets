import { useState } from 'react';
import BackendWorkspacePage from '../shared/BackendWorkspacePage';
import SaasManagementDialog from '../shared/SaasManagementDialog';

export default function PlansPage() {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <BackendWorkspacePage
      workspaceKey='leaf:entitlements:plans'
      title='Plans'
      description='Manage Starter, Growth, Enterprise and future Buddy Fleets commercial plans.'
      onConfigureItem={(item) => {
        if (item.title === 'Configuration') return false;
        setDomainOpen(true);
        return true;
      }}
      customDialog={domainOpen ? <SaasManagementDialog mode='plans' onClose={() => setDomainOpen(false)} /> : null}
    />
  );
}
