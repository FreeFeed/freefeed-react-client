/* global CONFIG */
import { Component, useMemo } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import { canonicalURI } from '../utils/canonical-uri';
import { joinPostData, postActions } from './select-utils';
import UserName from './user-name';

import Post from './post';
import { SignInLink } from './sign-in-link';

class SinglePostHandler extends Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { post, router } = nextProps;
    if (!post) {
      return;
    }
    const { pathname, search, hash } = router.location;
    const canonicalPostURI = canonicalURI(post);
    if (pathname !== canonicalPostURI) {
      router.replace(canonicalPostURI + search + hash);
    }
  }

  render() {
    const { props } = this;
    const { post } = props;

    let postBody = <div />;

    if (props.errorString?.includes('You can not see this post')) {
      return <PrivatePost isAuthorized={!!props.user.id} feedName={props.routeParams?.userName} />;
    } else if (props.errorString?.includes('Please sign in to view this post')) {
      return <ProtectedPost />;
    } else if (props.errorString?.startsWith('404:')) {
      return <NotFoundPost />;
    } else if (props.errorString) {
      postBody = <h2>{props.errorString}</h2>;
    }

    if (post) {
      postBody = (
        <Post
          {...post}
          key={post.id}
          isCommenting={true}
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
        <div className="box-header-timeline" role="heading">
          {props.boxHeader}
        </div>
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
  const errorString = viewState ? viewState.errorString || 'Unknown error' : null;

  return { post, user, boxHeader, errorString };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(SinglePostHandler);

function PrivatePost({ isAuthorized, feedName }) {
  const userObj = useMemo(() => ({ username: feedName }), [feedName]);
  return (
    <div className="box">
      <Helmet title={`Access denied - ${CONFIG.siteTitle}`} defer={false} />
      <div className="box-header-timeline" role="heading">
        Access denied
      </div>
      <div className="box-body">
        <h3>The post you requested is private</h3>
        {isAuthorized ? (
          <p>
            Request a subscription to see posts from @<UserName user={userObj}>{feedName}</UserName>
          </p>
        ) : (
          <>
            <p>
              You may be able to access it if you <SignInLink>sign in</SignInLink> to your{' '}
              {CONFIG.siteTitle} account.
            </p>
            <p>
              <Link to="/signup">Sign up</Link> for {CONFIG.siteTitle} (or{' '}
              <SignInLink>sign in</SignInLink>) and request a subscription to see posts from @
              <UserName user={userObj}>{feedName}</UserName>
            </p>
          </>
        )}
      </div>
      <div className="box-footer" />
    </div>
  );
}

function ProtectedPost() {
  return (
    <div className="box">
      <Helmet title={`Access denied - ${CONFIG.siteTitle}`} defer={false} />
      <div className="box-header-timeline" role="heading">
        Access denied
      </div>
      <div className="box-body">
        <h3>This post is visible to {CONFIG.siteTitle} users only</h3>
        <p>
          <Link to="/signup">Sign up</Link> for {CONFIG.siteTitle} (or{' '}
          <SignInLink>sign in</SignInLink>) to see this post.
        </p>
      </div>
      <div className="box-footer" />
    </div>
  );
}

function NotFoundPost() {
  return (
    <div className="box">
      <Helmet title={`Post not found - ${CONFIG.siteTitle}`} defer={false} />
      <div className="box-header-timeline" role="heading">
        Post not found
      </div>
      <div className="box-body">
        <h3>This post does not exist</h3>
        <p>It may have been removed or never existed on {CONFIG.siteTitle}.</p>
      </div>
      <div className="box-footer" />
    </div>
  );
}
