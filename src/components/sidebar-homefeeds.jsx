import React, { memo, useEffect, useMemo, useState, useRef, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { listHomeFeeds, reorderHomeFeeds } from '../redux/action-creators';
import { HomeFeedLink } from './home-feed-link';

export const SidebarHomeFeeds = memo(function SidebarHomeFeeds() {
  const dispatch = useDispatch();
  const homeFeedsCount = useSelector((state) => state.homeFeeds.length);
  const homeFeedsStatus = useSelector((state) => state.homeFeedsStatus);
  useEffect(() => void (homeFeedsStatus.initial && dispatch(listHomeFeeds())), [
    homeFeedsStatus.initial,
    dispatch,
  ]);

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

  if (homeFeedsCount <= 2) {
    return <AuxFeedsLinks />;
  }

  return (
    <li className="p-home">
      <Sortable tag="ul" options={sortableOptions} ref={srt}>
        <AuxFeedsLinks />
      </Sortable>
    </li>
  );
});

// We use this separate component because Sortable handles its DOM content by itself
function AuxFeedsLinks() {
  const homeFeeds = useSelector((state) => state.homeFeeds);

  return homeFeeds
    .filter((f) => !f.isInherent)
    .map((feed) => (
      <li className="p-home p-home--aux" key={feed.id} data-id={feed.id}>
        <HomeFeedLink feed={feed} />
      </li>
    ));
}
