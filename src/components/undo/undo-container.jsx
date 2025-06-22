import { useSelector } from 'react-redux';
import { useAnimatedList } from '../hooks/animated-list';
import styles from './styles.module.scss';
import { Entry } from './entry';

export function UndoContainer() {
  const items = useAnimatedList(useSelector((state) => state.undoEntries));
  return (
    <ul className={styles.container}>
      {items.map(({ entry, state }) => (
        <Entry key={entry.id} entry={entry} animationState={state} />
      ))}
    </ul>
  );
}
