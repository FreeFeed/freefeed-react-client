import React from 'react';
import { Link } from 'react-router';

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
          You can delete your account <Link to="/settings/deactivate">here</Link>.
        </p>
      </section>
    </SettingsPage>
  );
}
