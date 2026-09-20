import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function WebhooksPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:integrations:webhooks'
      title='Webhooks'
      description='Configure outbound and inbound webhook endpoints, signing, retry policies and delivery logs.'
    />
  );
}
