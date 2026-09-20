import BackendWorkspacePage from '../shared/BackendWorkspacePage';

export default function RetentionPrivacyPage() {
  return (
    <BackendWorkspacePage
      workspaceKey='leaf:system:retentionprivacy'
      title='Retention & Privacy'
      description='Configure archive, deletion, export, privacy and retention policies.'
    />
  );
}
