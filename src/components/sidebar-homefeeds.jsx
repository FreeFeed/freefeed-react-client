import React, { memo, useEffect, useMemo, useState, useRef, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { listHomeFeeds, reorderHomeFeeds } from '../redux/action-creators';
import { HomeFeedLink } from './home-feed-link';

export const SidebarHomeFeeds = memo(function SidebarHomeFeeds() {
  const dispatch = useDispatch();
  const allHomeFeeds = useSelector((state) => state.homeFeeds);
  const allHomeFeedsStatus = useSelector((state) => state.homeFeedsStatus);
  useEffect(() => void (allHomeFeedsStatus.initial && dispatch(listHomeFeeds())), [
    allHomeFeedsStatus.initial,
    dispatch,
  ]);

  const auxHomeFeeds = useMemo(() => allHomeFeeds.filter((f) => !f.isInherent), [allHomeFeeds]);

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
        (m) => setSortable(() => m.default),
        (err) => console.warn(`Cannot load 'react-sortablejs'`, err),
      ),
    [],
  );

  const srt = useRef(null);
  const sortableOptions = useMemo(
    () => ({
      onEnd: ({ oldIndex, newIndex }) => {
        if (oldIndex === newIndex) {
          return;
        }
        dispatch(reorderHomeFeeds(srt.current.sortable.toArray()));
      },
    }),
    [dispatch],
  );

  if (auxHomeFeeds.length === 0) {
    return null;
  }

  if (auxHomeFeeds.length === 1) {
    return (
      <li className="p-home p-home--aux">
        <HomeFeedLink feed={auxHomeFeeds[0]} />
      </li>
    );
  }

  return (
    <li className="p-home">
      <Sortable tag="ul" options={sortableOptions} ref={srt}>
        {auxHomeFeeds.map((feed) => (
          <li className="p-home p-home--aux" key={feed.id} data-id={feed.id}>
            <HomeFeedLink feed={feed} />
          </li>
        ))}
      </Sortable>
    </li>
  );
});
