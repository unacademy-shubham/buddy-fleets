import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function LimitsAccessPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:entitlements:limitsaccess'
      title='Limits & Access'
      description='Configure module access, user limits, vehicle limits, storage limits and role-based plan entitlements.'
    />
  );
}
