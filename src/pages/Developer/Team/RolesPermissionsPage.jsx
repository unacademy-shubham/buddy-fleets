import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function RolesPermissionsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:team:rolespermissions'
      title='Roles & Permissions'
      description='Define SUPER_ADMIN, SALES_ADMIN, SUPPORT_ADMIN and future internal role permissions.'
    />
  );
}
