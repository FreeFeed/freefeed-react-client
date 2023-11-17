import { useDispatch, useSelector } from 'react-redux';
import { faBell, faBellSlash } from '@fortawesome/free-regular-svg-icons';
import { useCallback } from 'react';
import styles from '../dropdown-menu.module.scss';
import { ButtonLink } from '../button-link';
import { notifyOfAllComments } from '../../redux/action-creators';
import { MenuItemIconic } from './menu-item-iconic';

export function MenuItemNotifyOfAllComments({ postId, doAndClose }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isEnabled = useSelector((state) => state.posts[postId]?.notifyOfAllComments ?? false);

  const toggleNotifications = useCallback(
    () => dispatch(notifyOfAllComments(postId, !isEnabled)),
    [dispatch, isEnabled, postId],
  );

  return (
    !!user.id && (
      <div className={styles.item} key="translate">
        <ButtonLink className={styles.link} onClick={doAndClose(toggleNotifications)}>
          <MenuItemIconic icon={isEnabled ? faBellSlash : faBell}>
            {isEnabled ? 'Don\u2019t notify' : 'Notify'} of new comments
          </MenuItemIconic>
        </ButtonLink>
      </div>
    )
  );
}
