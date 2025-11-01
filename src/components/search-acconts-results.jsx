import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { UserPicture } from './user-picture';
import styles from './search-acconts-results.module.scss';
import UserName from './user-name';
import { ButtonLink } from './button-link';
import { useNouter } from '../services/nouter';

export function SearchAccountsResults() {
  const foundUserIds = useSelector((state) => state.foundUsers);
  const allUsers = useSelector((state) => state.users);
  const { location } = useNouter();

  const offset = +location.query.offset || 0;

  // Separate groups and users
  const { groups, users } = useMemo(() => {
    const groups = [];
    const users = [];

    for (const userId of foundUserIds) {
      const user = allUsers[userId];
      if (user.type === 'group') {
        groups.push(user);
      } else {
        users.push(user);
      }
    }

    return { groups, users };
  }, [foundUserIds, allUsers]);

  if ((groups.length === 0 && users.length === 0) || offset > 0) {
    return null;
  }

  return (
    <div className="box-body">
      {groups.length > 0 && <UsersList users={groups} title="groups" />}
      {users.length > 0 && <UsersList users={users} title="users" />}
    </div>
  );
}

function UsersList({ users, title = 'users' }) {
  const tooManyUsers = users.length > 4;
  const [expanded, setExpanded] = useState(false);
  const usersToShow = useMemo(() => {
    if (tooManyUsers && !expanded) {
      return users.slice(0, 4);
    }
    return users;
  }, [tooManyUsers, expanded, users]);
  return (
    <div className={styles.usersBlock}>
      <h4 className="user-subheader">Found {title}</h4>
      <ul className={styles.userList}>
        {usersToShow.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </ul>
      {tooManyUsers && (
        <p>
          <ButtonLink onClick={() => setExpanded(!expanded)}>
            {expanded ? `Show less ${title}` : `Show all ${users.length} ${title}`}
          </ButtonLink>
        </p>
      )}
    </div>
  );
}

function UserCard({ user }) {
  return (
    <li>
      <div className={styles.userCard}>
        <UserPicture user={user} className={styles.userPicture} />
        <div className={styles.userDetails}>
          <div className={styles.userName} dir="auto">
            <UserName user={user}>{user.screenName}</UserName>
          </div>
          <div className={styles.userUsername}>@{user.username}</div>
        </div>
      </div>
    </li>
  );
}
