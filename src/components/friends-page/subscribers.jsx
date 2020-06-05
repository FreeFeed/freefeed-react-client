import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

import { UsersGrid } from './ui';
import { useSortNGroup } from './sort-n-group';
import styles from './styles.module.scss';

export function Subscribers() {
  const subscribers = useSelector((state) => state.usernameSubscribers.payload);
  const allSubscriptions = useSelector((state) => state.allSubscriptions);
  const subscriptionsSet = useMemo(() => new Set(allSubscriptions.map((u) => u.id)), [
    allSubscriptions,
  ]);

  const { sortByDate, group, control: sortNGroup } = useSortNGroup();

  const users = useMemo(() => {
    const users = [...subscribers];
    if (!sortByDate) {
      users.sort((u1, u2) => u1.username.localeCompare(u2.username));
    }
    return users;
  }, [sortByDate, subscribers]);

  const groups = useMemo(
    () =>
      [
        {
          title: 'Mutual friends',
          users: users.filter((u) => subscriptionsSet.has(u.id)),
        },
        {
          title: 'Subscribed to you',
          users: users.filter((u) => !subscriptionsSet.has(u.id)),
        },
      ].filter((g) => g.users.length > 0),
    [users, subscriptionsSet],
  );

  return (
    <>
      <Helmet title="Subscribers" defer={false} />
      <h2>
        Subscribers <small>({subscribers.length})</small>
      </h2>
      {sortNGroup}
      {group ? (
        groups.map((g) => (
          <div key={g.title}>
            <h3>
              {g.title} <small>({g.users.length})</small>
            </h3>
            <UsersGrid users={g.users} />
          </div>
        ))
      ) : (
        <div className={styles.listWithoutGroups}>
          <UsersGrid users={subscribers} />
        </div>
      )}
    </>
  );
}
