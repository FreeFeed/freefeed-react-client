import { memo, useEffect, useState, forwardRef, useCallback, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { reorderHomeFeeds } from '../redux/action-creators';
import { HomeFeedLink } from './home-feed-link';

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
    () => feedsList.map((it) => allHomeFeeds.find((f) => f.id === it.id)),
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

  if (homeFeedsCount <= 2) {
    return (
      <ul>
        <AuxFeedsLinks feeds={feedsToRender} />
      </ul>
    );
  }

  return (
    <Sortable tag="ul" ref={srt} onEnd={onEnd} list={feedsList} setList={setFeedsList}>
      <AuxFeedsLinks feeds={feedsToRender} />
    </Sortable>
  );
});

function AuxFeedsLinks({ feeds }) {
  return feeds.map((feed) => (
    <li className="p-home" key={feed.id} data-id={feed.id}>
      <HomeFeedLink feed={feed} />
    </li>
  ));
}
