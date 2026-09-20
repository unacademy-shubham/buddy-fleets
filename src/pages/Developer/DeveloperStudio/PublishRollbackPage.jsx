import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function PublishRollbackPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:developerstudio:publishrollback'
      title='Publish & Rollback'
      description='Control draft, test, publish, release history and rollback workflow for generated modules.'
    />
  );
}
