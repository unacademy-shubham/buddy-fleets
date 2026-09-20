import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function MfaLocksPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:security:mfalocks'
      title='MFA & Locks'
      description='Manage MFA state, lockouts, recovery, failed-login protection and high-risk access controls.'
    />
  );
}
