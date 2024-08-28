/* global CONFIG */
import { useSelector } from 'react-redux';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useEvent } from 'react-use-event-hook';
import { useState } from 'react';
import styles from './app-updated.module.scss';
import { ButtonLink } from './button-link';

const { intervalSec } = CONFIG.appVersionCheck;

export function AppUpdated() {
  const versionFileUpdated = useSelector((state) => state.appUpdated.updated);
  const [swRegistered, setSwRegistered] = useState(false);

  const {
    needRefresh: [workerUpdated],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setSwRegistered(true);
        setInterval(() => r.update(), intervalSec * 1000);
      }
    },
  });

  const reloadPage = useEvent(() => {
    if (workerUpdated) {
      updateServiceWorker();
      // Sometimes the updateServiceWorker doesn't refresh the page, so reload
      // it manually after some time
      setTimeout(() => window.location.reload(true), 2000);
    } else {
      window.location.reload(true);
    }
  });

  const needRefresh = swRegistered ? workerUpdated : versionFileUpdated;

  return needRefresh ? (
    <div className={styles.bar}>
      <div className={styles.indicator}>
        There’s an update for {CONFIG.siteTitle}!{' '}
        <ButtonLink className={styles.refresh} onClick={reloadPage}>
          Refresh the page
        </ButtonLink>{' '}
        when you are ready.
      </div>
    </div>
  ) : null;
}
