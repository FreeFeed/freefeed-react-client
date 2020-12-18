import { SettingsPage } from './layout';
import NotificationsForm from './forms/notifications';

export default function NotificationsPage() {
  return (
    <SettingsPage title="Notifications preferences">
      <NotificationsForm />
    </SettingsPage>
  );
}
