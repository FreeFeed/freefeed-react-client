import React from 'react';

import throbber16 from '../../assets/images/throbber-16.gif';
import { preventDefault } from '../utils';
import SendTo from './send-to';

export default class CreateBookmarkletPost extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFormEmpty: false,
      isPostSaved: false
    };
  }

  checkCreatePostAvailability = () => {
    const isPostTextEmpty = (this.refs.postText.value == '' || /^\s+$/.test(this.refs.postText.value));
    const isFormEmpty = (isPostTextEmpty || this.refs.selectFeeds.values == 0);

    this.setState({
      isFormEmpty
    });
  };

  checkSave = (e) => {
    const isEnter = e.keyCode === 13;
    const isShiftPressed = e.shiftKey;
    if (isEnter && !isShiftPressed) {
      e.preventDefault();
      if (!this.state.isFormEmpty && !this.props.createPostViewState.isPending) {
        this.submitForm();
      }
    }
  };

  submitForm = () => {
    // Get all the values
    const feeds = this.refs.selectFeeds.values;
    const postText = this.refs.postText.value;
    const { imageUrls } = this.props;
    const commentText = this.refs.commentText.value;

    // Send to the server
    this.props.createPost(feeds, postText, imageUrls, commentText);
  };

  componentWillReceiveProps(newProps) {
    // If it was successful saving, clear the form
    const wasCommentJustSaved = this.props.createPostViewState.isPending && !newProps.createPostViewState.isPending;
    const wasThereNoError = !newProps.createPostViewState.isError;

    if (wasCommentJustSaved && wasThereNoError) {
      this.setState({
        isPostSaved: true
      });
    }
  }

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  // When the SendTo became multiline, images choosen or textarea grows bookmarklet height is changed,
  // but we can't handle this via CSS rules, so use JS to increase iframe size accordingly
  // Only way to interact with the scripts outside the iframe is postMessage
  componentDidUpdate() {
    window.parent.postMessage(window.document.documentElement.offsetHeight, '*');
  }

  render() {
    if (this.state.isPostSaved) {
      const postUrl = `/${this.props.user.username}/${this.props.createPostViewState.lastPostId}`;
      return (
        <div className="brand-new-post">
          Done! Check out<br/>
          <a href={postUrl} target="_blank">your brand new post</a>
        </div>
      );
    }

    const linkedImages = this.props.imageUrls.map((url, i) => (
      <div className="post-linked-image" key={i} onClick={() => this.props.removeImage(url)} title="Remove image">
        <img src={url} />
      </div>
    ));

    return (
      <div className="create-post post-editor expanded">
        {this.props.createPostViewState.isError ? (
          <div className="post-error alert alert-danger" role="alert">
            Post has not been saved. Server response: "{this.props.createPostViewState.errorString}"
          </div>
        ) : false}

        <SendTo
          ref="selectFeeds"
          feeds={this.props.sendTo.feeds}
          defaultFeed={this.props.sendTo.defaultFeed}
          user={this.props.user}
          onChange={this.checkCreatePostAvailability}
        />

        <textarea
          className="post-textarea"
          ref="postText"
          defaultValue={this.props.postText}
          onKeyDown={this.checkSave}
          onChange={this.checkCreatePostAvailability}
          rows={3}
          maxLength="1500"
        />

        {this.props.imageUrls.length ? (
          linkedImages
        ) : (
          <div className="post-linked-image-empty">Click on images<br/>to share them</div>
        )}

        <div className="comment">
          <a className="comment-icon comment-icon-special fa-stack">
            <i className="fa fa-comment fa-stack-1x"></i>
            <i className="fa fa-comment-o fa-stack-1x"></i>
          </a>

          <div className="comment-body">
            <textarea
              className="comment-textarea"
              ref="commentText"
              defaultValue={this.props.commentText}
              onKeyDown={this.checkSave}
              onChange={this.checkCreatePostAvailability}
              rows={4}
              maxLength="1500"
            />
          </div>
        </div>

        <div className="post-edit-actions">
          {this.props.createPostViewState.isPending ? (
            <span className="post-edit-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}

          <button
            className="btn btn-default"
            onClick={preventDefault(this.submitForm)}
            disabled={this.state.isFormEmpty || this.props.createPostViewState.isPending}
          >
            Post
          </button>
        </div>
      </div>
    );
  }
}
