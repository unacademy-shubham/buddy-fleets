import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function SecurityEventsPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:security:securityevents'
      title='Security Events'
      description='Review security-sensitive events such as lockouts, unusual login behavior and privileged operations.'
    />
  );
}
