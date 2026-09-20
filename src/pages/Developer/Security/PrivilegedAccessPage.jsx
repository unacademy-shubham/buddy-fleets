import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function PrivilegedAccessPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:security:privilegedaccess'
      title='Privileged Access'
      description='Manage Super Admin boundaries and controls for sensitive platform actions.'
    />
  );
}
