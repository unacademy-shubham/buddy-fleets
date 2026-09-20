import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function AuthSessionsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:security:authsessions'
      title='Auth & Sessions'
      description='Review authenticated sessions, active devices, session age and revoke controls.'
    />
  );
}
