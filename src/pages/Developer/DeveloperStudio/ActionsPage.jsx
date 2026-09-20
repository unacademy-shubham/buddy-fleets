import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function ActionsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:developerstudio:actions'
      title='Workflow Actions'
      description='Configure registered actions such as notifications, state changes, integrations and internal operations.'
    />
  );
}
