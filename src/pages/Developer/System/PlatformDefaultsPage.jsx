import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function PlatformDefaultsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:system:platformdefaults'
      title='Platform Defaults'
      description='Configure global platform identity, timezone, currency, date format and default tenant behavior.'
    />
  );
}
