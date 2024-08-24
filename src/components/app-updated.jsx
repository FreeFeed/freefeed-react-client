/* global CONFIG */
import { useSelector } from 'react-redux';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useEvent } from 'react-use-event-hook';
import styles from './app-updated.module.scss';
import { ButtonLink } from './button-link';

const { intervalSec } = CONFIG.appVersionCheck;

export function AppUpdated() {
  const updated = useSelector((state) => state.appUpdated.updated);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      r && setInterval(() => r.update(), intervalSec * 1000);
    },
  });

  const reloadPage = useEvent(() => {
    if (needRefresh) {
      updateServiceWorker();
      // Sometimes the updateServiceWorker doesn't refresh the page, so reload
      // it manually after some time
      setTimeout(() => window.location.reload(true), 2000);
    } else {
      window.location.reload(true);
    }
  });

  if (!updated && !needRefresh) {
    return null;
  }

  return (
    <div className={styles.bar}>
      <div className={styles.indicator}>
        There’s an update for {CONFIG.siteTitle}!{' '}
        <ButtonLink className={styles.refresh} onClick={reloadPage}>
          Refresh the page
        </ButtonLink>{' '}
        when you are ready.
      </div>
    </div>
  );
}
