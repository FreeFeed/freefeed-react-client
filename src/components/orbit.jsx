/* global CONFIG */
import { useSelector } from 'react-redux';
import { format } from '../utils/date-format';

import styles from './orbit.module.scss';

export function Orbit({ text, size, children }) {
  const regex = /\p{Extended_Pictographic}/gu;

  const emojis = text?.match(regex) || [];
  const emojisToRender = emojis.slice(0, 10);

  const isTheRightDate = format(new Date(), 'yyyy-MM-dd') === CONFIG.orbitDate;
  const isOrbitDisabled = useSelector((state) => state.isOrbitDisabled);

  if (!isTheRightDate || isOrbitDisabled || emojisToRender.length === 0) {
    return children;
  }

  const globalDelay = Math.random();
  const duration = size / 50;

  return (
    <div className={styles.root}>
      <div className={styles.children}>{children}</div>
      <div className={styles.emojis}>
        {emojisToRender.map((e, i) => {
          const delay = globalDelay + i * ((2 * duration) / emojisToRender.length);
          return (
            <div
              className={styles.ellipticOuter}
              key={i}
              style={{
                '--orbit-width': `${size}px`,
                '--orbit-height': `${size / 6}px`,
                '--delay': `${delay}s`,
                '--duration': `${duration}s`,
              }}
            >
              <div className={styles.ellipticInner}>{e}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
