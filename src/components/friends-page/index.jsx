/* global CONFIG */
import React, { useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';

import { Helmet } from 'react-helmet';
import ErrorBoundary from '../error-boundary';
import {
  combineAsyncStates,
  loadingAsyncState,
  successAsyncState,
  errorAsyncState,
  initialAsyncState,
} from '../../redux/async-helpers';
import { getAllSubscriptions, subscribers, blockedByMe } from '../../redux/action-creators';
import { Throbber } from '../throbber';
import styles from './styles.module.scss';
import { Subscribers } from './subscribers';
import { Blocked } from './blocked';
import { Subscriptions } from './subscriptions';
import { Requests } from './requests';

const tabIds = ['', 'blocked', 'subscribers', 'requests'];

export const Friends = withLayout(function Friends({ router }) {
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.authenticated);
  const thisUsername = useSelector((state) => state.user.username || null);
  const currentList = useSelector(
    (state) => state.routing.locationBeforeTransitions?.query.show || '',
  );
  const homeFeeds = useSelector((state) => state.homeFeeds);

  const allSubscriptionsStatus = useSelector((state) => state.allSubscriptionsStatus);
  const blockedByMeStatus = useSelector((state) => state.blockedByMeStatus);
  const subscribersStatus = useSelector((state) => toAsyncStatus(state.usernameSubscribers));

  const subscribersCount = useSelector((state) => state.usernameSubscribers.payload.length);
  const subscriptionsCount = useSelector((state) => state.allSubscriptions.length);
  const blockedCount = useSelector((state) => state.user.banIds?.length || 0);

  const incomingRequestsCount = useSelector(
    (state) => state.groupRequestsCount + state.userRequestsCount,
  );

  const dataStatus = useMemo(
    () => combineAsyncStates(allSubscriptionsStatus, blockedByMeStatus, subscribersStatus),
    [allSubscriptionsStatus, blockedByMeStatus, subscribersStatus],
  );

  const activeTab = useMemo(() => (tabIds.includes(currentList) ? currentList : ''), [currentList]);

  const onListChange = useCallback(
    (newList) => {
      newList !== currentList &&
        router.push({ ...router.location, query: newList ? { show: newList } : {} });
    },
    [currentList, router],
  );

  useEffect(() => {
    const validListValues = [...tabIds, ...homeFeeds.map((f) => f.id)];
    if (allSubscriptionsStatus.success && !validListValues.includes(currentList)) {
      router.replace({ ...router.location, query: {} });
    }
  }, [allSubscriptionsStatus.success, currentList, router, homeFeeds]);

  // Initial data loading
  useEffect(
    () =>
      void (
        authenticated &&
        (dispatch(getAllSubscriptions()),
        dispatch(subscribers(thisUsername)),
        dispatch(blockedByMe()))
      ),
    [authenticated, dispatch, thisUsername],
  );

  if (!authenticated) {
    return (
      <p>
        Please <Link to={`/signin?back=${encodeURIComponent('/friends')}`}>sign in</Link> to view
        this page.
      </p>
    );
  } else if (dataStatus.error) {
    return (
      <p className="alert alert-danger" role="alert">
        Cannot load page data: {dataStatus.errorText}
      </p>
    );
  } else if (!dataStatus.success) {
    return (
      <p>
        Loading data... <Throbber />
      </p>
    );
  }

  return (
    <>
      <Helmet
        title=""
        titleTemplate={`%s - Friends - ${CONFIG.siteTitle}`}
        defaultTitle={`Friends - ${CONFIG.siteTitle}`}
        defer={false}
      />

      <ul className={cn('nav nav-tabs', styles.topNav)}>
        <Tab id="" activeId={activeTab}>
          Subscriptions <small className={styles.tabCounter}>{subscriptionsCount || ''}</small>
        </Tab>
        <Tab id="subscribers" activeId={activeTab}>
          Subscribers <small className={styles.tabCounter}>{subscribersCount || ''}</small>
        </Tab>
        <Tab id="blocked" activeId={activeTab}>
          Blocked users <small className={styles.tabCounter}>{blockedCount || ''}</small>
        </Tab>
        <Tab id="requests" activeId={activeTab}>
          Requests{' '}
          {incomingRequestsCount > 0 && (
            <>
              <small className={styles.tabCounter}>{incomingRequestsCount || ''}</small>
              <span className={styles.incomingRequestsMarker} />
            </>
          )}
        </Tab>
      </ul>

      {activeTab === 'subscribers' ? (
        <Subscribers />
      ) : activeTab === 'blocked' ? (
        <Blocked />
      ) : activeTab === 'requests' ? (
        <Requests />
      ) : (
        <Subscriptions listId={currentList} onListChange={onListChange} />
      )}
    </>
  );
});

function withLayout(Component) {
  const wrapper = (props) => (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline">Friends</div>
        <div className="box-body">
          <Component {...props} />
        </div>
        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
  wrapper.displayName = `Layout(${Component.displayName || Component.name || 'unnamed'})`;
  return wrapper;
}

function toAsyncStatus({ initial, isPending, errorString }) {
  if (initial) {
    return initialAsyncState;
  } else if (isPending) {
    return loadingAsyncState;
  } else if (errorString === '') {
    return successAsyncState;
  }
  return errorAsyncState(errorString);
}

function Tab({ id, activeId, children }) {
  const location = useSelector((state) => state.routing.locationBeforeTransitions);
  return (
    <li role="presentation" className={cn({ active: id === activeId })}>
      <Link to={{ ...location, query: id ? { show: id } : {} }}>{children}</Link>
    </li>
  );
}
