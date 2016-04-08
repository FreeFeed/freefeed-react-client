import React from 'react';
import {Link} from 'react-router';
import moment from 'moment';
import classnames from 'classnames';

import {fromNowOrNow} from '../utils';
import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';
import UserName from './user-name';
import PieceOfText from './piece-of-text';
import Textarea from 'react-textarea-autosize';
import throbber16 from 'assets/images/throbber-16.gif';
import DropzoneComponent from 'react-dropzone-component';
import {api as apiConfig} from '../config';
import {getToken} from '../services/auth';
import PostMoreMenu from './post-more-menu';
import EmbedlyLink from './embedly-link';
import {getFirstLinkToEmbed} from '../utils';

export default class Post extends React.Component {
  removeAttachment = (attachmentId) => this.props.removeAttachment(this.props.id, attachmentId)

  render() {
    let props = this.props;

    const createdAt = new Date(props.createdAt - 0);
    const createdAtISO = moment(createdAt).format();
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
        saveEditingPost();
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

    // DropzoneJS configuration
    const dropzoneComponentConfig = {
      postUrl: `${apiConfig.host}/v1/attachments`
    };
    const dropzoneConfig = {
      dictDefaultMessage: 'Drop files here', // The message that gets displayed before any files are dropped.
      previewsContainer: '.dropzone-previews', // Define the container to display the previews.
      previewTemplate: `
        <div class="dz-preview dz-file-preview">
          <div class="dz-image"><img data-dz-thumbnail /></div>
          <div class="dz-details" data-dz-remove title="Remove file">
            <div class="dz-size"><span data-dz-size></span></div>
            <div class="dz-filename"><span data-dz-name></span></div>
          </div>
          <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
          <div class="dz-error-message"><span data-dz-errormessage></span></div>
          <div class="dz-success-mark"><svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><title>Check</title><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path></g></svg></div>
          <div class="dz-error-mark"><svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><title>Error</title><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"><g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475"><path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path></g></g></svg></div>
        </div>
      `,
      clickable: '.dropzone-trigger', // Define the element that should be used as click trigger to select files.
      headers: {
        'Cache-Control': null,
        'X-Authentication-Token': getToken()
      }
    };
    const dropzoneEventHandlers = {
      // DropzoneJS uses stopPropagation() for dragenter and drop events, so
      // they are not being propagated to window and it breaks crafty handling
      // of those events we have in the Layout component. So here we have to
      // re-dispatch them to let event handlers in Layout work as they should.
      // The events don't need to be real, just mimic some important parts.
      dragenter: function(e) {
        var dragEnterEvent = new Event('dragenter');
        if (e.dataTransfer && e.dataTransfer.types) {
          dragEnterEvent.dataTransfer = { types: e.dataTransfer.types };
        }
        window.dispatchEvent(dragEnterEvent);
      },
      drop: function(e) {
        var dropEvent = new Event('drop');
        if (e.dataTransfer && e.dataTransfer.types) {
          dropEvent.dataTransfer = { types: e.dataTransfer.types };
        }
        window.dispatchEvent(dropEvent);
      },

      success: function(file, response) {
        // Remove file preview after upload
        this.removeFile(file);

        // Add uploaded attachment to the post
        // 'attachments' in this response will be an attachment object, not an array of objects
        props.addAttachmentResponse(props.id, response.attachments);
      }
    };

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
              <DropzoneComponent
                config={dropzoneComponentConfig}
                djsConfig={dropzoneConfig}
                eventHandlers={dropzoneEventHandlers}/>

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
                <button className="btn btn-default btn-xs" onClick={saveEditingPost}>Update</button>
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

          {noImageAttachments && linkToEmbed ? (
            <EmbedlyLink link={linkToEmbed}/>) : false}

          <div className="dropzone-previews"></div>

          <div className="post-footer">
            {isReallyPrivate ? (
              <i className="post-lock-icon fa fa-lock" title="This entry is private"></i>
            ) : false}
            {props.isDirect ? (<span>»&nbsp;</span>) : false}
            <Link to={`/${props.createdBy.username}/${props.id}`} className="post-timestamp">
              <time dateTime={createdAtISO} title={createdAtISO}>{createdAgo}</time>
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
