/* global CONFIG */
import { useSelector } from 'react-redux';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useEvent } from 'react-use-event-hook';
import { useState } from 'react';
import { isIos } from '../utils/platform-detection';
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
      // iOS has strange behavior with service workers updates, so we will use
      // the old-fashion way (via the version file) here
      if (r && !isIos) {
        setSwRegistered(true);
        setInterval(() => r.update(), intervalSec * 1000);
      }
    },
  });

  const reloadPage = useEvent(() => {
    if (workerUpdated && !isIos) {
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
