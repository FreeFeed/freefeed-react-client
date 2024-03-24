/* global CONFIG */
import { useRef } from 'react';
import { useSelector } from 'react-redux';

import styles from './orbit.module.scss';

export function Orbit({ text, children }) {
  const regex = /\p{Extended_Pictographic}/gu;

  const emojis = text?.match(regex) || [];
  const emojisToRender = emojis.slice(0, 10);

  const childrenRef = useRef(null);

  const isTheRightDate = new Date().toISOString().slice(0, 10) === CONFIG.orbitDate;
  const isOrbitDisabled = useSelector((state) => state.isOrbitDisabled);

  if (!isTheRightDate || isOrbitDisabled) {
    return children;
  }

  let w, h;

  if (childrenRef.current) {
    w = childrenRef.current.clientWidth;
    h = childrenRef.current.clientHeight;
  }
  const globalDelay = Math.random();
  const duration = w / 50;

  return (
    <div className={styles.root}>
      <div className={styles.children} ref={childrenRef}>
        {children}
      </div>
      {childrenRef.current ? (
        <div className={styles.emojis}>
          {emojisToRender
            ? emojisToRender.map((e, i) => {
                const delay = globalDelay + i * ((2 * duration) / emojisToRender.length);
                return (
                  <div
                    className={styles.ellipticOuter}
                    key={i}
                    style={{
                      '--orbit-width': `${w}px`,
                      '--orbit-height': `${h / 6}px`,
                      '--delay': `${delay}s`,
                      '--duration': `${w / 50}s`,
                    }}
                  >
                    <div className={styles.ellipticInner}>{e}</div>
                  </div>
                );
              })
            : false}
        </div>
      ) : (
        false
      )}
    </div>
  );
}
