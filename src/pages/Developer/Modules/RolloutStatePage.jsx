import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function RolloutStatePage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:modules:rolloutstate'
      title='Rollout State'
      description='Track production, beta, planned and company-specific rollout state for each module.'
    />
  );
}
