import React, { useCallback } from 'react';
import cn from 'classnames';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import UserName from '../user-name';
import { UserPicture } from '../user-picture';
import { Icon } from '../fontawesome-icons';
import { useInViewport } from '../hooks/in-viewport';
import styles from './styles.module.scss';

export function UsersGrid({ users }) {
  if (users.length === 0) {
    return null;
  }
  return (
    <ul className={styles.usersGrid}>
      {users.map((user) => (
        <UsersGridCell key={user.id} user={user} />
      ))}
    </ul>
  );
}

export function UsersGridCell({ user }) {
  const [ref, inViewport] = useInViewport();
  return (
    <li ref={ref} className={cn(styles.userCell, !inViewport && styles.userCellPlaceholder)}>
      {inViewport && (
        <>
          <UserPicture user={user} loading="lazy" />
          <br />
          <UserName user={user} />
        </>
      )}
    </li>
  );
}

export function UsersList({ users, children: renderActions = () => null }) {
  if (users.length === 0) {
    return null;
  }
  return (
    <ul className={styles.usersList}>
      {users.map((user) => (
        <li key={user.id} className={styles.usersListItem}>
          <UserHorCell user={user} />
          <div>{renderActions(user)}</div>
        </li>
      ))}
    </ul>
  );
}

export function UserHorCell({ user }) {
  return (
    <div className={styles.userHorCell}>
      <UserPicture user={user} />
      <div>
        <UserName user={user}>{user.screenName}</UserName>
        <br />@{user.username}
      </div>
    </div>
  );
}

export function ErrorIcon({ message, className }) {
  const onClick = useCallback(() => alert(message), [message]);

  if (!message) {
    return null;
  }
  return (
    <button
      onClick={onClick}
      className={cn(className, styles.errorIconButton)}
      title={message}
      aria-label={message}
    >
      <Icon icon={faExclamationTriangle} className="text-danger" />
    </button>
  );
}
