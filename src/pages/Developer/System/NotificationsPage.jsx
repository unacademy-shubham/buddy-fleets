import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function NotificationsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:system:notifications'
      title='Notifications'
      description='Manage platform email, SMS, WhatsApp and in-app notification defaults and templates.'
    />
  );
}
