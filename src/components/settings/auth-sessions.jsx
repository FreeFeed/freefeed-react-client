import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import uaParser from 'ua-parser-js';
import { without } from 'lodash';
import cn from 'classnames';

import { faBan } from '@fortawesome/free-solid-svg-icons';
import { closeAuthSessions, listAuthSessions } from '../../redux/action-creators';
import TimeDisplay from '../time-display';

import { Throbber } from '../throbber';
import { Icon } from '../fontawesome-icons';
import { SettingsPage } from './layout';

import styles from './auth-sessions.module.scss';
import settingsStyles from './settings.module.scss';

export default withLayout(function AuthSessionsPage() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.authSessionsStatus);
  const closeStatus = useSelector((state) => state.closeAuthSessionsStatus);

  const authSessions = useSelector((state) => state.authSessions);
  const [activeSessions, blockedSessions] = useMemo(
    () => [
      authSessions.filter((s) => s.status === 'ACTIVE'),
      authSessions.filter((s) => s.status === 'BLOCKED'),
    ],
    [authSessions],
  );

  const [checked, setChecked] = useState([]);
  const onClick = useCallback(
    (e) => {
      const id = e.target.value;
      if (checked.includes(id)) {
        setChecked(without(checked, id));
      } else {
        setChecked([...checked, id]);
      }
    },
    [checked],
  );

  const canSubmit = useMemo(() => !closeStatus.loading && checked.length > 0, [
    checked.length,
    closeStatus.loading,
  ]);

  const closeSelected = useCallback(() => canSubmit && dispatch(closeAuthSessions(checked)), [
    canSubmit,
    checked,
    dispatch,
  ]);

  useEffect(() => void dispatch(listAuthSessions()), [dispatch]);
  useEffect(() => void (closeStatus.success && setChecked([])), [closeStatus.success]);

  if (status.loading || status.initial) {
    return <p>Loading...</p>;
  }

  if (status.error) {
    return <div className="alert alert-danger">Can not load sessions list: {status.errorText}</div>;
  }

  if (authSessions.length === 0) {
    return <p>There are no sessions found.</p>;
  }

  return (
    <>
      <section className={settingsStyles.formSection}>
        <h3>Active sessions</h3>

        {activeSessions.length ? (
          <>
            <ul className={styles.list}>
              {activeSessions.map((s) => (
                <li key={s.id}>
                  <SessionRow session={s} onClick={onClick} checked={checked.includes(s.id)} />
                </li>
              ))}
            </ul>
            <p>
              <button
                className={cn('btn btn-default', !canSubmit && 'disabled')}
                type="button"
                onClick={closeSelected}
              >
                {closeStatus.loading ? 'Closing' : 'Close'} selected sessions
              </button>{' '}
              {closeStatus.loading && <Throbber />}
            </p>
            {closeStatus.error && (
              <p className="alert alert-danger" role="alert">
                {closeStatus.errorText}
              </p>
            )}
          </>
        ) : (
          <p>You have no active sessions.</p>
        )}
      </section>
      {blockedSessions.length > 0 && (
        <section className={settingsStyles.formSection}>
          <h3>Blocked sessions</h3>
          <p>
            These sessions have been blocked due to unusual activity. The sessions are now inactive
            and will be automatically removed after a few days.
          </p>

          <ul className={styles.list}>
            {blockedSessions.map((s) => (
              <li key={s.id}>
                <SessionRow session={s} onClick={onClick} checked={checked.includes(s.id)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
});

function SessionRow({ session, onClick, checked }) {
  const uaString = useMemo(() => {
    const ua = uaParser(session.lastUserAgent);
    if (!ua.browser.name) {
      return session.lastUserAgent;
    }
    let res = `${ua.browser.name} ${ua.browser.major}, ${ua.os.name} ${ua.os.version}`;
    if (ua.device.vendor) {
      res += ` (${ua.device.vendor} ${ua.device.model})`;
    }
    return res;
  }, [session.lastUserAgent]);
  return (
    <div className={styles.listItem}>
      <div className={styles.listItem_checkbox}>
        {session.status === 'ACTIVE' ? (
          <input
            type="checkbox"
            disabled={session.isCurrent}
            value={session.id}
            checked={checked}
            onChange={onClick}
          />
        ) : (
          <Icon icon={faBan} />
        )}
      </div>
      <div>
        <div>
          {uaString}
          {session.isCurrent && <em className="text-primary"> — your current session</em>}
        </div>
        <div className="text-muted">
          Last used <TimeDisplay timeStamp={session.lastUsedAt} inline /> from{' '}
          <code>{session.lastIP}</code>
        </div>
      </div>
    </div>
  );
}

function withLayout(Component) {
  return (props) => (
    <SettingsPage
      title="Sessions"
      header={
        <>
          <Link to="/settings/sign-in">Sign in</Link> <small>/</small> Your sessions
        </>
      }
    >
      <Component {...props} />
    </SettingsPage>
  );
}
