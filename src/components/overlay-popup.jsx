import { useEffect, useRef } from 'react';
import { Portal } from 'react-portal';
import FocusTrap from 'focus-trap-react';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { KEY_ESCAPE } from 'keycode-js';

import styles from './overlay-popup.module.scss';
import { Icon } from './fontawesome-icons';
import { withEventListener } from './hooks/sub-unsub';

export function OverlayPopup({
  close,
  children,
  // Close by Escape or by clicking on the overlay
  easyClose = true,
}) {
  const panel = useRef();
  const content = useRef();

  useEffect(
    () =>
      withEventListener(
        panel.current,
        'keydown',
        ({ keyCode }) => easyClose && keyCode === KEY_ESCAPE && close(),
      ),
    [close, easyClose],
  );

  useEffect(
    () =>
      withEventListener(
        panel.current,
        'click',
        ({ target }) => easyClose && !content.current.contains(target) && close(),
      ),
    [close, easyClose],
  );

  // Turn off body scrolling while the popup is opened
  useEffect(() => {
    document.body.classList.add('body--no-scroll');
    return () => document.body.classList.remove('body--no-scroll');
  }, []);

  return (
    <Portal>
      <FocusTrap>
        <div className={styles.popup} ref={panel}>
          <div className={styles.content} ref={content}>
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
