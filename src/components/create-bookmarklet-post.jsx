/* global CONFIG */
import { PureComponent, Component } from 'react';

import { faComment } from '@fortawesome/free-regular-svg-icons';
import { preventDefault } from '../utils';
import { submitByEnter } from '../utils/submit-by-enter';
import { Throbber } from './throbber';
import SendTo from './send-to';
import { Icon } from './fontawesome-icons';

class LinkedImage extends PureComponent {
  handleClick = () => {
    const { removeImage, url } = this.props;

    removeImage(url);
  };

  render() {
    const { url } = this.props;
    return (
      <div className="post-linked-image" onClick={this.handleClick} title="Remove image">
        <img src={url} />
      </div>
    );
  }
}

export default class CreateBookmarkletPost extends Component {
  commentText;
  postText;
  selectFeeds;

  constructor(props) {
    super(props);

    this.state = {
      isFormEmpty: false,
      isPostSaved: false,
    };
  }

  checkCreatePostAvailability = () => {
    const isPostTextEmpty = this.postText.value == '' || /^\s+$/.test(this.postText.value);
    const isFormEmpty = isPostTextEmpty || this.selectFeeds.values == 0;

    this.setState({ isFormEmpty });
  };

  checkSave = submitByEnter(
    () => !this.state.isFormEmpty && !this.props.createPostViewState.isPending && this.submitForm(),
  );

  submitForm = () => {
    // Get all the values
    const feeds = this.selectFeeds.values;
    const postText = this.postText.value;
    const { imageUrls } = this.props;
    const commentText = this.commentText.value;

    // Send to the server
    this.props.createPost(feeds, postText, imageUrls, commentText);
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    // If it was successful saving, clear the form
    const wasCommentJustSaved =
      this.props.createPostViewState.isPending && !newProps.createPostViewState.isPending;
    const wasThereNoError = !newProps.createPostViewState.isError;

    if (wasCommentJustSaved && wasThereNoError) {
      this.setState({ isPostSaved: true });
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

  registerCommentText = (el) => {
    this.commentText = el;
  };

  registerPostText = (el) => {
    this.postText = el;
  };

  registerSelectFeeds = (el) => (this.selectFeeds = el);

  render() {
    if (this.state.isPostSaved) {
      const postUrl = `/${this.props.user.username}/${this.props.createPostViewState.lastPostId}`;
      return (
        <div className="brand-new-post">
          Done! Check out
          <br />
          <a href={postUrl} target="_blank" rel="noopener">
            your brand new post
          </a>
        </div>
      );
    }

    const linkedImages = this.props.imageUrls.map((url, i) => (
      <LinkedImage key={i} removeImage={this.props.removeImage} url={url} />
    ));

    return (
      <div className="create-post post-editor expanded" role="form">
        {this.props.createPostViewState.isError ? (
          <div className="post-error alert alert-danger" role="alert">
            Post has not been saved. Server response:{' '}
            {`"${this.props.createPostViewState.errorString}"`}
          </div>
        ) : (
          false
        )}

        <SendTo
          ref={this.registerSelectFeeds}
          defaultFeed={this.props.sendTo.defaultFeed}
          user={this.props.user}
          onChange={this.checkCreatePostAvailability}
        />

        <textarea
          className="post-textarea"
          ref={this.registerPostText}
          defaultValue={this.props.postText}
          onKeyDown={this.checkSave}
          onChange={this.checkCreatePostAvailability}
          rows={3}
          maxLength={CONFIG.maxLength.post}
        />

        {this.props.imageUrls.length > 0 ? (
          linkedImages
        ) : (
          <div className="post-linked-image-empty">
            Click on images
            <br />
            to share them
          </div>
        )}

        <div className="comment">
          <Icon icon={faComment} className="comment-icon" />

          <div className="comment-body">
            <textarea
              className="comment-textarea"
              ref={this.registerCommentText}
              defaultValue={this.props.commentText}
              onKeyDown={this.checkSave}
              onChange={this.checkCreatePostAvailability}
              rows={4}
              maxLength={CONFIG.maxLength.comment}
            />
          </div>
        </div>

        <div className="post-edit-actions">
          {this.props.createPostViewState.isPending ? (
            <span className="post-edit-throbber">
              <Throbber />
            </span>
          ) : (
            false
          )}

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
