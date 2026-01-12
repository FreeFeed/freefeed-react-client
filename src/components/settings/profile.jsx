import { Link } from '../../services/nouter';

import ProfileForm from './forms/profile';
import ProfilePictureForm from './forms/profile-picture';
import styles from './settings.module.scss';
import { SettingsPage } from './layout';

export default function ProfilePage() {
  return (
    <SettingsPage title="Profile">
      <section className={styles.formSection}>
        <ProfilePictureForm />
      </section>

      <section className={styles.formSection}>
        <ProfileForm />
      </section>

      <section className={styles.formSection}>
        <p className="text-muted">
          You can <Link to="/settings/pause">pause</Link> your account or{' '}
          <Link to="/settings/deactivate">delete</Link> it.
        </p>
      </section>
    </SettingsPage>
  );
}
