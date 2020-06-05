import React from 'react';
import { Portal } from 'react-portal';
import FocusTrap from 'focus-trap-react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import styles from './overlay-popup.module.scss';
import { Icon } from './fontawesome-icons';

export function OverlayPopup({ close, children }) {
  return (
    <Portal>
      <FocusTrap>
        <div className={styles.popup}>
          <div className={styles.content}>
            {close && (
              <button onClick={close} className={styles.closeBtn}>
                <Icon icon={faTimes} aria-label="Close" />
              </button>
            )}
            {children}
          </div>
        </div>
      </FocusTrap>
    </Portal>
  );
}
