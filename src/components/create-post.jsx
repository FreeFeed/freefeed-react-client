import React from 'react';
import {preventDefault} from '../utils';
import Textarea from 'react-textarea-autosize';
import throbber from 'assets/images/throbber.gif';
import SendTo from './send-to';
import Dropzone from './dropzone';
import PostAttachments from './post-attachments';

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFormEmpty: true,
      isMoreOpen: false,
      attachmentQueueLength: 0,
      selectFeeds: (this.props.sendTo.defaultFeed ? [this.props.sendTo.defaultFeed] : [])
    };
  }

  createPost = _ => {
    // Get all the values
    let feeds = this.state.selectFeeds;
    let postText = this.refs.postText.value;
    let attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    let more = {
      commentsDisabled: (this.refs.commentsDisabled && this.refs.commentsDisabled.checked)
    };

    // Send to the server
    this.props.createPost(feeds, postText, attachmentIds, more);
  }

  componentWillReceiveProps(newProps) {
    const wasCommentJustSaved = this.props.createPostViewState.isPending && !newProps.createPostViewState.isPending;
    const wasThereNoError = !newProps.createPostViewState.isError;
    const shouldClear = (wasCommentJustSaved && wasThereNoError);
    if (shouldClear) {
      this.clearForm();
    }
  }

  clearForm = _ => {
    this.refs.postText.value = '';
    this.setState({
      isFormEmpty: true,
      isMoreOpen: false
    });
    const attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    attachmentIds.forEach(this.removeAttachment);
  }

  removeAttachment = (attachmentId) => this.props.removeAttachment(null, attachmentId)

  isPostTextEmpty = (postText) => {
    return postText == '' || /^\s+$/.test(postText);
  }

  selectFeedsChanged = (selectFeeds) => {
    this.setState({selectFeeds});
    this.checkCreatePostAvailability();
  }

  checkCreatePostAvailability = (e) => {
    let isFormEmpty = this.isPostTextEmpty(this.refs.postText.value) || this.state.selectFeeds == 0;

    this.setState({
      isFormEmpty
    });
  }

  checkSave = (e) => {
    const isEnter = e.keyCode === 13;
    const isShiftPressed = e.shiftKey;
    if (isEnter && !isShiftPressed) {
      e.preventDefault();
      if (!this.state.isFormEmpty && this.state.attachmentQueueLength === 0 && !this.props.createPostViewState.isPending) {
        this.createPost();
      }
    }
  }

  toggleMore() {
    this.setState({ isMoreOpen: !this.state.isMoreOpen });
  }

  changeAttachmentQueue= (change) => _ => {
    this.setState({attachmentQueueLength: this.state.attachmentQueueLength + change});
  }

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  render() {
    let _this = this;
    let props = this.props;

    return (
      <div className="create-post post-editor">
        <div>
          {this.props.sendTo.expanded ? (
            <SendTo
              feeds={this.props.sendTo.feeds}
              defaultFeed={this.props.sendTo.defaultFeed}
              user={this.props.user}
              onChange={this.selectFeedsChanged}/>
          ) : false}

          <Dropzone
            addAttachmentResponse={att => props.addAttachmentResponse(null, att)}
            addedFile={this.changeAttachmentQueue(1)}
            removedFile={this.changeAttachmentQueue(-1)}/>

          <Textarea
            className="post-textarea"
            ref="postText"
            onFocus={this.props.expandSendTo}
            onKeyDown={this.checkSave}
            onChange={this.checkCreatePostAvailability}
            minRows={3}
            maxRows={10}
            maxLength="1500"/>
        </div>

        <div className="post-edit-options">
          <span className="post-edit-attachments dropzone-trigger">
            <i className="fa fa-cloud-upload"></i>
            {' '}
            Add photos or files
          </span>

          <a className="post-edit-more-trigger" onClick={this.toggleMore.bind(this)}>More&nbsp;&#x25be;</a>

          {this.state.isMoreOpen ? (
            <div className="post-edit-more">
              <label>
                <input
                  className="post-edit-more-checkbox"
                  type="checkbox"
                  ref="commentsDisabled"
                  defaultChecked={false}/>
                <span className="post-edit-more-labeltext">Comments disabled</span>
              </label>
            </div>
          ) : false}
        </div>

        <div className="post-edit-actions">
          {this.props.createPostViewState.isPending ? (
            <span className="throbber">
              <img width="16" height="16" src={throbber}/>
            </span>
          ) : false}

          <button className="btn btn-default btn-xs"
            onClick={preventDefault(this.createPost)}
            disabled={this.state.isFormEmpty || this.state.attachmentQueueLength > 0 || this.props.createPostViewState.isPending}>Post</button>
        </div>

        <PostAttachments
          attachments={this.props.createPostForm.attachments}
          isEditing={true}
          removeAttachment={this.removeAttachment}/>

        <div className="dropzone-previews"></div>

        {this.props.createPostViewState.isError ? (
          <div className="create-post-error">
            {this.props.createPostViewState.errorString}
          </div>
        ) : false}
      </div>
    );
  }
}
