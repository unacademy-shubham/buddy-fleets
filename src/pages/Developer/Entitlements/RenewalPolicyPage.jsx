import { useState } from 'react';
import BackendWorkspacePage from '../shared/BackendWorkspacePage';
import SaasManagementDialog from '../shared/SaasManagementDialog';

export default function RenewalPolicyPage() {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <BackendWorkspacePage
      workspaceKey='leaf:entitlements:renewalpolicy'
      title='Renewal Policy'
      description='Control expiry handling, grace period, renewal reminders, suspension behavior and post-expiry access.'
      onConfigureItem={(item) => {
        if (item.title === 'Configuration') return false;
        setDomainOpen(true);
        return true;
      }}
      customDialog={domainOpen ? <SaasManagementDialog mode='renewal' onClose={() => setDomainOpen(false)} /> : null}
    />
  );
}
