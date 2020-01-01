import React from 'react';

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
    </SettingsPage>
  );
}
