import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function ModuleRegistryPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:modules:moduleregistry'
      title='Module Registry'
      description='Central registry of Buddy Fleets product modules, lifecycle state, rollout and configuration.'
    />
  );
}
