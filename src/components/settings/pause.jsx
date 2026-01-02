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
import { pauseMe, unauthenticated } from '../../redux/action-creators';
import styles from './settings.module.scss';

export default function PausePage() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user);
  const formStatus = useSelector((state) => state.settingsForms.pauseStatus);

  const usernameS = useMemo(() => {
    if (userInfo.username?.endsWith('s')) {
      return `${userInfo.username}\u2019`;
    }
    return `${userInfo.username}\u2019s`;
  }, [userInfo.username]);

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(userInfo.preferences?.pauseMessage || '');
  const onPasswordChange = useCallback(({ target }) => setPassword(target.value), []);
  const onMessageChange = useCallback(({ target }) => setMessage(target.value), []);

  const canSubmit = useMemo(() => password.trim() !== '', [password]);
  const submit = useCallback(
    (e) => {
      e.preventDefault();
      if (!canSubmit) {
        alert('Please enter password');
        return;
      }
      doSequence(dispatch)(
        (dispatch) => dispatch(pauseMe(password, message.trim())),
        (dispatch) => dispatch(unauthenticated()),
      );
    },
    [canSubmit, dispatch, password, message],
  );

  return (
    <SettingsPage title="Pause account">
      <section className={styles.formSection}>
        <p>When an account is paused, the following will be hidden:</p>
        <ul>
          <li>All your posts</li>
          <li>All your images and other attachments</li>
          <li>All your likes</li>
        </ul>
        <p>
          Your comments in other user&#x2019;s posts will stay, and your username will be used for
          attribution.
        </p>
        <p>Once you pause your account, you can reactivate it at any time.</p>
      </section>
      <OrphanGroupsWarning />
      <section className={styles.formSection}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="message-input">
              Leave a message to be displayed on your profile (optional):
            </label>
            <textarea
              id="message-input"
              className="form-control"
              name="message"
              rows={3}
              placeholder="Just taking some time off"
              value={message}
              onChange={onMessageChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="password-input">Enter @{usernameS} password to proceed:</label>
            <input
              id="password-input"
              className="form-control narrow-input"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={onPasswordChange}
            />
          </div>
          <div className="form-group">
            <button className={cn('btn btn-danger', canSubmit || 'disabled')} type="submit">
              {formStatus.loading ? 'Pausing account…' : 'Pause my account'}
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
          If you pause your account, this group will become restricted and no one will be able to
          create posts in it. Please add additional administrators to these groups before you pause
          your account to prevent that.
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
        If you pause your account, these groups will become restricted and no one will be able to
        create posts in them. Please add additional administrators to these groups before you pause
        your account to prevent that.
      </p>
    </section>
  );
}
