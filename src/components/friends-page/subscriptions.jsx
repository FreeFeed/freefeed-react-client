import React, { useMemo, useCallback, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import cn from 'classnames';
import { ButtonLink } from '../button-link';
import { ListEditor } from './list-editor';
import styles from './styles.module.scss';
import { useSortNGroup } from './sort-n-group';
import { UsersGrid } from './ui';

export function Subscriptions({ listId = '', onListChange }) {
  const homeFeeds = useSelector((state) => state.homeFeeds);
  const feed = useMemo(() => homeFeeds.find((f) => f.id === listId), [listId, homeFeeds]);

  const allSubscriptions = useSelector((state) => state.allSubscriptions);
  const allUsers = useSelector((state) => state.users);
  const subscribers = useSelector((state) => state.usernameSubscribers.payload);
  const subscribersSet = useMemo(() => new Set(subscribers.map((u) => u.id)), [subscribers]);

  const { sortByDate, group, control: sortNGroup } = useSortNGroup();

  const users = useMemo(() => {
    const feedId = feed?.id;
    const users = feedId
      ? allSubscriptions.filter((s) => s.homeFeeds.includes(feedId)).map((s) => allUsers[s.id])
      : allSubscriptions.map((s) => allUsers[s.id]);
    if (!sortByDate) {
      users.sort((u1, u2) => u1.username.localeCompare(u2.username));
    }
    return users;
  }, [allSubscriptions, feed?.id, allUsers, sortByDate]);

  const groups = useMemo(
    () =>
      [
        {
          title: 'Mutual friends',
          users: users.filter((u) => subscribersSet.has(u.id)),
        },
        {
          title: 'Users',
          users: users.filter((u) => !subscribersSet.has(u.id) && u.type === 'user'),
        },
        {
          title: 'Groups',
          users: users.filter((u) => u.type === 'group'),
        },
      ].filter((g) => g.users.length > 0),
    [users, subscribersSet],
  );

  const [editorOpened, setEditorOpened] = useState(false);
  const editedListId = useRef(null);
  const openEditor = useCallback(
    (listId = null) => ((editedListId.current = listId), setEditorOpened(true)),
    [],
  );

  const onListSelect = useCallback(({ target }) => onListChange(target.value), [onListChange]);
  const addList = useCallback(() => openEditor(), [openEditor]);

  const editCurrentList = useCallback(() => openEditor(feed?.id), [openEditor, feed?.id]);
  const closeEditor = useCallback(
    (listId) => (setEditorOpened(false), listId && onListChange(listId)),
    [onListChange],
  );

  return (
    <>
      <div className={styles.listSelectorContainer}>
        <div>
          Manage:{' '}
          <select
            value={feed?.id || ''}
            onChange={onListSelect}
            className={cn('form-control', styles.listSelector)}
          >
            <option value="">All subscriptions</option>
            {homeFeeds.map((feed) => (
              <option key={feed.id} value={feed.id}>
                {feed.title}
              </option>
            ))}
          </select>{' '}
          {feed && <ButtonLink onClick={editCurrentList}>Edit this list</ButtonLink>}
        </div>
        <ButtonLink onClick={addList}>Add friend list</ButtonLink>
      </div>
      {editorOpened && <ListEditor close={closeEditor} listId={editedListId.current} />}
      <h2>
        {feed?.title || 'All subscriptions'} {users.length > 0 && <small>({users.length})</small>}
      </h2>
      {allSubscriptions.length === 0 ? (
        <p>You&#x2019;re not subscribed to anybody yet.</p>
      ) : users.length === 0 ? (
        <p className="alert alert-info" role="alert">
          This friend list is empty! To get started,{' '}
          <ButtonLink onClick={editCurrentList}>choose the friends</ButtonLink> you would like to
          see here.
        </p>
      ) : (
        <>
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
              <UsersGrid users={users} />
            </div>
          )}
        </>
      )}
    </>
  );
}
