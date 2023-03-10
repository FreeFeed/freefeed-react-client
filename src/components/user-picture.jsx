import cn from 'classnames';
import { Link } from 'react-router';

import { useMemo } from 'react';
import styles from './user-picture.module.scss';

export function UserPicture({
  user = null,
  large = false,
  size = large ? 75 : 50,
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
        (size >= 75 ? user.profilePictureLargeUrl : user.profilePictureMediumUrl)
      }
      width={size}
      height={size}
      alt={`Profile picture of ${user.username}`}
      loading={loading}
    />
  ) : (
    fallback
  );

  const style = useMemo(() => ({ '--userpic-size': `${size}px` }), [size]);

  const clazzName = cn(
    styles.picture,
    inline && styles.pictureInline,
    !user && styles.pictureEmpty,
    className,
  );

  return withLink && user?.username ? (
    <Link to={`/${user.username}`} className={clazzName} style={style} {...restProps}>
      {content}
    </Link>
  ) : (
    <div className={clazzName} style={style} {...restProps}>
      {content}
    </div>
  );
}
