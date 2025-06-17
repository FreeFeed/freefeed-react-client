import { useSelector } from 'react-redux';
import styles from './styles.module.scss';
import { Entry } from './entry';

export function UndoContainer() {
  const entries = useSelector((state) => state.undoEntries);
  return (
    <ul className={styles.container}>
      {entries.map((it) => (
        <Entry key={it.id} entry={it} />
      ))}
    </ul>
  );
}
