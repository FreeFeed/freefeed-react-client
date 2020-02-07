import React from 'react';
import { connect } from 'react-redux';
import { joinPostData, postActions } from './select-utils';

import Post, { canonicalURI } from './post';

class SinglePostHandler extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { post, router } = nextProps;
    if (!post) {
      return;
    }
    const canonicalPostURI = canonicalURI(post);
    if (router.location.pathname !== canonicalPostURI) {
      router.replace(canonicalPostURI);
    }
  }

  render() {
    const { props } = this;
    const { post } = props;

    let postBody = <div />;

    if (props.errorString) {
      postBody = <h2>{props.errorString}</h2>;
    }

    if (post) {
      post.isCommenting = true;
      postBody = (
        <Post
          {...post}
          key={post.id}
          isSinglePost={true}
          user={props.user}
          showMoreComments={props.showMoreComments}
          showMoreLikes={props.showMoreLikes}
          toggleEditingPost={props.toggleEditingPost}
          cancelEditingPost={props.cancelEditingPost}
          saveEditingPost={props.saveEditingPost}
          deletePost={props.deletePost}
          addAttachmentResponse={props.addAttachmentResponse}
          showMedia={props.showMedia}
          toggleCommenting={props.toggleCommenting}
          updateCommentingText={props.updateCommentingText}
          addComment={props.addComment}
          likePost={props.likePost}
          unlikePost={props.unlikePost}
          toggleModeratingComments={props.toggleModeratingComments}
          disableComments={props.disableComments}
          enableComments={props.enableComments}
          commentEdit={props.commentEdit}
        />
      );
    }

    return (
      <div className="box">
        <div className="box-header-timeline">{props.boxHeader}</div>
        <div className="box-body">{postBody}</div>
        <div className="box-footer" />
      </div>
    );
  }
}

function selectState(state) {
  const { boxHeader, user } = state;

  const post = joinPostData(state)(state.singlePostId);
  const viewState = state.postsViewState[state.singlePostId];
  const errorString = viewState && viewState.isError ? viewState.errorString : null;

  return { post, user, boxHeader, errorString };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(SinglePostHandler);
