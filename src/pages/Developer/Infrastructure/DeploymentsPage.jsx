import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function DeploymentsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:infrastructure:deployments'
      title='Deployments'
      description='Track production deployments, environments, release state and rollback readiness.'
    />
  );
}
