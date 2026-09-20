import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function CompaniesPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:companies:companies'
      title='Company Management'
      description='Manage all customer companies, tenant lifecycle, status, plans, users, vehicles, modules, renewals and suspension controls.'
    />
  );
}
