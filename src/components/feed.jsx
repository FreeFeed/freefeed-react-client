import React from 'react';
import { connect } from 'react-redux';

import ErrorBoundary from './error-boundary';
import Post from './post';
import { joinPostData } from './select-utils';

const HiddenEntriesToggle = (props) => {
  const entriesForm = props.count > 1 ? 'entries' : 'entry';
  let label;

  if (props.isOpen) {
    label = `\u25bc Don't show ${props.count} hidden ${entriesForm}`;
  } else {
    label = `\u25ba Show ${props.count} hidden ${entriesForm}`;
  }

  return (
    <div className="hidden-posts-toggle">
      <a onClick={props.toggle}>{label}</a>
    </div>
  );
};

function Feed(props) {
  const getEntryComponent = (section) => (post) => {
    const isRecentlyHidden =
      props.withHiddenSection && (post.isHidden || post.hiddenByNames) && section === 'visible';

    return (
      <Post
        {...post}
        key={post.id}
        user={props.user}
        isInHomeFeed={props.isInHomeFeed}
        isInUserFeed={props.isInUserFeed}
        isRecentlyHidden={isRecentlyHidden}
        showMoreComments={props.showMoreComments}
        showMoreLikes={props.showMoreLikes}
        toggleEditingPost={props.toggleEditingPost}
        cancelEditingPost={props.cancelEditingPost}
        saveEditingPost={props.saveEditingPost}
        deletePost={props.deletePost}
        addAttachmentResponse={props.addAttachmentResponse}
        toggleCommenting={props.toggleCommenting}
        updateCommentingText={props.updateCommentingText}
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
      />
    );
  };

  const visibleEntries = props.visiblePosts.map(getEntryComponent('visible'));
  const hiddenEntries = (props.hiddenPosts || []).map(getEntryComponent('hidden'));

  return (
    <div className="posts">
      <ErrorBoundary>
        {visibleEntries}

        {hiddenEntries.length > 0 ? (
          <div>
            <HiddenEntriesToggle
              count={hiddenEntries.length}
              isOpen={props.isHiddenRevealed}
              toggle={props.toggleHiddenPosts}
            />

            {props.isHiddenRevealed ? hiddenEntries : false}
          </div>
        ) : (
          false
        )}

        {props.emptyFeed && props.loading && <p>Loading feed...</p>}
        {props.emptyFeed && !props.loading && (
          <>
            <p>There are no posts in this feed.</p>
            {props.emptyFeedMessage}
          </>
        )}
      </ErrorBoundary>
    </div>
  );
}

const postIsHidden = (post) => !!(post.isHidden || post.hiddenByNames);

export default connect((state) => {
  const {
    entries,
    recentlyHiddenEntries,
    separateHiddenEntries,
    isHiddenRevealed,
  } = state.feedViewState;

  const allPosts = entries.map(joinPostData(state)).filter(Boolean);

  let visiblePosts = allPosts;
  let hiddenPosts = [];

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
  };
})(Feed);
