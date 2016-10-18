import React from 'react';
import {preventDefault} from '../utils';
import Textarea from 'react-textarea-autosize';
import throbber from 'assets/images/throbber.gif';
import SendTo from './send-to';
import Dropzone from './dropzone';
import PostAttachments from './post-attachments';

const isTextEmpty = text => text == '' || /^\s+$/.test(text);
const getDefaultState = () => ({
  isFormEmpty: true,
  isMoreOpen: false,
  attachmentQueueLength: 0,
  postText:'',
  commentsDisabled: false
});

export default class CreatePost extends React.Component {
  constructor(props) {
    super(props);
    this.state = getDefaultState();
  }

  createPost = () => {
    // Get all the values
    let feeds = this.refs.selectFeeds.values;
    let postText = this.state.postText;
    let attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    let more = {
      commentsDisabled: this.state.commentsDisabled
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

  clearForm = () => {
    this.setState(getDefaultState());
    const attachmentIds = this.props.createPostForm.attachments.map(attachment => attachment.id);
    attachmentIds.forEach(this.removeAttachment);
  }

  removeAttachment = (attachmentId) => this.props.removeAttachment(null, attachmentId)

  checkCreatePostAvailability = () => {
    let isFormEmpty = isTextEmpty(this.state.postText) || this.refs.selectFeeds.values === 0;

    this.setState({
      isFormEmpty
    });
  }

  onPostTextChange = (e) => {
    this.setState({postText: e.target.value}, this.checkCreatePostAvailability);
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

  changeAttachmentQueue = (change) => () => {
    this.setState({attachmentQueueLength: this.state.attachmentQueueLength + change});
  }

  componentWillUnmount() {
    this.props.resetPostCreateForm();
  }

  render() {
    let props = this.props;

    return (
      <div className="create-post post-editor">
        <div>
          {this.props.sendTo.expanded ? (
            <SendTo ref="selectFeeds"
              feeds={this.props.sendTo.feeds}
              defaultFeed={this.props.sendTo.defaultFeed}
              isDirects={this.props.isDirects}
              user={this.props.user}
              onChange={this.checkCreatePostAvailability}/>
          ) : false}

          <Dropzone
            addAttachmentResponse={att => props.addAttachmentResponse(null, att)}
            addedFile={this.changeAttachmentQueue(1)}
            removedFile={this.changeAttachmentQueue(-1)}/>

          <Textarea
            className="post-textarea"
            value={this.state.postText}
            onChange={this.onPostTextChange}
            onFocus={this.props.expandSendTo}
            onKeyDown={this.checkSave}
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
                  value={this.state.commentsDisabled}
                  onChange={e=>this.setState({commentsDisabled:e.target.checked})}/>
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
