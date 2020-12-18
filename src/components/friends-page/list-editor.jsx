import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import {
  createHomeFeed,
  updateHomeFeed,
  deleteHomeFeed,
  updateHomeFeedReset,
  getAllSubscriptions,
} from '../../redux/action-creators';
import { doSequence } from '../../redux/async-helpers';
import { UserPicture } from '../user-picture';
import { ButtonLink, useKeyboardEvents } from '../button-link';
import { useBool } from '../hooks/bool';
import { Throbber } from '../throbber';
import { Icon } from '../fontawesome-icons';
import { OverlayPopup } from '../overlay-popup';
import styles from './list-editor.module.scss';

export const ListEditor = memo(function ListEditor({
  listId = null,
  // close function receives an argument that is:
  // 1. ID of edited _or created_ list
  // 2. null or undefined if editor was closed with "Cancel" button
  close = () => null,
}) {
  const dispatch = useDispatch();
  const allSubscriptions = useSelector((state) => state.allSubscriptions);
  const allHomeFeeds = useSelector((state) => state.homeFeeds);
  const allUsers = useSelector((state) => state.users);
  const allSubscriptionsStatus = useSelector((state) => state.allSubscriptionsStatus);
  const submitStatus = useSelector((state) => state.crudHomeFeedStatus);

  // Fetch subscriptions and homefeeds if there are not fetched yet
  useEffect(() => void (allSubscriptionsStatus.initial && dispatch(getAllSubscriptions())), [
    allSubscriptionsStatus.initial,
    dispatch,
  ]);

  // Edited list (or null for the new one)
  const list = useMemo(() => allHomeFeeds.find((feed) => feed.id === listId), [
    allHomeFeeds,
    listId,
  ]);

  // Map of user's selection states: { [userId]: boolean }
  const [selected, setSelected] = useState({});
  // Fill the selection map when allSubscriptions data is ready
  useEffect(() => {
    const listId = list?.id;
    if (allSubscriptionsStatus.success && listId) {
      const sel = {};
      for (const { id, homeFeeds } of allSubscriptions) {
        if (homeFeeds.includes(listId)) {
          sel[id] = true;
        }
      }
      setSelected(sel);
    }
  }, [allSubscriptionsStatus.success, allSubscriptions, list?.id]);

  const totalCount = allSubscriptions.length;
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const onSelect = useCallback((id, sel) => setSelected({ ...selected, [id]: sel }), [selected]);

  // Filter users by selection
  const [showSelected, , showSelectionOnly, showAll] = useBool(false);

  // Filter users by name
  const [nameFilter, setNameFilter] = useState('');
  const onFilterChange = useCallback(({ target }) => setNameFilter(target.value), []);
  const clearFilter = useCallback(() => setNameFilter(''), []);

  // List title edit
  const [listTitle, setListTitle] = useState('');
  const onListTitleChange = useCallback(({ target }) => setListTitle(target.value), []);

  // Set list title when data is loaded
  useEffect(() => {
    if (allSubscriptionsStatus.success) {
      setListTitle(list?.title || '');
    }
  }, [allSubscriptionsStatus.success, list?.title]);

  // Prepare users data
  const users = useMemo(() => {
    const filter = nameFilter.trim();
    return allSubscriptions
      .map(({ id, homeFeeds }) => ({
        ...allUsers[id],
        selected: !!selected[id],
        homeless: homeFeeds.length === 0 || (homeFeeds.length === 1 && homeFeeds[0] === list?.id),
      }))
      .filter((u) => !showSelected || u.selected)
      .filter((u) => !filter || u.username.includes(filter) || u.screenName.includes(filter));
  }, [allSubscriptions, allUsers, selected, showSelected, nameFilter, list?.id]);

  const hasHomeless = useMemo(() => users.some((u) => u.homeless && !u.selected), [users]);
  const returnListId = useRef(list?.id);

  // Handle submit
  const canSubmit = useMemo(() => allSubscriptionsStatus.success && listTitle.trim() !== '', [
    allSubscriptionsStatus.success,
    listTitle,
  ]);

  const doSubmit = useCallback(() => {
    if (!canSubmit) {
      return;
    }
    const listId = list && list.id;
    const data = {
      subscribedTo: Object.keys(selected).filter((id) => !!selected[id]),
    };

    if (!list || !list.isInherent) {
      data.title = listTitle;
    }
    doSequence(dispatch)(
      (dispatch) => dispatch(listId ? updateHomeFeed(listId, data) : createHomeFeed(data)),
      (_, { payload }) => (returnListId.current = payload.timeline.id),
    );
  }, [canSubmit, selected, dispatch, list, listTitle]);

  // Handle cancel
  const doCancel = useCallback(() => close(), [close]);

  // Handle delete
  const doDelete = useCallback(() => {
    const selectedIds = Object.keys(selected).filter((id) => !!selected[id]);
    if (
      !confirm(
        `Are you sure you want to delete this list?${
          selectedIds.length > 0
            ? `\nAll remaining list subscriptions will be moved to the main Home list.`
            : ``
        }`,
      )
    ) {
      return;
    }
    const listId = list?.id;

    doSequence(dispatch)(
      (dispatch) => dispatch(updateHomeFeed(listId, { subscribedTo: selectedIds })),
      (dispatch) => dispatch(deleteHomeFeed(listId)),
    );
  }, [dispatch, list?.id, selected]);

  // Close this dialog on success and pass returnListId to the close function
  useEffect(
    () =>
      void (submitStatus.success && (close(returnListId.current), dispatch(updateHomeFeedReset()))),
    [submitStatus.success, close, dispatch],
  );

  return (
    <OverlayPopup close={doCancel}>
      <section className={styles.wrapper}>
        <header className={styles.header}>
          {list && list.isInherent ? (
            <h3>{list.title}</h3>
          ) : (
            <dl className={styles.topForm}>
              <dt>List title</dt>
              <dd>
                <input
                  type="text"
                  autoFocus={!list}
                  className="form-control input-lg"
                  placeholder={`Name your ${list ? '' : 'new '}list (required)`}
                  value={listTitle}
                  onChange={onListTitleChange}
                />
              </dd>
            </dl>
          )}
          <p>
            Show:{' '}
            <ButtonLinkX onClick={showAll} selected={!showSelected}>
              All ({totalCount})
            </ButtonLinkX>
            {' - '}
            <ButtonLinkX onClick={showSelectionOnly} selected={showSelected}>
              Selected ({selectedCount})
            </ButtonLinkX>
            {' - '}
            Filter by name:{' '}
            <input
              type="search"
              name="nameFilter"
              autoFocus={!!list}
              value={nameFilter}
              onChange={onFilterChange}
              className={cn('form-control input-sm', styles.filterInput)}
            />{' '}
            (<ButtonLink onClick={clearFilter}>clear</ButtonLink>)
          </p>
        </header>
        <main>
          <div className={styles.content}>
            {allSubscriptionsStatus.success ? (
              <UsersList users={users} onSelect={onSelect} highlight={nameFilter.trim()} />
            ) : allSubscriptionsStatus.error ? (
              <p className="alert alert-danger" role="alert">
                Error loading subscriptions: {allSubscriptionsStatus.errorText}
              </p>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </main>
        <footer className={styles.footer}>
          <button
            className={cn('btn btn-primary ', (!canSubmit || submitStatus.loading) && 'disabled')}
            type="submit"
            onClick={doSubmit}
          >
            {list
              ? submitStatus.loading
                ? `Saving changes...`
                : `Save changes`
              : submitStatus.loading
              ? 'Creating list...'
              : 'Create list'}
          </button>
          <button className="btn btn-link" type="reset" onClick={doCancel}>
            Cancel
          </button>
          {submitStatus.loading && <Throbber />}
          {list && !list.isInherent && (
            <button
              className={cn('btn btn-danger pull-right', submitStatus.loading && 'disabled')}
              type="button"
              onClick={doDelete}
            >
              Delete list
            </button>
          )}
          {submitStatus.error && (
            <p className="alert alert-danger" role="alert">
              {submitStatus.errorText}
            </p>
          )}
          {hasHomeless && (
            <div className={cn(styles.submitWarning, 'text-muted')}>
              <Icon icon={faExclamationTriangle} /> There are subscriptions that is not in any of
              your friend lists. It is allowed but probably it isn&#x2019;t what you want.
            </div>
          )}
        </footer>
      </section>
    </OverlayPopup>
  );
});

const UsersList = memo(function UsersList({ users, onSelect, highlight }) {
  return (
    <ul className={styles.list}>
      {users.map((user) => (
        <UserCell key={user.id} user={user} onSelect={onSelect} highlight={highlight} />
      ))}
    </ul>
  );
});

const UserCell = memo(function UserCell({ user, onSelect, highlight }) {
  const kbdHandlers = useKeyboardEvents(
    useCallback(() => onSelect(user.id, !user.selected), [user, onSelect]),
  );

  return (
    <li
      className={cn(styles.cell, user.selected && styles.cellSelected)}
      role="checkbox"
      aria-checked={user.selected}
      tabIndex={0}
      {...kbdHandlers}
    >
      <UserPicture user={user} withLink={false} />
      <div>
        <div className={styles.screenName}>{hl(user.screenName, highlight)}</div>
        <div className={styles.username}>@{hl(user.username, highlight)}</div>
        {user.homeless && !user.selected && (
          <Icon
            icon={faExclamationTriangle}
            className={styles.homelessMark}
            title={`This ${user.type} is in no lists`}
          />
        )}
      </div>
    </li>
  );
});

function hl(text, h) {
  if (h === '' || !text.includes(h)) {
    return text;
  }
  const result = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const p = text.indexOf(h);
    if (p === -1) {
      text && result.push(text);
      break;
    } else if (p > 0) {
      result.push(text.substring(0, p));
    }
    result.push(
      <mark className={styles.mark} key={`${text}__${result.length}`}>
        {h}
      </mark>,
    );
    text = text.substring(p + h.length);
  }
  return result;
}

function ButtonLinkX({ selected = false, onClick, ...props }) {
  if (selected) {
    props.className = cn(styles.currentLink, props.className);
    return <span className={styles.currentLink} {...props} />;
  }
  return <ButtonLink onClick={onClick} {...props} />;
}
