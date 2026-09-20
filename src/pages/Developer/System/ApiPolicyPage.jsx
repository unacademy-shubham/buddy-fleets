import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function ApiPolicyPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:system:apipolicy'
      title='API Policy'
      description='Configure API versioning, rate limits, idempotency, access policy and external integration rules.'
    />
  );
}
