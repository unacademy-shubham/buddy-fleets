import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function ApiHealthPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:integrations:apihealth'
      title='API Health'
      description='Monitor API availability, provider health, error rate, latency and integration failures.'
    />
  );
}
