import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function DependenciesPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:modules:dependencies'
      title='Module Dependencies'
      description='Define dependencies and compatibility requirements between Buddy Fleets modules and features.'
    />
  );
}
