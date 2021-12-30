import { pluralForm } from '../../utils';
import { useCommentLikers } from '../comment-likers';
import { OverlayPopup } from '../overlay-popup';
import { Throbber } from '../throbber';
import UserName from '../user-name';
import { UserPicture } from '../user-picture';

import styles from './post-comment-likes.module.scss';

export function PostCommentLikes({ id, close }) {
  const { status, likers } = useCommentLikers(id);

  return (
    <OverlayPopup close={close}>
      <section className={styles.container}>
        <header className={styles.header}>
          <h3>{pluralForm(likers?.length, 'User', 'Users', 'w')} liked this comment</h3>
        </header>
        <main className={styles.body}>
          {status.loading && <Throbber />}
          {status.error && `Error: ${status.errorText}`}
          {status.success && (
            <ul className={styles.list}>
              {likers.map((u) => (
                <li key={u.id} className={styles.item}>
                  <UserPicture user={u} />
                  <UserName user={u} noUserCard />
                </li>
              ))}
            </ul>
          )}
        </main>
      </section>
    </OverlayPopup>
  );
}
