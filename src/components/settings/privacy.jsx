import { SettingsPage } from './layout';
import PrivacyForm from './forms/privacy';

export default function PrivacyPage() {
  return (
    <SettingsPage title="Privacy settings">
      <PrivacyForm />
    </SettingsPage>
  );
}
