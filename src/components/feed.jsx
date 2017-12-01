import React from 'react';
import Post from './post';

const HiddenEntriesToggle = (props) => {
  const entriesForm = (props.count > 1 ? 'entries' : 'entry');
  let label;

  if (props.isOpen) {
    label = `\u25bc Don't show ${props.count} hidden ${entriesForm}`;
  } else {
    label = `\u25ba Show ${props.count} hidden ${entriesForm}`;
  }

  return (
    <div className="hidden-posts-toggle">
      <a onClick={props.toggle}>
        {label}
      </a>
    </div>
  );
};

export default (props) => {
  const getEntryComponent = (section) => (post) => {
    const isRecentlyHidden = (props.isInHomeFeed && post.isHidden && (section === 'visible'));

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
        removeAttachment={props.removeAttachment}
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

  const visibleEntries = props.visibleEntries.map(getEntryComponent('visible'));
  const hiddenEntries = (props.hiddenEntries || []).map(getEntryComponent('hidden'));

  return (
    <div className="posts">
      {visibleEntries.length === 0 && 'No posts here'}

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
      ) : false}
    </div>
  );
};
