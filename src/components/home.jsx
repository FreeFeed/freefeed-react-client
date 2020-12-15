import { memo, useCallback } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux';
import { Link, withRouter } from 'react-router';

import {
  createPost,
  resetPostCreateForm,
  expandSendTo,
  toggleHiddenPosts,
  home,
} from '../redux/action-creators';
import { pluralForm } from '../utils';
import { postActions } from './select-utils';
import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';
import FeedOptionsSwitch from './feed-options-switch';
import Welcome from './welcome';
import ErrorBoundary from './error-boundary';
import { ButtonLink } from './button-link';
import { useBool } from './hooks/bool';
import { lazyComponent } from './lazy-component';
import { InvisibleSelect } from './invisibe-select';
import { homeFeedURI } from './home-feed-link';
import { useMediaQuery } from './hooks/media-query';

const ListEditor = lazyComponent(
  () => import('./friends-page/list-editor').then((m) => ({ default: m.ListEditor })),
  { fallback: <p>Loading list editor...</p>, errorMessage: "Couldn't load list editor" },
);

const FeedHandler = (props) => {
  const dispatch = useDispatch();
  const feedId = useSelector((state) => state.feedViewState.timeline?.id);
  const [isEditing, , showEditor, hideEditor] = useBool(false);
  const closeEditor = useCallback((listId) => (hideEditor(), listId && dispatch(home())), [
    hideEditor,
    dispatch,
  ]);

  const createPostComponent = (
    <CreatePost
      createPostViewState={props.createPostViewState}
      sendTo={props.sendTo}
      user={props.user}
      createPost={props.createPost}
      resetPostCreateForm={props.resetPostCreateForm}
      expandSendTo={props.expandSendTo}
      addAttachmentResponse={props.addAttachmentResponse}
      showMedia={props.showMedia}
    />
  );

  return (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline">
          <TopHomeSelector id={feedId} />{' '}
          {feedId && (
            <small>
              (<ButtonLink onClick={showEditor}>Edit list</ButtonLink>)
            </small>
          )}
          <div className="pull-right">{props.authenticated && <FeedOptionsSwitch />}</div>
        </div>
        {isEditing && <ListEditor listId={feedId} close={closeEditor} />}

        <SubscrRequests />

        {props.authenticated ? (
          <PaginatedView firstPageHead={createPostComponent} {...props}>
            <Feed {...props} isInHomeFeed={!props.feedIsLoading} />
          </PaginatedView>
        ) : (
          <Welcome />
        )}
        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
};

function selectState(state) {
  const { authenticated, boxHeader, createPostViewState, timelines, user } = state;

  const sendTo = { ...state.sendTo, defaultFeed: user.username };
  const feedIsLoading = state.routeLoadingState;

  return {
    user,
    authenticated,
    createPostViewState,
    timelines,
    boxHeader,
    sendTo,
    feedIsLoading,
  };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) =>
      dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    expandSendTo: () => dispatch(expandSendTo()),
    toggleHiddenPosts: () => dispatch(toggleHiddenPosts()),
  };
}

export default connect(selectState, selectActions)(FeedHandler);

export const SubscrRequests = memo(function SubscrRequests() {
  const userRequestsCount = useSelector((state) => state.userRequestsCount);
  const groupRequestsCount = useSelector((state) => state.groupRequestsCount);

  const uLink = userRequestsCount && (
    <Link key="uLink" to="/friends?show=requests">
      {pluralForm(userRequestsCount, 'subscription request')}
    </Link>
  );

  const gLink = groupRequestsCount && (
    <Link key="gLink" to="/friends?show=requests">
      {pluralForm(groupRequestsCount, 'group subscription request')}
    </Link>
  );

  const links = [uLink, gLink].filter(Boolean);
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="box-message alert alert-info">
      <span className="message">
        <span>
          <span>You have </span>
          {links.map((link, i) => (
            <span key={link.key}>
              {i > 0 && ' and '}
              {link}
            </span>
          ))}
        </span>
      </span>
    </div>
  );
});

export const TopHomeSelector = withRouter(function TopHomeSelector({ router, id }) {
  const homeFeeds = useSelector((state) => state.homeFeeds);
  const narrowScreen = useMediaQuery('(max-width: 991px)');

  const onChange = useCallback(
    (e) => router.push(homeFeedURI(homeFeeds.find((h) => h.id === e.target.value))),
    [homeFeeds, router],
  );

  if (homeFeeds.length === 1) {
    return homeFeeds[0].title;
  }

  if (!narrowScreen) {
    return homeFeeds.find((h) => h.id === id)?.title || 'Home';
  }

  return (
    <InvisibleSelect value={id} onChange={onChange} withCaret>
      {homeFeeds.map((h) => (
        <option key={h.id} value={h.id}>
          {h.title}
        </option>
      ))}
    </InvisibleSelect>
  );
});
