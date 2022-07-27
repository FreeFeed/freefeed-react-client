import { PureComponent, useState, useCallback } from 'react';
import { connect } from 'react-redux';

import { DISCUSSIONS, GET_EVERYTHING, GET_SUMMARY, HOME, HOME_AUX } from '../redux/action-types';
import { toggleHiddenPosts } from '../redux/action-creators';
import ErrorBoundary from './error-boundary';
import Post from './post/post';
import { PostRecentlyHidden } from './post/post-hides-ui';
import { joinPostData } from './select-utils';
import { isMediaAttachment } from './media-viewer';

const HiddenEntriesToggle = (props) => {
  const entriesForm = props.count > 1 ? 'entries' : 'entry';
  let label;

  if (props.isOpen) {
    label = `\u25BC Don't show ${props.count} hidden ${entriesForm}`;
  } else {
    label = `\u25BA Show ${props.count} hidden ${entriesForm}`;
  }

  return (
    <div className="hidden-posts-toggle">
      <a onClick={props.toggle}>{label}</a>
    </div>
  );
};

class Feed extends PureComponent {
  showMedia = (params) => {
    const { props } = this;

    props.showMedia({
      ...params,
      navigate: params.withoutNavigation
        ? null
        : (postId, where) => {
            for (
              let i = 0, l = props.visiblePosts.length, step = 1, match = false;
              i >= 0 && i < l;
              i += step
            ) {
              const item = props.visiblePosts[i];
              if (match) {
                if (isMediaAttachment(item.attachments)) {
                  return item;
                }
              } else if (item.id === postId) {
                match = true;
                step = where < 0 ? -1 : 1;
              }
            }
            return null;
          },
    });
  };

  render() {
    const getEntryComponent = (section) => (post) =>
      <FeedEntry key={post.id} {...{ post, section, ...this.props, showMedia: this.showMedia }} />;

    const {
      emptyFeed,
      emptyFeedMessage,
      hiddenPosts,
      isHiddenRevealed,
      loading,
      toggleHiddenPosts,
      visiblePosts,
      feedError,
    } = this.props;

    const visibleEntries = visiblePosts.map(getEntryComponent('visible'));
    const hiddenEntries = (hiddenPosts || []).map(getEntryComponent('hidden'));

    return (
      <div className="posts" role="feed list">
        <ErrorBoundary>
          {visibleEntries}

          {hiddenEntries.length > 0 && (
            <div>
              <HiddenEntriesToggle
                count={hiddenEntries.length}
                isOpen={isHiddenRevealed}
                toggle={toggleHiddenPosts}
              />

              {isHiddenRevealed ? hiddenEntries : false}
            </div>
          )}

          {emptyFeed && loading && <p>Loading feed...</p>}
          {emptyFeed &&
            !loading &&
            (feedError !== null ? (
              <p className="alert alert-danger" role="alert">
                Error loading feed: {feedError}
              </p>
            ) : (
              <>
                <p>There are no posts in this feed.</p>
                {emptyFeedMessage}
              </>
            ))}
        </ErrorBoundary>
      </div>
    );
  }
}

const postIsHidden = (post) => !!(post.isHidden || post.hiddenByCriteria);

export default connect(
  (state) => {
    const { entries, recentlyHiddenEntries, isHiddenRevealed, feedError, feedRequestType } =
      state.feedViewState;

    const allPosts = entries.map(joinPostData(state)).filter(Boolean);

    let visiblePosts = allPosts;
    let hiddenPosts = [];

    const hideInFeeds = state.user.frontendPreferences.hidesInNonHomeFeeds
      ? [HOME, HOME_AUX, GET_EVERYTHING, GET_SUMMARY, DISCUSSIONS]
      : [HOME];

    const separateHiddenEntries = hideInFeeds.includes(feedRequestType);

    if (separateHiddenEntries) {
      visiblePosts = allPosts.filter((p) => !postIsHidden(p) || recentlyHiddenEntries[p.id]);
      hiddenPosts = allPosts.filter((p) => postIsHidden(p));
    }

    return {
      loading: state.routeLoadingState,
      emptyFeed: entries.length === 0,
      separateHiddenEntries,
      isHiddenRevealed,
      visiblePosts,
      hiddenPosts,
      feedError,
    };
  },
  { toggleHiddenPosts },
)(Feed);

function FeedEntry({ post, section, ...props }) {
  // Capture Hide link offset before post unmount
  const [hideLinkTopOffset, setHideLinkTopOffset] = useState();
  const onPostUnmount = useCallback((offset) => setHideLinkTopOffset(offset), []);

  const isRecentlyHidden =
    props.separateHiddenEntries &&
    (post.isHidden || post.hiddenByCriteria) &&
    section === 'visible';

  return isRecentlyHidden ? (
    <PostRecentlyHidden
      id={post.id}
      initialTopOffset={hideLinkTopOffset}
      isHidden={post.isHidden}
      availableHideCriteria={post.availableHideCriteria}
      hiddenByCriteria={post.hiddenByCriteria}
    />
  ) : (
    <Post
      {...post}
      user={props.user}
      isInHomeFeed={props.isInHomeFeed}
      isInUserFeed={props.isInUserFeed}
      showMoreComments={props.showMoreComments}
      showMoreLikes={props.showMoreLikes}
      toggleEditingPost={props.toggleEditingPost}
      cancelEditingPost={props.cancelEditingPost}
      saveEditingPost={props.saveEditingPost}
      deletePost={props.deletePost}
      addAttachmentResponse={props.addAttachmentResponse}
      showMedia={props.showMedia}
      toggleCommenting={props.toggleCommenting}
      addComment={props.addComment}
      likePost={props.likePost}
      unlikePost={props.unlikePost}
      hidePost={props.hidePost}
      unhidePost={props.unhidePost}
      toggleModeratingComments={props.toggleModeratingComments}
      disableComments={props.disableComments}
      enableComments={props.enableComments}
      commentEdit={props.commentEdit}
      highlightTerms={props.highlightTerms}
      setFinalHideLinkOffset={onPostUnmount}
      hideEnabled={props.separateHiddenEntries}
    />
  );
}
