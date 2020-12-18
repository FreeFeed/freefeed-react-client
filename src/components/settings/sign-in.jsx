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
    </SettingsPage>
  );
}
