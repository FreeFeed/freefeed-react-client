/* global CONFIG */
import { PureComponent, Component } from 'react';

import { faComment } from '@fortawesome/free-regular-svg-icons';
import { preventDefault } from '../utils';
import { Throbber } from './throbber';
import { Selector } from './feeds-selector/selector';
import { Icon } from './fontawesome-icons';
import { SmartTextarea } from './smart-textarea';

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
  constructor(props) {
    super(props);

    this.state = {
      isPostSaved: false,
      feedNames: [this.props.user.username],
      feedsHasError: false,
      postText: this.props.postText,
      commentText: this.props.commentText,
    };
  }

  setFeedNames = (feedNames) => this.setState({ feedNames });
  setFeedsHasError = (feedsHasError) => this.setState({ feedsHasError });
  onPostTextChange = (e) => this.setState({ postText: e.target.value });
  onCommentTextChange = (e) => this.setState({ commentText: e.target.value });

  canSubmit = () => this.state.postText.trim() !== '' && !this.state.feedsHasError;

  checkSave = () => this.canSubmit() && !this.props.createPostStatus.loading && this.submitForm();

  submitForm = () => {
    // Get all the values
    const { imageUrls } = this.props;
    const { feedNames: feeds, postText, commentText } = this.state;

    // Send to the server
    this.props.createPost(feeds, postText, imageUrls, commentText);
  };

  UNSAFE_componentWillReceiveProps(newProps) {
    // If it was successful saving, clear the form
    const wasCommentJustSaved =
      this.props.createPostStatus.loading && !newProps.createPostStatus.loading;
    const wasThereNoError = !newProps.createPostStatus.error;

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

  render() {
    if (this.state.isPostSaved) {
      const postUrl = `/${this.props.user.username}/${this.props.lastCreatedPostId}`;
      return (
        <div className="brand-new-post">
          Done! Check out
          <br />
          <a href={postUrl} target="_blank">
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
        {this.props.createPostStatus.error ? (
          <div className="post-error alert alert-danger" role="alert">
            Post has not been saved. Server response: {`"${this.props.createPostStatus.errorText}"`}
          </div>
        ) : (
          false
        )}

        <Selector
          className="bookmarklet__selector"
          feedNames={this.state.feedNames}
          onChange={this.setFeedNames}
          onError={this.setFeedsHasError}
        />

        <SmartTextarea
          component={'textarea'}
          className="post-textarea"
          ref={this.registerPostText}
          value={this.state.postText}
          onChange={this.onPostTextChange}
          onSubmit={this.checkSave}
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
            <SmartTextarea
              component={'textarea'}
              className="comment-textarea"
              ref={this.registerCommentText}
              value={this.state.commentText}
              onChange={this.onCommentTextChange}
              onSubmit={this.checkSave}
              rows={4}
              maxLength={CONFIG.maxLength.comment}
            />
          </div>
        </div>

        <div className="post-edit-actions">
          {this.props.createPostStatus.loading ? (
            <span className="post-edit-throbber">
              <Throbber />
            </span>
          ) : (
            false
          )}

          <button
            className="btn btn-default"
            onClick={preventDefault(this.submitForm)}
            disabled={!this.canSubmit() || this.props.createPostStatus.loading}
          >
            Post
          </button>
        </div>
      </div>
    );
  }
}
