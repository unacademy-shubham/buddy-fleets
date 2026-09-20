import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function RenewalPolicyPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:entitlements:renewalpolicy'
      title='Renewal Policy'
      description='Control expiry handling, grace period, renewal reminders, suspension behavior and post-expiry access.'
    />
  );
}
