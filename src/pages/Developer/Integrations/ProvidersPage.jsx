import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function ProvidersPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:integrations:providers'
      title='Integration Providers'
      description='Manage Supabase, Vercel, WhatsApp, GPS and future integration providers.'
    />
  );
}
