import cn from 'classnames';
import styles from '../dropdown-menu.module.scss';
import { Icon } from '../fontawesome-icons';

export function MenuItemIconic({ icon, centered = false, children }) {
  return (
    <span className={cn(styles.iconic, centered && styles.iconicCentered)}>
      <span className={styles.iconicIcon}>
        <Icon icon={icon} />
      </span>
      <span className={styles.iconicContent}>{children}</span>
    </span>
  );
}
