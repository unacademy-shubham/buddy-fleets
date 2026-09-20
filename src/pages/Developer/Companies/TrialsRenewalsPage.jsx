import { useState } from 'react';
import BackendWorkspacePage from '../shared/BackendWorkspacePage';
import SaasManagementDialog from '../shared/SaasManagementDialog';

export default function TrialsRenewalsPage() {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <BackendWorkspacePage
      workspaceKey='leaf:companies:trialsrenewals'
      title='Trials & Renewals'
      description='Review trial companies, trial expiry, conversion readiness, renewal windows, grace periods and follow-up states.'
      onConfigureItem={(item) => {
        if (item.title === 'Configuration') return false;
        setDomainOpen(true);
        return true;
      }}
      customDialog={domainOpen ? <SaasManagementDialog mode='trials' onClose={() => setDomainOpen(false)} /> : null}
    />
  );
}
