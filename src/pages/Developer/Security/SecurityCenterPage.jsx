import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function SecurityCenterPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:security:securitycenter'
      title='Security Center'
      description='Central security control for secure login, portal sessions, MFA, account locks and privileged access.'
    />
  );
}
