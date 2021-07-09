import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { Throbber } from '../throbber';
import { doSequence } from '../../redux/async-helpers';
import { pluralForm } from '../../utils';
import UserName from '../user-name';
import { Icon } from '../fontawesome-icons';
import { SettingsPage } from './layout';
import { suspendMe, unauthenticated } from './../../redux/action-creators';
import styles from './settings.module.scss';

export default function PrivacyPage() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user);
  const formStatus = useSelector((state) => state.settingsForms.deactivateStatus);

  const usernameS = useMemo(() => {
    if (userInfo.username.endsWith('s')) {
      return `${userInfo.username}\u2019`;
    }
    return `${userInfo.username}\u2019s`;
  }, [userInfo.username]);

  const [password, setPassword] = useState('');
  const onChange = useCallback(({ target }) => setPassword(target.value), []);

  const canSubmit = useMemo(() => password.trim() !== '', [password]);
  const submit = useCallback(
    (e) => {
      e.preventDefault();
      if (!canSubmit) {
        alert('Please enter password');
        return;
      }
      doSequence(dispatch)(
        (dispatch) => dispatch(suspendMe(password)),
        (dispatch) => dispatch(unauthenticated()),
      );
    },
    [canSubmit, dispatch, password],
  );

  return (
    <SettingsPage title="Delete account">
      <section className={styles.formSection}>
        <p>When an account is deleted, we will also delete:</p>
        <ul>
          <li>All your posts</li>
          <li>All your images and other attachments</li>
          <li>All your likes</li>
        </ul>
        <p>
          Your comments in other user&#x2019;s posts will stay, and your username will be used for
          attribution.
        </p>
        <p>
          Once you delete your account, you have 30 days to change your mind and restore your
          account. After 30 days, your account will be permanently deleted and there will be no way
          to restore it.
        </p>
        <p>We&#x2019;re sorry to see you go.</p>
      </section>
      <OrphanGroupsWarning />
      <section className={styles.formSection}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="password-input">Enter @{usernameS} password to proceed:</label>
            <input
              id="password-input"
              className="form-control narrow-input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <button className={cn('btn btn-danger', canSubmit || 'disabled')} type="submit">
              {formStatus.loading ? 'Deleting account…' : 'Delete my account'}
            </button>{' '}
            {formStatus.loading && <Throbber />}
            <p className="help-block">(You will be signed out immediately)</p>
          </div>
          {formStatus.error && (
            <p className="alert alert-danger" role="alert">
              {formStatus.errorText}
            </p>
          )}
        </form>
      </section>
    </SettingsPage>
  );
}

function OrphanGroupsWarning() {
  const managedGroups = useSelector((state) => state.managedGroups);
  const orphanGroups = managedGroups.filter(
    (g) => g.administrators.length === 1 && g.isRestricted === '0',
  );

  if (orphanGroups.length === 0) {
    return null;
  }

  if (orphanGroups.length === 1) {
    const [g] = orphanGroups;
    return (
      <section className={styles.formSection}>
        <p>
          <Icon icon={faExclamationTriangle} /> Please note: there is a non-restricted group{' '}
          <UserName user={g}>{g.screenName}</UserName> in which you are the only administrator.
        </p>
        <p>
          If you delete your account, this group will become restricted and no one will be able to
          create posts in it. If you don&#x2019;t want that, assign additional administrators to
          this group before you delete the account.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.formSection}>
      <p>
        <Icon icon={faExclamationTriangle} /> Please note: there are{' '}
        {pluralForm(orphanGroups.length, 'non-restricted group')} in which you are the only
        administrator:
      </p>
      <ol>
        {orphanGroups.map((g) => (
          <li key={g.id}>
            <UserName user={g}>{g.screenName}</UserName>
          </li>
        ))}
      </ol>
      <p>
        If you delete your account, these groups will become restricted and no one will be able to
        create posts in them. If you don&#x2019;t want that, assign additional administrators to
        those groups before you delete the account.
      </p>
    </section>
  );
}
