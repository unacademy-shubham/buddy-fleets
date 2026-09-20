import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function PortalAccessPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:team:portalaccess'
      title='Portal Access'
      description='Control which internal users can access Developer, Team and other platform portals.'
    />
  );
}
