import { Link } from 'react-router';

import ExtAuthForm from './forms/ext-auth-accounts';
import ChangePasswordForm from './forms/change-password';
import styles from './settings.module.scss';
import { SettingsPage } from './layout';

export default function SignInPage() {
  return (
    <SettingsPage title="Password & sign in">
      <section className={styles.formSection}>
        <h4>Connected social network profiles</h4>
        <ExtAuthForm />
      </section>

      <section className={styles.formSection}>
        <h4>Change password</h4>
        <ChangePasswordForm />
      </section>

      <section className={styles.formSection}>
        <h4>Authorization sessions</h4>
        <p>
          <Link to="/settings/sign-in/sessions">View your authorization sessions</Link>
        </p>
      </section>
    </SettingsPage>
  );
}
