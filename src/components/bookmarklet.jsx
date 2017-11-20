import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';

import { createBookmarkletPost, resetPostCreateForm, addAttachmentResponse, removeAttachment } from '../redux/action-creators';

import { joinCreatePostData } from './select-utils';
import CreateBookmarkletPost from './create-bookmarklet-post';
import SignIn from './signin';


class Layout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageUrls: []
    };
  }

  // User has selected an image on parent frame
  handleHashChange = () => {
    // Add the image passed via #hash
    const url = window.location.hash.slice(1);
    const { imageUrls } = this.state;
    if (imageUrls.indexOf(url) === -1) {
      imageUrls.push(url);
      this.setState({ imageUrls });
    }

    // Clear the #hash immediately
    window.history.pushState('', document.title, window.location.pathname + window.location.search);
  };

  removeImage = (url) => {
    const imageUrls = _.without(this.state.imageUrls, url);
    this.setState({ imageUrls });
  };

  componentDidMount() {
    window.addEventListener('hashchange', this.handleHashChange);

    // Auto-select thumbnails on popular services
    const services = [{
      // Instagram
      from: /https?:\/\/www\.instagram\.com\/p\/([\w-]+)\//i,
      to: (id) => (`https://www.instagram.com/p/${id}/media/?size=l`)
    }, {
      // YouTube
      from: /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)[?=&+%\w.-]*/i,
      to: (id) => (`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
    }];
    const pageUrl = this.props.location.query.url;
    const imageUrls = [];
    services.forEach((service) => {
      const m = pageUrl.match(service.from);
      if (m && m[1]) {
        const imageUrl = service.to(m[1]);
        imageUrls.push(imageUrl);
      }
    });
    this.setState({ imageUrls });
  }

  componentWillUnmount() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  render() {
    const { props } = this;

    const layoutClassNames = classnames({
      'container': true,
      'bookmarklet': true,
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
            imageUrls={this.state.imageUrls}
            commentText={props.location.query.comment}
            createPostForm={props.createPostForm}
            createPost={props.createBookmarkletPost}
            resetPostCreateForm={props.resetPostCreateForm}
            removeImage={this.removeImage}/>
        ) : (
          <div>
            <div className="box-message alert alert-warning">You need to sign in first.</div>
            <SignIn/>
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
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
    addAttachmentResponse: (...args) => dispatch(addAttachmentResponse(...args)),
    removeAttachment: (...args) => dispatch(removeAttachment(...args))
  };
}

export default connect(selectState, mapDispatchToProps)(Layout);
