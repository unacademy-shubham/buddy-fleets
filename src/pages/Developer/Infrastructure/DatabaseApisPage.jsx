import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function DatabaseApisPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:infrastructure:databaseapis'
      title='Database & APIs'
      description='Monitor Supabase/database availability, API layers, Edge Functions and critical backend dependencies.'
    />
  );
}
