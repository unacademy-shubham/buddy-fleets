import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function PermissionsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:developerstudio:permissions'
      title='Module Permissions'
      description='Configure module-level view, create, edit, delete, approve and export permissions.'
    />
  );
}
