/* global CONFIG */
import { useSelector } from 'react-redux';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { useEvent } from 'react-use-event-hook';
import { useState } from 'react';
import { isSafari } from '../utils/platform-detection';
import styles from './app-updated.module.scss';
import { ButtonLink } from './button-link';

const { intervalSec } = CONFIG.appVersionCheck;

// Safari has strange behavior with service workers updates, so we will use
// the old-fashion way (via the version file) here
const useServiceWorker = !isSafari;

export function AppUpdated() {
  const versionFileState = useSelector((state) => state.appUpdated);
  const [swRegistered, setSwRegistered] = useState(false);

  const versionFileUpdated =
    versionFileState.initialVersion !== null &&
    versionFileState.initialVersion !== versionFileState.version;

  const {
    needRefresh: [workerUpdated],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // iOS has strange behavior with service workers updates, so we will use
      // the old-fashion way (via the version file) here
      if (useServiceWorker && r) {
        setSwRegistered(true);
        setInterval(() => r.update(), intervalSec * 1000);
      }
    },
  });

  const reloadPage = useEvent(() => {
    if (useServiceWorker && workerUpdated) {
      updateServiceWorker();
      // Sometimes the updateServiceWorker doesn't refresh the page, so reload
      // it manually after some time
      setTimeout(() => window.location.reload(true), 2000);
    } else {
      window.location.reload(true);
    }
  });

  const needRefresh = swRegistered ? workerUpdated : versionFileUpdated;
  const addText = swRegistered
    ? ''
    : ` (was '${versionFileState.initialVersion}', now '${versionFileState.version}')`;

  return needRefresh ? (
    <div className={styles.bar}>
      <div className={styles.indicator}>
        There’s an update for {CONFIG.siteTitle}!{addText}{' '}
        <ButtonLink className={styles.refresh} onClick={reloadPage}>
          Refresh the page
        </ButtonLink>{' '}
        when you are ready.
      </div>
    </div>
  ) : null;
}
