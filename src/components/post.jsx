import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';
import Textarea from 'react-textarea-autosize';
import { faExclamationTriangle, faCloudUploadAlt, faLock, faUserFriends, faGlobeAmericas, faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons';
import { format, parse } from 'date-fns';

import { getFirstLinkToEmbed } from '../utils/parse-text';
import { READMORE_STYLE_COMPACT } from '../utils/frontend-preferences-options';
import { postReadmoreConfig } from '../utils/readmore-config';
import { datetimeFormat } from '../utils/get-date-from-short-string';
import config from '../config';
import { savePost } from '../redux/action-creators';
import { Throbber } from './throbber';

import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';
import PostVia from './post-via';
import UserName from './user-name';
import Expandable from './expandable';
import PieceOfText from './piece-of-text';
import Dropzone from './dropzone';
import PostMoreMenu from './post-more-menu';
import TimeDisplay from './time-display';
import LinkPreview from './link-preview/preview';
import SendTo from './send-to';
import { destinationsPrivacy } from './select-utils';
import { makeJpegIfNeeded } from './create-post';
import { Icon } from './fontawesome-icons';


class Post extends React.Component {
  selectFeeds;

  state = {
    showTimestamps:     false,
    privacyWarning:     null,
    attLoading:         false,
    emptyDestinations:  false,
    editingText:        '',
    editingAttachments: [],
    dropzoneDisabled:   false,
  };

  handleDropzoneInit = (d) => {
    this.dropzoneObject = d;
  };

  handlePaste = (e) => {
    if (e.clipboardData) {
      const { items } = e.clipboardData;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image/') > -1) {
            const blob = items[i].getAsFile();
            if (!blob.name) {
              blob.name = 'image.png';
            }
            makeJpegIfNeeded(blob).then((blob) => this.dropzoneObject.addFile(blob));
          }
        }
      }
    }
  };

  removeAttachment = (attachmentId) => {
    const editingAttachments = this.state.editingAttachments.filter((a) => a.id !== attachmentId);
    const dropzoneDisabled = editingAttachments.length >= config.attachments.maxCount;

    if (!dropzoneDisabled && this.state.dropzoneDisabled) {
      this.dropzoneObject.enable();
    }

    this.setState({ editingAttachments, dropzoneDisabled });
  };

  reorderImageAttachments = (attachmentIds) => {
    const oldIds = this.state.editingAttachments.map((a) => a.id);
    const newIds = _.uniq(attachmentIds.concat(oldIds));
    const editingAttachments = newIds
      .map((id) => this.state.editingAttachments.find((a) => a.id === id))
      .filter(Boolean);
    this.setState({ editingAttachments });
  };

  attLoadingStarted = () => this.setState({ attLoading: true });
  attLoadingCompleted = () => this.setState({ attLoading: false });

  handleCommentClick = () => {
    if (this.props.isSinglePost) {
      return;
    }

    this.props.toggleCommenting(this.props.id);
  };

  handleDeletePost = () => {
    this.props.deletePost(this.props.id);
  };

  handleUnhideClick = () => {
    this.props.unhidePost(this.props.id);
  };

  handleHideClick = () => {
    this.props.hidePost(this.props.id);
  };

  toggleSave = () => {
    const { id, isSaved, savePost, savePostStatus } = this.props;
    savePostStatus.loading || savePost(id, !isSaved);
  };

  likePost = () => {
    this.props.likePost(this.props.id, this.props.user.id);
  };

  unlikePost = () => {
    this.props.unlikePost(this.props.id, this.props.user.id);
  };

  toggleModeratingComments = () => {
    this.props.toggleModeratingComments(this.props.id);
  };

  disableComments = () => {
    this.props.disableComments(this.props.id);
  };

  enableComments = () => {
    this.props.enableComments(this.props.id);
  };

  handlePostTextChange = (e) => {
    this.setState({ editingText: e.target.value });
  };

  toggleEditingPost = () => {
    if (!this.props.isEditing) {
      this.setState({
        editingText:        this.props.body,
        editingAttachments: [...this.props.attachments],
      });
    }
    this.props.toggleEditingPost(this.props.id);
  };

  cancelEditingPost = () => {
    this.props.cancelEditingPost(this.props.id);
  };

  saveEditingPost = () => {
    const { props, state } = this;

    if (props.isSaving) {
      return;
    }

    const reqBody = {
      body:        state.editingText,
      attachments: state.editingAttachments.map((a) => a.id),
    };
    if (this.selectFeeds) {
      reqBody.feeds = this.selectFeeds.values;
    }
    props.saveEditingPost(props.id, reqBody);
  };

  handleKeyDown = (event) => {
    const isEnter = event.keyCode === 13;
    const isShiftPressed = event.shiftKey;

    if (isEnter && !isShiftPressed) {
      event.preventDefault();
      this.canSubmitForm() && this.saveEditingPost();
    }
  };

  handleAttachmentResponse = (att) => {
    if (this.state.editingAttachments.length >= config.attachments.maxCount) {
      return;
    }

    const editingAttachments = [...this.state.editingAttachments, att];
    const dropzoneDisabled = editingAttachments.length >= config.attachments.maxCount;

    if (dropzoneDisabled && !this.state.dropzoneDisabled) {
      this.dropzoneObject.removeAllFiles(true);
      this.dropzoneObject.disable();
    }

    this.props.addAttachmentResponse(this.props.id, att);
    this.setState({ editingAttachments, dropzoneDisabled });
  };

  toggleTimestamps = () => {
    this.setState({ showTimestamps: !this.state.showTimestamps });
  };

  registerSelectFeeds = (el) => {
    this.selectFeeds = el;
    this.setState({ privacyWarning: null });
  };

  onDestsChange = (destNames) => {
    this.setState({ emptyDestinations: destNames.length === 0 });
    if (this.props.isDirect) {
      return;
    }
    const postPrivacy = this.getPostPrivacy();
    const destPrivacy = this.props.destinationsPrivacy(destNames);
    if (
      (postPrivacy.isPrivate && !destPrivacy.isPrivate) ||
      (postPrivacy.isProtected && !destPrivacy.isProtected)
    ) {
      const pp = postPrivacy.isPrivate ? 'private' : postPrivacy.isProtected ? 'protected' : 'public';
      const dp = destPrivacy.isPrivate ? 'private' : destPrivacy.isProtected ? 'protected' : 'public';
      this.setState({ privacyWarning: `This action will make this ${pp} post ${dp}.` });
    } else {
      this.setState({ privacyWarning: null });
    }
  };

  getPostPrivacy() {
    const authorOrGroupsRecipients = this.props.recipients
      .filter((r) => r.id === this.props.createdBy.id || r.type === 'group');
    const isPrivate = !authorOrGroupsRecipients.some((r) => r.isPrivate === '0');
    const isProtected = isPrivate || !authorOrGroupsRecipients.some((r) => r.isProtected === '0');
    return { isPrivate, isProtected };
  }

  canSubmitForm() {
    const { editingText, attLoading, emptyDestinations } = this.state;
    return _.trim(editingText) !== '' && !attLoading && !emptyDestinations;
  }

  get attachments() {
    return this.props.isEditing ? this.state.editingAttachments : this.props.attachments;
  }

  render() {
    const { props } = this;

    const profilePicture = props.isSinglePost ?
      props.createdBy.profilePictureLargeUrl : props.createdBy.profilePictureMediumUrl;
    const profilePictureSize = props.isSinglePost ? 75 : 50;

    // Hidden user or group
    if (props.isInHomeFeed) {
      const hiddenUsers = props.user.frontendPreferences.homefeed.hideUsers;
      if (!_.isEmpty(hiddenUsers)) {
        const rcpNames = props.recipients.map((u) => u.username);
        rcpNames.push(props.createdBy.username);
        if (!_.isEmpty(_.intersection(rcpNames, hiddenUsers))) {
          return false;
        }
      }
    }

    const postClass = classnames({
      'post':          true,
      'single-post':   props.isSinglePost,
      'timeline-post': !props.isSinglePost,
      'direct-post':   props.isDirect
    });

    const recipientCustomDisplay = function (recipient) {
      if (recipient.id !== props.createdBy.id) {
        return false;
      }

      const lastCharacter = recipient.username[recipient.username.length - 1];
      const suffix = lastCharacter === 's' ? '\u2019 feed' : '\u2019s feed';

      return `${recipient.username}${suffix}`;
    };

    let { recipients } = props;
    // Check if the post has been only submitted to one recipient
    // and if we can omit it
    if (recipients.length === 1) {
      // If the post is in user/group feed (one-source list), we should omit
      // the only recipient, since it would be that feed.
      if (recipients[0].id === props.createdBy.id) {
        // When in a many-sources list (Home, Direct messages, My discussions),
        // we should omit the only recipient if it's the author's feed.
        recipients = [];
      }
    }
    recipients = recipients.map((recipient, index) => (
      <span key={index}>
        <UserName className="post-recipient" user={recipient}>
          {recipientCustomDisplay(recipient)}
        </UserName>
        {index < props.recipients.length - 2 ? ', ' : false}
        {index === props.recipients.length - 2 ? ' and ' : false}
      </span>
    ));

    const canonicalPostURI = canonicalURI(props);

    const { isPrivate, isProtected } = this.getPostPrivacy();

    const amIAuthenticated = !!props.user.id;
    // "Comments disabled" / "Comment"
    let commentLink;
    if (amIAuthenticated) {
      if (props.commentsDisabled) {
        if (props.isEditable || props.isModeratable) {
          commentLink = (
            <span>
              {' - '}
              <i>Comments disabled (not for you)</i>
              {' - '}
              <a className="post-action" onClick={this.handleCommentClick}>Comment</a>
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
            <a className="post-action" onClick={this.handleCommentClick}>Comment</a>
          </span>
        );
      }
    } else { // don't show comment link to anonymous users
      commentLink = false;
    }

    // "Like" / "Un-like"
    const didILikePost = _.find(props.usersLikedPost, { id: props.user.id });
    const likeLink = (amIAuthenticated && !props.isEditable ? (
      <span>
        {' - '}
        {props.likeError ? (
          <Icon icon={faExclamationTriangle} className="post-like-fail" title={props.likeError} />
        ) : null}
        <a className="post-action" onClick={didILikePost ? this.unlikePost : this.likePost}>{didILikePost ? 'Un-like' : 'Like'}</a>
        {props.isLiking ? (
          <span className="post-like-throbber">
            <Throbber />
          </span>
        ) : false}
      </span>
    ) : false);

    // "Hide" / "Un-hide"
    const hideLink = (props.isInHomeFeed ? (
      <span>
        {' - '}
        <a className="post-action" onClick={props.isHidden ? this.handleUnhideClick : this.handleHideClick}>{props.isHidden ? 'Un-hide' : 'Hide'}</a>
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <Throbber />
          </span>
        ) : false}
      </span>
    ) : false);

    const { isSaved, savePostStatus } = this.props;
    const saveLink = amIAuthenticated && (
      <span>
        {' - '}
        <a className="post-action" onClick={this.toggleSave}>{isSaved ? 'Un-save' : 'Save'}</a>
        {savePostStatus.loading && <Throbber />}
        {savePostStatus.error && <Icon icon={faExclamationTriangle} className="post-like-fail" title={savePostStatus.errorText} />}
      </span>
    );

    // "More" menu
    const moreLink = (props.isEditable || props.isModeratable ? (
      <span>
        {' - '}
        <PostMoreMenu
          post={props}
          toggleEditingPost={this.toggleEditingPost}
          toggleModeratingComments={this.toggleModeratingComments}
          disableComments={this.disableComments}
          enableComments={this.enableComments}
          deletePost={this.handleDeletePost}
        />
      </span>
    ) : false);

    const linkToEmbed = getFirstLinkToEmbed(props.body);
    const noImageAttachments = !this.attachments.some((attachment) => attachment.mediaType === 'image');

    return (props.isRecentlyHidden ? (
      <div className="post recently-hidden-post">
        <i>Entry hidden - </i>
        <a className="post-action" onClick={this.handleUnhideClick}>undo</a>.
        {' '}
        {props.isHiding ? (
          <span className="post-hide-throbber">
            <Throbber />
          </span>
        ) : false}
      </div>
    ) : (
      <div className={postClass} data-author={props.createdBy.username}>
        <Expandable
          expanded={props.isEditing || props.isSinglePost || props.readMoreStyle === READMORE_STYLE_COMPACT}
          config={postReadmoreConfig}
        >
          <div className="post-userpic">
            <Link to={`/${props.createdBy.username}`}>
              <img className="post-userpic-img" src={profilePicture} width={profilePictureSize} height={profilePictureSize} />
            </Link>
          </div>
          <div className="post-body">
            {props.isEditing ? (
              <div>
                <SendTo
                  ref={this.registerSelectFeeds}
                  defaultFeed={props.recipients.map((r) => r.username)}
                  isDirects={props.isDirect}
                  isEditing={true}
                  disableAutoFocus={true}
                  user={props.createdBy}
                  onChange={this.onDestsChange}
                />
                <div className="post-privacy-warning">{this.state.privacyWarning}</div>
              </div>
            ) : (
              <div className="post-header">
                <UserName className="post-author" user={props.createdBy} />
                {recipients.length > 0 ? ' to ' : false}
                {recipients}
                {this.props.isInHomeFeed ? <PostVia post={this.props} me={this.props.user} /> : false}
              </div>
            )}
            {props.isEditing ? (
              <div className="post-editor">
                <Dropzone
                  onInit={this.handleDropzoneInit}
                  addAttachmentResponse={this.handleAttachmentResponse}
                  onSending={this.attLoadingStarted}
                  onQueueComplete={this.attLoadingCompleted}
                />

                <div>
                  <Textarea
                    className="post-textarea"
                    value={this.state.editingText}
                    onKeyDown={this.handleKeyDown}
                    onChange={this.handlePostTextChange}
                    onPaste={this.handlePaste}
                    autoFocus={true}
                    minRows={2}
                    maxRows={10}
                    maxLength="1500"
                  />
                </div>

                <div className="post-edit-options">
                  <span className="post-edit-attachments dropzone-trigger" disabled={this.state.dropzoneDisabled}>
                    <Icon icon={faCloudUploadAlt} className="upload-icon" />
                    {' '}
                    Add photos or files
                  </span>
                </div>

                <div className="post-edit-actions">
                  {props.isSaving ? (
                    <span className="post-edit-throbber">
                      <Throbber />
                    </span>
                  ) : false}
                  <a className="post-cancel" onClick={this.cancelEditingPost}>Cancel</a>
                  <button
                    className="btn btn-default btn-xs"
                    onClick={this.saveEditingPost}
                    disabled={!this.canSubmitForm()}
                  >
                    Update
                  </button>
                </div>
                {this.state.dropzoneDisabled && (
                  <div className="alert alert-warning">
                    The maximum number of attached files ({config.attachments.maxCount}) has been reached
                  </div>
                )}
                {props.isError ? <div className="post-error alert alert-danger">{props.errorString}</div> : false}
              </div>
            ) : (
              <div className="post-text">
                <PieceOfText
                  text={props.body}
                  readMoreStyle={props.readMoreStyle}
                  highlightTerms={props.highlightTerms}
                />
              </div>
            )}
          </div>
        </Expandable>

        <div className="post-body">
          <PostAttachments
            postId={props.id}
            attachments={this.attachments}
            isEditing={props.isEditing}
            isSinglePost={props.isSinglePost}
            removeAttachment={this.removeAttachment}
            reorderImageAttachments={this.reorderImageAttachments}
          />

          {noImageAttachments && linkToEmbed ? (
            <div className="link-preview"><LinkPreview url={linkToEmbed} allowEmbedly={props.allowLinksPreview} /></div>
          ) : false}

          <div className="dropzone-previews" />

          <div className="post-footer">
            <span className="post-timestamps-toggle" onClick={this.toggleTimestamps}>
              {isPrivate ? (
                <Icon icon={faLock} className="post-lock-icon post-private-icon" title="This entry is private" />
              ) : isProtected ? (
                <Icon icon={faUserFriends} className="post-lock-icon post-protected-icon" title="This entry is only visible to FreeFeed users" />
              ) : (
                <Icon icon={faGlobeAmericas} className="post-lock-icon post-public-icon" title="This entry is public" />
              )}
            </span>
            {props.isDirect && <Icon icon={faAngleDoubleRight} className="post-direct-icon" title="This is a direct message" />}
            <Link to={canonicalPostURI} className="post-timestamp">
              {this.state.showTimestamps ? (
                format(parse(+props.createdAt), datetimeFormat)
              ) : (
                <TimeDisplay timeStamp={+props.createdAt} />
              )}
            </Link>
            {commentLink}
            {likeLink}
            {saveLink}
            {hideLink}
            {moreLink}
          </div>

          <PostLikes
            post={props}
            likes={props.usersLikedPost}
            showMoreLikes={props.showMoreLikes}
          />

          <PostComments
            post={props}
            comments={props.comments}
            creatingNewComment={props.isCommenting}
            updateCommentingText={props.updateCommentingText}
            addComment={props.addComment}
            toggleCommenting={props.toggleCommenting}
            showMoreComments={props.showMoreComments}
            commentEdit={props.commentEdit}
            readMoreStyle={props.readMoreStyle}
            entryUrl={canonicalPostURI}
            highlightTerms={props.highlightTerms}
            isSinglePost={props.isSinglePost}
            showTimestamps={this.state.showTimestamps}
            user={props.user}
          />
        </div>
      </div>
    ));
  }
}

// Canonical post URI (pathname)
export function canonicalURI(post) {
  // If posted _only_ into groups, use first recipient's username
  let urlName = post.createdBy.username;
  if (post.recipients.length > 0 && !post.recipients.some((r) => r.type === "user")) {
    urlName = post.recipients[0].username;
  }
  return `/${encodeURIComponent(urlName)}/${encodeURIComponent(post.id)}`;
}

function selectState(state, ownProps) {
  return { destinationsPrivacy: ownProps.isEditing ? (destNames) => destinationsPrivacy(destNames, state) : null };
}

export default connect(selectState, { savePost })(Post);
