import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function ApprovalsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:developerstudio:approvals'
      title='Workflow Approvals'
      description='Configure controlled approval steps and approver requirements.'
    />
  );
}
