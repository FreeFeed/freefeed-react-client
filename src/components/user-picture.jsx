import cn from 'classnames';
import { Link } from 'react-router';

import styles from './user-picture.module.scss';

export function UserPicture({
  user = null,
  large = false,
  inline = false,
  loading,
  withLink = true,
  className = '',
  fallback = '...',
  ...restProps
}) {
  const content = user ? (
    <img
      src={
        user.profilePictureUrl ||
        (large ? user.profilePictureLargeUrl : user.profilePictureMediumUrl)
      }
      width={large ? 75 : 50}
      height={large ? 75 : 50}
      alt={`Profile picture of ${user.username}`}
      loading={loading}
    />
  ) : (
    fallback
  );

  const clazzName = cn(
    styles.picture,
    large && styles.pictureLarge,
    inline && styles.pictureInline,
    !user && styles.pictureEmpty,
    className,
  );

  return withLink && user?.username ? (
    <Link to={`/${user.username}`} className={clazzName} {...restProps}>
      {content}
    </Link>
  ) : (
    <div className={clazzName} {...restProps}>
      {content}
    </div>
  );
}
