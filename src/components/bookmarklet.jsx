import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import memoize from 'memoize-one';

import { createBookmarkletPost, resetPostCreateForm, addAttachmentResponse, removeAttachment } from '../redux/action-creators';

import { joinCreatePostData } from './select-utils';
import CreateBookmarkletPost from './create-bookmarklet-post';
import SignIn from './signin';

// Auto-select thumbnails on popular services
const imagesFromURL = memoize((url) => {
  const services = [{
    // Instagram
    from: /https?:\/\/www\.instagram\.com\/p\/([\w-]+)\//i,
    to:   ([, id]) => (`https://www.instagram.com/p/${id}/media/?size=l`)
  }, {
    // YouTube
    from: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)[?=&+%\w.-]*/i,
    to:   ([, id]) => (`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
  }];

  const imageUrls = [];
  services.forEach((service) => {
    const m = url.match(service.from);
    if (m) {
      const imageUrl = service.to(m);
      imageUrls.push(imageUrl);
    }
  });
  return imageUrls;
});

class Layout extends React.Component {
  state = {
    imageUrls: null
  };

  /**
   * Returns this.state.imageUrls if it was modified (i.e. not null) or the
   * initial image list by page URL
   */
  get imageUrls() {
    return this.state.imageUrls || imagesFromURL(this.props.location.query.url);
  }

  // User has selected an image on parent frame
  handleHashChange = () => {
    // Add the image passed via #hash
    const url = window.location.hash.slice(1);
    const { imageUrls } = this;
    if (!imageUrls.includes(url)) {
      this.setState({ imageUrls: [...imageUrls, url] });
    }

    // Clear the #hash immediately
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
  };

  removeImage = (url) => {
    this.setState({ imageUrls: _.without(this.imageUrls, url) });
  };

  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange);
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  render() {
    const { props } = this;

    const layoutClassNames = classnames({
      'container':       true,
      'bookmarklet':     true,
      'unauthenticated': !props.authenticated
    });

    return (
      <div className={layoutClassNames}>
        <header>
          <h1>
            Share on <a href="/" target="_blank">FreeFeed</a>
            {props.authenticated ? (` as ${props.user.username}`) : false}
          </h1>
        </header>

        {props.authenticated ? (
          <CreateBookmarkletPost
            createPostViewState={props.createPostViewState}
            sendTo={props.sendTo}
            user={props.user}
            postText={`${props.location.query.title} - ${props.location.query.url}`}
            imageUrls={this.imageUrls}
            commentText={props.location.query.comment}
            createPostForm={props.createPostForm}
            createPost={props.createBookmarkletPost}
            resetPostCreateForm={props.resetPostCreateForm}
            removeImage={this.removeImage}
          />
        ) : (
          <div>
            <div className="box-message alert alert-warning">You need to sign in first.</div>
            <SignIn />
          </div>
        )}
      </div>
    );
  }
}

function selectState(state) {
  const { authenticated, createPostViewState, user } = state;
  const sendTo = { ...state.sendTo, defaultFeed: user.username };
  const createPostForm = joinCreatePostData(state);

  return {
    authenticated,
    user,
    sendTo,
    createPostForm,
    createPostViewState
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createBookmarkletPost: (...args) => dispatch(createBookmarkletPost(...args)),
    resetPostCreateForm:   (...args) => dispatch(resetPostCreateForm(...args)),
    addAttachmentResponse: (...args) => dispatch(addAttachmentResponse(...args)),
    removeAttachment:      (...args) => dispatch(removeAttachment(...args))
  };
}

export default connect(selectState, mapDispatchToProps)(Layout);
