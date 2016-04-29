import React from 'react';
import {Link} from 'react-router';
import moment from 'moment';
import classnames from 'classnames';

import {fromNowOrNow, getFullDate} from '../utils';
import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';
import UserName from './user-name';
import PieceOfText from './piece-of-text';
import Textarea from 'react-textarea-autosize';
import throbber16 from 'assets/images/throbber-16.gif';
import Dropzone from './dropzone';
import {api as apiConfig} from '../config';
import {getToken} from '../services/auth';
import PostMoreMenu from './post-more-menu';
import EmbedlyLink from './embedly-link';
import {getFirstLinkToEmbed} from '../utils';

export default class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attachmentQueueLength: 0
    };
  }

  removeAttachment = (attachmentId) => this.props.removeAttachment(this.props.id, attachmentId)

  changeAttachmentQueue= (change) => _ => {
    this.setState({attachmentQueueLength: this.state.attachmentQueueLength + change});
  }

  render() {
    let _this = this;
    let props = this.props;

    const createdAt = new Date(+props.createdAt);
    const createdAtISO = moment(createdAt).format();
    const createdAtHuman = getFullDate(+props.createdAt);
    const createdAgo = fromNowOrNow(createdAt);

    let editingPostText = props.editingText;
    let editingPostTextChange = (e) => {
      editingPostText = e.target.value;
    };
    const toggleEditingPost = () => props.toggleEditingPost(props.id, editingPostText);
    const cancelEditingPost = () => props.cancelEditingPost(props.id, editingPostText);
    const saveEditingPost = () => {
      if (!props.isSaving) {
        let attachmentIds = props.attachments.map(item => item.id) || [];
        props.saveEditingPost(props.id, {body: editingPostText, attachments: attachmentIds});
      }
    };
    const deletePost = () => props.deletePost(props.id);
    const likePost = () => props.likePost(props.id, props.user.id);
    const unlikePost = () => props.unlikePost(props.id, props.user.id);

    const hidePost = () => props.hidePost(props.id);
    const unhidePost = () => props.unhidePost(props.id);

    const toggleModeratingComments = () => props.toggleModeratingComments(props.id);

    const disableComments = () => props.disableComments(props.id);
    const enableComments = () => props.enableComments(props.id);

    const checkSave = (event) => {
      const isEnter = event.keyCode === 13;
      if (isEnter) {
        event.preventDefault();
        if (this.state.attachmentQueueLength === 0) {
          saveEditingPost();
        }
      }
    };
    const profilePicture = props.isSinglePost ?
      props.createdBy.profilePictureLargeUrl : props.createdBy.profilePictureMediumUrl;
    const profilePictureSize = props.isSinglePost ? 75 : 50;

    const postClass = classnames({
      'post': true,
      'single-post': props.isSinglePost,
      'timeline-post': !props.isSinglePost,
      'direct-post': props.isDirect
    });

    const toggleCommenting = props.isSinglePost ? () => {
    } : () => props.toggleCommenting(props.id);

    const recipientCustomDisplay = function(recipient) {
      if (recipient.id !== props.createdBy.id) {
        return false;
      }
      if (recipient.username[recipient.username.length - 1] === 's') {
        return recipient.username + "' feed";
      } else {
        return recipient.username + "'s feed";
      }
    };

    let recipients = props.recipients;
    // Check if the post has been only submitted to one recipient
    // and if we can omit it
    if (recipients.length === 1) {
      // If the post is in user/group feed (one-source list), we should omit
      // the only recipient, since it would be that feed.
      if (props.isInUserFeed) {
        recipients = [];
      } else {
        // When in a many-sources list (Home, Direct messages, My discussions),
        // we should omit the only recipient if it's the author's feed.
        if (recipients[0].id === props.createdBy.id) {
          recipients = [];
        }
      }
    }
    recipients = recipients.map((recipient, index) => (
      <span key={index}>
        <UserName
          className="post-recipient"
          user={recipient}
          display={recipientCustomDisplay(recipient)}/>
        {index < props.recipients.length - 2 ? ', ' : false}
        {index === props.recipients.length - 2 ? ' and ' : false}
      </span>
    ));

    // "Lock icon": check if the post is truly private, "partly private" or public.
    // Truly private:
    // - posted to author's own private feed and/or
    // - sent to users as a direct message and/or
    // - posted into private groups
    // Public:
    // - posted to author's own public feed and/or
    // - posted into public groups
    // "Partly private":
    // - has mix of private and public recipients
    const publicRecipients = props.recipients.filter((recipient) => (
      recipient.isPrivate === '0' &&
      (recipient.id === props.createdBy.id || recipient.type === 'group')
    ));
    const isReallyPrivate = (publicRecipients.length === 0);

    // "Comments disabled" / "Comment"
    let commentLink;
    if (props.commentsDisabled) {
      if (props.isEditable) {
        commentLink = (
          <span>
            {' - '}
            <i>Comments disabled (not for you)</i>
            {' - '}
            <a onClick={toggleCommenting}>Comment</a>
          </span>
        );
      } else {
        commentLink = (
          <span>
            {' - '}
            <i>Comments disabled</i>
          </span>
        );
      }
    } else {
      commentLink = (
        <span>
          {' - '}
          <a onClick={toggleCommenting}>Comment</a>
        </span>
      );
    }

    // "Like" / "Un-like"
    const amIAuthenticated = !!props.user.id;
    const didILikePost = _.find(props.usersLikedPost, {id: props.user.id});
    const likeLink = (amIAuthenticated && !props.isEditable ? (
      <span>
        {' - '}
        <a onClick={didILikePost ? unlikePost : likePost}>{didILikePost ? 'Un-like' : 'Like'}</a>
        {props.isLiking ? (
          <span className="post-like-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </span>
    ) : false);

    // "Hide" / "Un-hide"
    const hideLink = (props.isInHomeFeed ? (
      <span>
        {' - '}
        <a onClick={props.isHidden ? unhidePost : hidePost}>{props.isHidden ? 'Un-hide' : 'Hide'}</a>
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </span>
    ) : false);

    // "More" menu
    const moreLink = (props.isEditable ? (
      <span>
        {' - '}
        <PostMoreMenu
          post={props}
          toggleEditingPost={toggleEditingPost}
          toggleModeratingComments={toggleModeratingComments}
          disableComments={disableComments}
          enableComments={enableComments}
          deletePost={deletePost}/>
      </span>
    ) : false);

    const linkToEmbed = getFirstLinkToEmbed(props.body);
    const noImageAttachments = !props.attachments.some(attachment => attachment.mediaType === 'image');

    return (props.isRecentlyHidden ? (
      <div className="post recently-hidden-post">
        <i>Entry hidden - </i>
        <a onClick={unhidePost}>undo</a>.
        {' '}
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        ) : false}
      </div>
    ) : (
      <div className={postClass}>
        <div className="post-userpic">
          <Link to={`/${props.createdBy.username}`}>
            <img src={profilePicture} width={profilePictureSize} height={profilePictureSize}/>
          </Link>
        </div>
        <div className="post-body">
          <div className="post-header">
            <UserName className="post-author" user={props.createdBy}/>
            {recipients.length > 0 ? ' to ' : false}
            {recipients}
          </div>

          {props.isEditing ? (
            <div className="post-editor">
              <Dropzone
                addAttachmentResponse={att => props.addAttachmentResponse(this.props.id, att)}
                addedFile={this.changeAttachmentQueue(1)}
                removedFile={this.changeAttachmentQueue(-1)}/>

              <div>
                <Textarea
                  className="post-textarea"
                  defaultValue={props.editingText}
                  onKeyDown={checkSave}
                  onChange={editingPostTextChange}
                  autoFocus={true}
                  minRows={2}
                  maxRows={10}
                  maxLength="1500"/>
              </div>

              <div className="post-edit-options">
                <span className="post-edit-attachments dropzone-trigger">
                  <i className="fa fa-cloud-upload"></i>
                  {' '}
                  Add photos or files
                </span>
              </div>

              <div className="post-edit-actions">
                {props.isSaving ? (
                  <span className="post-edit-throbber">
                    <img width="16" height="16" src={throbber16}/>
                  </span>
                ) : false}
                <a className="post-cancel" onClick={cancelEditingPost}>Cancel</a>
                <button className="btn btn-default btn-xs"
                  onClick={saveEditingPost}
                  disabled={this.state.attachmentQueueLength > 0}>Update</button>
              </div>
            </div>
          ) : (
            <div className="post-text">
              <PieceOfText text={props.body}/>
            </div>
          )}

          <PostAttachments
            attachments={props.attachments}
            isEditing={props.isEditing}
            removeAttachment={this.removeAttachment}/>

          {props.allowLinksPreview && noImageAttachments && linkToEmbed ? (
            <EmbedlyLink link={linkToEmbed}/>) : false}

          <div className="dropzone-previews"></div>

          <div className="post-footer">
            {isReallyPrivate ? (
              <i className="post-lock-icon fa fa-lock" title="This entry is private"></i>
            ) : false}
            {props.isDirect ? (<span>»&nbsp;</span>) : false}
            <Link to={`/${props.createdBy.username}/${props.id}`} className="post-timestamp">
              <time dateTime={createdAtISO} title={createdAtHuman}>{createdAgo}</time>
            </Link>
            {commentLink}
            {likeLink}
            {hideLink}
            {moreLink}
          </div>

          {props.isError ? (
            <div className='post-error'>
              {props.errorString}
            </div>
          ) : false}

          <PostLikes
            post={props}
            likes={props.usersLikedPost}
            showMoreLikes={props.showMoreLikes}/>

          <PostComments
            post={props}
            comments={props.comments}
            creatingNewComment={props.isCommenting}
            updateCommentingText={props.updateCommentingText}
            addComment={props.addComment}
            toggleCommenting={props.toggleCommenting}
            showMoreComments={props.showMoreComments}
            commentEdit={props.commentEdit}/>
        </div>
      </div>
    ));
  }
}
