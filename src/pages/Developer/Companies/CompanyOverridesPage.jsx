import { useState } from 'react';
import BackendWorkspacePage from '../shared/BackendWorkspacePage';
import SaasManagementDialog from '../shared/SaasManagementDialog';

export default function CompanyOverridesPage() {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <BackendWorkspacePage
      workspaceKey='leaf:companies:companyoverrides'
      title='Company Overrides'
      description='Manage company-specific feature, module, entitlement, limit and access exceptions without changing global plan defaults.'
      onConfigureItem={(item) => {
        if (item.title === 'Configuration') return false;
        setDomainOpen(true);
        return true;
      }}
      customDialog={domainOpen ? <SaasManagementDialog mode='overrides' onClose={() => setDomainOpen(false)} /> : null}
    />
  );
}
