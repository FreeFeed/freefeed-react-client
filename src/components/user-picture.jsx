import cn from 'classnames';
import { Link } from 'react-router';

import styles from './user-picture.module.scss';

export function UserPicture({
  user = null,
  large = false,
  small = false,
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
      width={small ? 25 : large ? 75 : 50}
      height={small ? 25 : large ? 75 : 50}
      alt={`Profile picture of ${user.username}`}
      loading={loading}
      className={className}
    />
  ) : (
    fallback
  );

  const clazzName = cn(
    styles.picture,
    large && styles.pictureLarge,
    small && styles.pictureSmall,
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
