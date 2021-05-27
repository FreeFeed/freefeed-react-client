import { memo, useEffect, useState, forwardRef, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';
import cn from 'classnames';

import { noop } from 'lodash';
import { KEY_DOWN, KEY_UP } from 'keycode-js';
import { reorderHomeFeeds } from '../redux/action-creators';
import { HomeFeedLink } from './home-feed-link';
import { Icon } from './fontawesome-icons';
import styles from './sidebar-homefeeds.module.scss';

export const SidebarHomeFeeds = memo(function SidebarHomeFeeds({ homeFeedsCount }) {
  const dispatch = useDispatch();

  // Load 'react-sortablejs' asynchronously. It is OK if loading faied, in this
  // case user will still see all feeds in sidebar but won't be able to sort
  // them.
  const [Sortable, setSortable] = useState(() =>
    // eslint-disable-next-line no-unused-vars
    forwardRef(({ children }, ref) => <ul>{children}</ul>),
  );
  useEffect(
    () =>
      void import(/* webpackPrefetch: true */ 'react-sortablejs').then(
        (m) => setSortable(() => m.ReactSortable),
        (err) => console.warn(`Cannot load 'react-sortablejs'`, err),
      ),
    [],
  );
  const allHomeFeeds = useSelector((state) => state.homeFeeds);

  // ReactSortable is a controlled component so we need a local state for it
  const [feedsList, setFeedsList] = useState(() =>
    allHomeFeeds.filter((f) => !f.isInherent).map((f) => ({ id: f.id })),
  );
  const feedsToRender = useMemo(
    () => feedsList.map((it) => allHomeFeeds.find((f) => f.id === it.id)).filter(Boolean),
    [feedsList, allHomeFeeds],
  );

  // We use versions to track external feeds order updates (from other tabs or clients via realtime)
  const homeFeedsOrderVersion = useSelector((state) => state.homeFeedsOrderVersion);
  const version = useRef(homeFeedsOrderVersion);
  useEffect(() => {
    if (version.current !== homeFeedsOrderVersion) {
      version.current = homeFeedsOrderVersion;
      setFeedsList(allHomeFeeds.filter((f) => !f.isInherent).map((f) => ({ id: f.id })));
    }
  }, [homeFeedsOrderVersion, allHomeFeeds]);

  const srt = useRef();
  const onEnd = useCallback(
    (e) => {
      if (e.oldIndex !== e.newIndex) {
        dispatch(reorderHomeFeeds(srt.current.sortable.toArray()));
      }
    },
    [dispatch],
  );

  const onMove = useCallback(
    (id, direction) => {
      const index = feedsList.findIndex((f) => f.id === id);
      if (
        index === -1 ||
        (index === 0 && direction === 'up') ||
        (index === feedsList.length - 1 && direction === 'down')
      ) {
        return;
      }
      const list = feedsList.map((r) => r.id);
      const t = list[index];
      if (direction === 'up') {
        list[index] = list[index - 1];
        list[index - 1] = t;
      } else if (direction === 'down') {
        list[index] = list[index + 1];
        list[index + 1] = t;
      }
      dispatch(reorderHomeFeeds(list));
    },
    [feedsList, dispatch],
  );

  if (homeFeedsCount <= 2) {
    return (
      <ul>
        <AuxFeedsLinks feeds={feedsToRender} />
      </ul>
    );
  }

  return (
    <Sortable
      tag="ul"
      ref={srt}
      onEnd={onEnd}
      list={feedsList}
      setList={setFeedsList}
      handle={`.${styles.handle}`}
      chosenClass={styles.chosen}
    >
      <AuxFeedsLinks feeds={feedsToRender} sortable onMove={onMove} />
    </Sortable>
  );
});

function AuxFeedsLinks({ feeds, sortable = false, onMove = noop }) {
  const onKeyDown = useCallback(
    (e) => {
      if (e.keyCode === KEY_DOWN) {
        onMove(e.target.dataset.id, 'down');
        e.preventDefault();
      } else if (e.keyCode === KEY_UP) {
        onMove(e.target.dataset.id, 'up');
        e.preventDefault();
      }
    },
    [onMove],
  );

  return feeds.map((feed) => (
    <li className={styles.row} key={feed.id} data-id={feed.id}>
      <div className={styles.title}>
        <HomeFeedLink feed={feed} />
      </div>
      {sortable && (
        <div
          className={cn(styles.handle, 'draggable')}
          title="Move list up or down"
          aria-label="Move list up or down"
          tabIndex={0}
          data-id={feed.id}
          onKeyDown={onKeyDown}
        >
          <Icon icon={faGripVertical} />
        </div>
      )}
    </li>
  ));
}
