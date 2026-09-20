import { useState } from 'react';
import BackendWorkspacePage from '../shared/BackendWorkspacePage';
import SaasManagementDialog from '../shared/SaasManagementDialog';

export default function CompaniesPage() {
  const [domainOpen, setDomainOpen] = useState(false);

  return (
    <BackendWorkspacePage
      workspaceKey='leaf:companies:companies'
      title='Company Management'
      description='Manage all customer companies, tenant lifecycle, status, plans, users, vehicles, modules, renewals and suspension controls.'
      onConfigureItem={(item) => {
        if (item.title === 'Configuration') return false;
        setDomainOpen(true);
        return true;
      }}
      customDialog={domainOpen ? <SaasManagementDialog mode='companies' onClose={() => setDomainOpen(false)} /> : null}
    />
  );
}
