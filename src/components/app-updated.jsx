/* global CONFIG */
import { useSelector } from 'react-redux';

import styles from './app-updated.module.scss';
import { ButtonLink } from './button-link';

function reloadPage() {
  window.location.reload(true);
}

export function AppUpdated() {
  const updated = useSelector((state) => state.appUpdated.updated);

  if (!updated) {
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
