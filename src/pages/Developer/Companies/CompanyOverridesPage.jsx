import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function CompanyOverridesPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:companies:companyoverrides'
      title='Company Overrides'
      description='Manage company-specific feature, module, entitlement, limit and access exceptions without changing global plan defaults.'
    />
  );
}
