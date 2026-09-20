import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function TriggersPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:developerstudio:triggers'
      title='Workflow Triggers'
      description='Configure approved system events that can start workflow executions.'
    />
  );
}
