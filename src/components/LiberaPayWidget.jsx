import { useEffect, useState, useCallback } from 'react';

import styles from './LiberaPayWidget.module.scss';

export function LiberaPayWidget({ project, updateInterval = 1200000 }) {
  const [{ receiving, goal }, setData] = useState({
    giving: '-.--',
    goal: '--.--',
  });

  const update = useCallback(() => {
    loadLiberaPayData(project)
      .then((result) => {
        if (!result.receiving) {
          throw new Error('Invalid response format');
        }
        setData({
          receiving: formatSum(result.receiving),
          goal: formatSum(result.goal),
        });
      })
      .catch((err) => {
        console.warn(`Cannot load LiberaPay data: ${err.message}`);
        // do nothing
      });
  }, [project]);

  useEffect(() => {
    update();
    const t = setInterval(update, updateInterval);
    return () => clearInterval(t);
  }, [update, updateInterval]);

  return (
    <a
      href={`https://liberapay.com/${project}/donate`}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.widget}
    >
      <span className={styles.header}>
        <img
          src="https://liberapay.com/assets/liberapay/icon-v2_black.svg"
          height="20"
          width="20"
          className={styles.headerItem}
          alt={project}
        />
        <span className={styles.headerItem}>LiberaPay</span>
      </span>
      <span className={styles.body}>
        <span className={styles.arrow}>&#10132;</span>
        We receive <br />
        <span className={styles.sum}>{receiving}</span>
        <br /> per week,
        <br /> our goal is <br />
        <span className={styles.sum}>{goal}</span>
      </span>
    </a>
  );
}

function loadLiberaPayData(project) {
  return fetch(`https://liberapay.com/${project}/public.json`, { cache: 'reload' }).then((r) =>
    r.json(),
  );
}

function formatSum({ amount, currency }) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount);
}
