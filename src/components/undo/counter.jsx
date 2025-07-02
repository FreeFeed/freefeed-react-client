import { useEffect, useState } from 'react';
import styles from './styles.module.scss';

export function Counter({ prefix = 'in ', from, ttl }) {
  const [sec, setSec] = useState(() => secondsRest(from, ttl));
  useEffect(() => {
    const interval = setInterval(() => setSec(secondsRest(from, ttl)), 1000);
    return () => clearInterval(interval);
  }, [from, ttl]);

  if (sec < 0) {
    return null;
  }

  return (
    <span className={styles.buttonCounter}>
      {prefix}0:{sec.toString().padStart(2, '0')}
    </span>
  );
}

function secondsRest(from, ttl) {
  const now = Math.floor(Date.now() / 1000);
  const sec = ttl + from - now;
  return sec < 0 ? 0 : sec;
}
