import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function ServiceHealthPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:infrastructure:servicehealth'
      title='Service Health'
      description='Monitor website, developer portal, team portal, APIs, database and authentication services.'
    />
  );
}
