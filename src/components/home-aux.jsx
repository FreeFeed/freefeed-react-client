/* global CONFIG */
import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import { Link } from 'react-router';

import { Helmet } from 'react-helmet';
import { listHomeFeeds, homeAux } from '../redux/action-creators';
import FeedOptionsSwitch from './feed-options-switch';
import ErrorBoundary from './error-boundary';
import { Throbber } from './throbber';
import { HomeFeedLink, homeFeedURI } from './home-feed-link';
import PaginatedView from './paginated-view';
import Feed from './feed';
import { postActions } from './select-utils';

export function HomeAux({ router }) {
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.authenticated);
  const allHomeFeeds = useSelector((state) => state.homeFeeds);
  const allHomeFeedsStatus = useSelector((state) => state.homeFeedsStatus);
  const sort = useSelector((state) => state.feedViewOptions.sort);

  const feed = useMemo(() => allHomeFeeds.find((f) => f.id.indexOf(router.params.listId) === 0), [
    allHomeFeeds,
    router.params.listId,
  ]);

  useEffect(() => {
    if (feed && feed.title !== router.params.listTitle) {
      router.replace({ ...router.location, pathname: homeFeedURI(feed) });
    }
  }, [feed, router, router.params.listTitle]);

  useEffect(() => void (authenticated && allHomeFeedsStatus.initial && dispatch(listHomeFeeds())), [
    authenticated,
    allHomeFeedsStatus.initial,
    dispatch,
  ]);

  useEffect(() => void (feed && dispatch(homeAux(+router.location.query.offset || 0, feed.id))), [
    router.location.query.offset,
    feed,
    dispatch,
    sort, // We should reload feed if sort changes
  ]);

  // Render
  if (!authenticated) {
    return (
      <div className="box">
        <div className="box-header-timeline">Sign in required</div>
        <div className="box-body">
          <p>
            Please{' '}
            <Link to={`/signin?back=${encodeURIComponent(router.location.pathname)}`}>sign in</Link>{' '}
            to view this page.
          </p>
        </div>
      </div>
    );
  } else if (allHomeFeedsStatus.error) {
    return (
      <div className="box">
        <div className="box-header-timeline">Cannot load page</div>
        <div className="box-body">
          <p className="alert alert-danger">
            Cannot load home feeds list: {allHomeFeedsStatus.errorText}
          </p>
        </div>
      </div>
    );
  } else if (!allHomeFeedsStatus.success) {
    return (
      <div className="box">
        <div className="box-header-timeline">{router.params.listTitle}</div>
        <div className="box-body">
          <p>
            Loading... <Throbber />
          </p>
        </div>
      </div>
    );
  } else if (!feed) {
    return (
      <div className="box">
        <div className="box-header-timeline">List not found</div>
        <div className="box-body">
          <p>
            Cannot find list here. You may have followed the wrong link or the list was deleted.
          </p>
          <p>Try switch to some other your list:</p>
          <ul>
            {allHomeFeeds.map((feed) => (
              <li key={feed.id}>
                <HomeFeedLink feed={feed} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="box">
      <Helmet title={`${feed.title} - ${CONFIG.siteTitle}`} defer={false} />
      <ErrorBoundary>
        <div className="box-header-timeline">
          {feed.title}
          <div className="pull-right">
            <FeedOptionsSwitch />
          </div>
        </div>
        <PaginatedView>
          <FeedWithProps
            emptyFeedMessage={
              <p>
                You might want to <Link to="/friends">add some users or groups</Link> in this list.
              </p>
            }
          />
        </PaginatedView>
        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
}

function selectState(state) {
  const { authenticated, createPostViewState, timelines, user, routeLoadingState } = state;

  return {
    user,
    authenticated,
    createPostViewState,
    timelines,
    feedIsLoading: routeLoadingState,
  };
}

function selectActions(dispatch) {
  return postActions(dispatch);
}

// Feed requires a lot of props to pass down to the posts, so we need to create
// this wrapper.
const FeedWithProps = connect(
  selectState,
  selectActions,
)(function FeedWithProps(props) {
  return <Feed {...props} />;
});
