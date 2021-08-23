import styles from './more-with-triangle.module.scss';

export const MoreWithTriangle = ({ children = 'More' }) => {
  return <span className={styles.root}>{children}</span>;
};
