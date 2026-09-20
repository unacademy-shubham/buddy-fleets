import { useState } from 'react';
import BackendWorkspacePage from '../shared/BackendWorkspacePage';
import SaasManagementDialog from '../shared/SaasManagementDialog';

export default function LimitsAccessPage() {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <BackendWorkspacePage
      workspaceKey='leaf:entitlements:limitsaccess'
      title='Limits & Access'
      description='Configure module access, user limits, vehicle limits, storage limits and role-based plan entitlements.'
      onConfigureItem={(item) => {
        if (item.title === 'Configuration') return false;
        setDomainOpen(true);
        return true;
      }}
      customDialog={domainOpen ? <SaasManagementDialog mode='limits' onClose={() => setDomainOpen(false)} /> : null}
    />
  );
}
