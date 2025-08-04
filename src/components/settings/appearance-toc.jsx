import settingsStyles from './settings.module.scss';
import tocStyles from './appearance-toc.module.scss';
import { useToc } from './toc/context';

export function AppearanceToc() {
  const { items } = useToc();
  return (
    <section className={settingsStyles.formSection}>
      <h4>Quick links</h4>
      <ul className={tocStyles.toc}>
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`}>{item.content}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
