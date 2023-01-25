/* global CONFIG */
import { createRef, Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';
import dateFormat from 'date-fns/format';
import * as Sentry from '@sentry/react';
import {
  faExclamationTriangle,
  faLock,
  faUserFriends,
  faGlobeAmericas,
  faAngleDoubleRight,
  faPaperclip,
  faShare,
} from '@fortawesome/free-solid-svg-icons';

import { pluralForm } from '../../utils';
import { getFirstLinkToEmbed } from '../../utils/parse-text';
import { canonicalURI } from '../../utils/canonical-uri';
import { READMORE_STYLE_COMPACT } from '../../utils/frontend-preferences-options';
import { postReadmoreConfig } from '../../utils/readmore-config';
import { savePost, hidePostsByCriterion, unhidePostsByCriteria } from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
import { makeJpegIfNeeded } from '../../utils/jpeg-if-needed';

import { Throbber } from '../throbber';
import { ButtonLink } from '../button-link';
import Expandable from '../expandable';
import PieceOfText from '../piece-of-text';
import Dropzone from '../dropzone';
import TimeDisplay from '../time-display';
import LinkPreview from '../link-preview/preview';
import SendTo from '../send-to';
import ErrorBoundary from '../error-boundary';
import { destinationsPrivacy } from '../select-utils';
import { Icon } from '../fontawesome-icons';
import { UserPicture } from '../user-picture';
import { SubmitModeHint } from '../submit-mode-hint';
import { SubmittableTextarea } from '../mention-textarea';

import { UnhideOptions, HideLink } from './post-hides-ui';
import PostMoreLink from './post-more-link';
import PostLikeLink from './post-like-link';
import PostHeader from './post-header';
import PostAttachments from './post-attachments';
import PostComments from './post-comments';
import PostLikes from './post-likes';

const attachmentsMaxCount = CONFIG.attachments.maxCount;

class Post extends Component {
  selectFeeds;
  hideLink = createRef();
  textareaRef = createRef();

  state = {
    forceAbsTimestamps: false,
    privacyWarning: null,
    attLoading: false,
    emptyDestinations: false,
    editingText: '',
    editingAttachments: [],
    dropzoneDisabled: false,
    unHideOpened: false,
  };

  handleDropzoneInit = (d) => {
    this.dropzoneObject = d;
  };

  handlePaste = (e) => {
    if (e.clipboardData) {
      const { items } = e.clipboardData;
      if (items) {
        for (const item of items) {
          if (item.type.includes('image/')) {
            const blob = item.getAsFile();
            if (!blob.name) {
              blob.name = 'image.png';
            }
            makeJpegIfNeeded(blob)
              .then((blob) => this.dropzoneObject.addFile(blob))
              .catch((error) => {
                Sentry.captureException(error, {
                  level: 'error',
                  tags: { area: 'upload' },
                });
              });
          }
        }
      }
    }
  };

  removeAttachment = (attachmentId) => {
    const editingAttachments = this.state.editingAttachments.filter((a) => a.id !== attachmentId);
    const dropzoneDisabled = editingAttachments.length >= attachmentsMaxCount;

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

  handleDeletePost =
    (...fromFeeds) =>
    () =>
      this.props.deletePost(this.props.id, fromFeeds);

  handleHideClick = () => {
    if (this.props.isHidden) {
      this.props.unhidePost(this.props.id);
    } else {
      this.props.hidePost(this.props.id);
    }
  };
  handleFullUnhide = () => {
    const { props } = this;
    props.isHidden && props.unhidePost(props.id);
    // Unhide all post criteria
    props.unhidePostsByCriteria(props.availableHideCriteria, props.id);
  };

  handleUnhideByCriteria = (crit) => () =>
    this.props.hidePostsByCriterion(crit, this.props.id, false);

  toggleUnHide = () => this.setState({ unHideOpened: !this.state.unHideOpened });

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
    this.setState({ editingText: e });
  };

  toggleEditingPost = () => {
    if (!this.props.isEditing) {
      this.setState({
        editingText: this.props.body,
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
      body: state.editingText,
      attachments: state.editingAttachments.map((a) => a.id),
    };
    if (this.selectFeeds) {
      reqBody.feeds = this.selectFeeds.values;
    }
    props.saveEditingPost(props.id, reqBody);
  };

  handleSubmit = () => this.canSubmitForm() && this.saveEditingPost();

  handleAttachmentResponse = (att) => {
    if (this.state.editingAttachments.length >= attachmentsMaxCount) {
      return;
    }

    const editingAttachments = [...this.state.editingAttachments, att];
    const dropzoneDisabled = editingAttachments.length >= attachmentsMaxCount;

    if (dropzoneDisabled && !this.state.dropzoneDisabled) {
      this.dropzoneObject.removeAllFiles(true);
      this.dropzoneObject.disable();
    }

    this.props.addAttachmentResponse(this.props.id, att);
    this.setState({ editingAttachments, dropzoneDisabled });
  };

  toggleTimestamps = () => {
    this.setState({ forceAbsTimestamps: !this.state.forceAbsTimestamps });
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
      const pp = postPrivacy.isPrivate
        ? 'private'
        : postPrivacy.isProtected
        ? 'protected'
        : 'public';
      const dp = destPrivacy.isPrivate
        ? 'private'
        : destPrivacy.isProtected
        ? 'protected'
        : 'public';
      this.setState({ privacyWarning: `This action will make this ${pp} post ${dp}.` });
    } else {
      this.setState({ privacyWarning: null });
    }
  };

  getPostPrivacy() {
    const authorOrGroupsRecipients = this.props.recipients.filter(
      (r) => r.id === this.props.createdBy.id || r.type === 'group',
    );
    const isPrivate = !authorOrGroupsRecipients.some((r) => r.isPrivate === '0');
    const isProtected = isPrivate || !authorOrGroupsRecipients.some((r) => r.isProtected === '0');
    return { isPrivate, isProtected };
  }

  canSubmitForm() {
    const { editingText, attLoading, emptyDestinations } = this.state;
    return (
      (editingText.trim() !== '' || this.state.editingAttachments.length > 0) &&
      !attLoading &&
      !emptyDestinations
    );
  }

  get attachments() {
    return this.props.isEditing ? this.state.editingAttachments : this.props.attachments;
  }

  componentWillUnmount() {
    this.hideLink.current &&
      this.props.setFinalHideLinkOffset(this.hideLink.current.getBoundingClientRect().top);
  }

  renderHideLink() {
    const { props } = this;
    return (
      <>
        <HideLink
          isHidden={props.isHidden}
          hiddenByCriteria={props.hiddenByCriteria}
          unHideOpened={this.state.unHideOpened}
          toggleUnHide={this.toggleUnHide}
          handleHideClick={this.handleHideClick}
          handleFullUnhide={this.handleFullUnhide}
        />
        {props.hideStatus.loading && (
          <span className="post-hide-throbber">
            <Throbber />
          </span>
        )}
        {props.hideStatus.error && (
          <Icon
            icon={faExclamationTriangle}
            className="post-hide-fail"
            title={props.hideStatus.errorText}
          />
        )}
      </>
    );
  }

  getAriaLabels = () => {
    const {
      isSinglePost,
      isDirect,
      recipientNames,
      createdBy,
      omittedComments,
      comments,
      likes,
      isNSFW,
      createdAt,
    } = this.props;

    const { isPrivate, isProtected } = this.getPostPrivacy();

    const role = `article${isSinglePost ? '' : ' listitem'}`;

    const postTypeLabel = isDirect
      ? 'Direct message'
      : isPrivate
      ? 'Private post'
      : isProtected
      ? 'Protected post'
      : 'Public post';

    const recipientsWithoutAuthor = recipientNames.filter((r) => r !== createdBy.username);
    const recipientsLabel =
      recipientsWithoutAuthor.length > 0
        ? `to ${recipientsWithoutAuthor.join(', ')}`
        : isDirect
        ? 'to nobody'
        : false;

    const commentsAndLikesLabel = `with ${pluralForm(
      omittedComments + comments.length,
      'comment',
    )} and ${pluralForm(likes.length, 'like')}`;

    const postLabel = [
      isNSFW ? 'Not safe for work' : false,
      postTypeLabel,
      `by ${createdBy.username}`,
      recipientsLabel,
      commentsAndLikesLabel,
      `written on ${dateFormat(new Date(+createdAt), 'PPP')}`,
    ]
      .filter(Boolean)
      .join(' ');

    return { role, postLabel };
  };

  renderPostActions() {
    const { props } = this;

    const canonicalPostURI = canonicalURI(props);

    const { isPrivate, isProtected } = this.getPostPrivacy();

    const amIAuthenticated = !!props.user.id;

    const commentLink = amIAuthenticated &&
      (!props.commentsDisabled || props.isEditable || props.isModeratable) && (
        <ButtonLink className="post-action" onClick={this.handleCommentClick}>
          Comment
        </ButtonLink>
      );

    // "Like" / "Un-like"
    const didILikePost = _.find(props.usersLikedPost, { id: props.user.id });
    const likeLink =
      amIAuthenticated && !props.isEditable ? (
        <PostLikeLink
          onLikePost={this.likePost}
          onUnlikePost={this.unlikePost}
          didILikePost={didILikePost}
          likeError={props.likeError}
          isLiking={props.isLiking}
        />
      ) : (
        false
      );

    // "More" menu
    const moreLink = (
      <PostMoreLink
        user={props.user}
        post={props}
        toggleEditingPost={this.toggleEditingPost}
        toggleModeratingComments={this.toggleModeratingComments}
        disableComments={this.disableComments}
        enableComments={this.enableComments}
        deletePost={this.handleDeletePost}
        toggleSave={this.toggleSave}
      />
    );

    return (
      <div role="region" aria-label="Post footer">
        <div className="post-footer">
          <div className="post-footer-icon">
            {isPrivate ? (
              <Icon
                icon={faLock}
                className="post-lock-icon post-private-icon"
                title="This entry is private"
                onClick={this.toggleTimestamps}
                role="button"
              />
            ) : isProtected ? (
              <Icon
                icon={faUserFriends}
                className="post-lock-icon post-protected-icon"
                title={`This entry is only visible to ${CONFIG.siteTitle} users`}
                onClick={this.toggleTimestamps}
                role="button"
              />
            ) : (
              <Icon
                icon={faGlobeAmericas}
                className="post-lock-icon post-public-icon"
                title="This entry is public"
                onClick={this.toggleTimestamps}
                role="button"
              />
            )}
          </div>
          <div className="post-footer-content">
            <span className="post-footer-block">
              <span className="post-footer-item">
                {props.isDirect && (
                  <Icon
                    icon={faAngleDoubleRight}
                    className="post-direct-icon"
                    title="This is a direct message"
                  />
                )}
                <Link to={canonicalPostURI} className="post-timestamp">
                  <TimeDisplay
                    timeStamp={+props.createdAt}
                    absolute={this.state.forceAbsTimestamps || null}
                  />
                </Link>
              </span>
              {props.commentsDisabled && (
                <span className="post-footer-item">
                  <i>
                    {props.isEditable || props.isModeratable
                      ? 'Comments disabled (not for you)'
                      : 'Comments disabled'}
                  </i>
                </span>
              )}
            </span>
            <span className="post-footer-block" role="region">
              <span className="post-footer-item">{commentLink}</span>
              <span className="post-footer-item">{likeLink}</span>
              {props.hideEnabled && (
                <span className="post-footer-item" ref={this.hideLink}>
                  {this.renderHideLink()}
                </span>
              )}
              <span className="post-footer-item">{moreLink}</span>
            </span>
          </div>
        </div>
        {props.backlinksCount > 0 && (
          <div className="post-footer">
            <div className="post-footer-icon">
              <Icon icon={faShare} className="post-footer-backlink-icon" />
            </div>
            <span className="post-footer-content">
              <Link href={`/search?q=${encodeURIComponent(props.id)}`}>
                {pluralForm(props.backlinksCount, 'reference')} to this post
              </Link>
            </span>
          </div>
        )}
      </div>
    );
  }

  render() {
    const { props } = this;

    const postClass = classnames({
      post: true,
      'single-post': props.isSinglePost,
      'timeline-post': !props.isSinglePost,
      'direct-post': props.isDirect,
      'nsfw-post': props.isNSFW,
    });

    const canonicalPostURI = canonicalURI(props);

    const linkToEmbed = getFirstLinkToEmbed(props.body);
    const noImageAttachments = !this.attachments.some(
      (attachment) => attachment.mediaType === 'image',
    );

    const { role, postLabel } = this.getAriaLabels();

    return (
      <div
        className={postClass}
        data-author={props.createdBy.username}
        role={role}
        aria-label={postLabel}
      >
        <ErrorBoundary>
          <Expandable
            expanded={
              props.isEditing ||
              props.isSinglePost ||
              props.readMoreStyle === READMORE_STYLE_COMPACT
            }
            config={postReadmoreConfig}
          >
            <div className="post-userpic">
              <UserPicture
                className="post-userpic-img"
                large={props.isSinglePost}
                user={props.createdBy}
                loading="lazy"
              />
            </div>
            <div className="post-body" role="region" aria-label="Post body">
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
                <PostHeader
                  createdBy={props.createdBy}
                  isDirect={props.isDirect}
                  user={this.props.user}
                  isInHomeFeed={this.props.isInHomeFeed}
                  recipients={props.recipients}
                  comments={props.comments}
                  usersLikedPost={props.usersLikedPost}
                />
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
                    <SubmittableTextarea
                      className="post-textarea"
                      ref={this.textareaRef}
                      value={this.state.editingText}
                      onSubmit={this.handleSubmit}
                      onChange={this.handlePostTextChange}
                      onPaste={this.handlePaste}
                      autoFocus={true}
                      minRows={2}
                      maxRows={10}
                      maxLength={CONFIG.maxLength.post}
                      dir={'auto'}
                    />
                  </div>

                  <div className="post-edit-actions">
                    <div className="post-edit-options">
                      <span
                        className="post-edit-attachments dropzone-trigger"
                        disabled={this.state.dropzoneDisabled}
                        role="button"
                      >
                        <Icon icon={faPaperclip} className="upload-icon" /> Add photos or files
                      </span>
                    </div>

                    <SubmitModeHint input={this.textareaRef} className="post-edit-hint" />

                    <div className="post-edit-buttons">
                      {props.isSaving && (
                        <span className="post-edit-throbber">
                          <Throbber />
                        </span>
                      )}
                      <a className="post-cancel" onClick={this.cancelEditingPost}>
                        Cancel
                      </a>
                      <button
                        className="btn btn-default btn-xs"
                        onClick={this.saveEditingPost}
                        disabled={!this.canSubmitForm()}
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {this.state.dropzoneDisabled && (
                    <div className="alert alert-warning">
                      The maximum number of attached files ({attachmentsMaxCount}) has been reached
                    </div>
                  )}
                  {props.isError ? (
                    <div className="post-error alert alert-danger">{props.errorString}</div>
                  ) : (
                    false
                  )}
                </div>
              ) : (
                <div className="post-text">
                  <PieceOfText
                    text={props.body}
                    readMoreStyle={props.readMoreStyle}
                    highlightTerms={props.highlightTerms}
                    showMedia={this.props.showMedia}
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
              showMedia={this.props.showMedia}
              removeAttachment={this.removeAttachment}
              reorderImageAttachments={this.reorderImageAttachments}
            />
            {!noImageAttachments && props.isNSFW && (
              <div className="nsfw-bar">
                Turn the <Link to="/settings/appearance#nsfw">NSFW filter</Link> off to enable
                previews for sensitive content
              </div>
            )}

            {noImageAttachments &&
              linkToEmbed &&
              (props.isNSFW ? (
                <div className="nsfw-bar">
                  Turn the <Link to="/settings/appearance#nsfw">NSFW filter</Link> off to enable
                  previews for sensitive content
                </div>
              ) : (
                <div className="link-preview" role="region" aria-label="Link preview">
                  <LinkPreview url={linkToEmbed} allowEmbedly={props.allowLinksPreview} />
                </div>
              ))}

            <div className="dropzone-previews" />

            {this.renderPostActions()}

            {this.state.unHideOpened && (
              <UnhideOptions
                isHidden={props.isHidden}
                hiddenByCriteria={props.hiddenByCriteria}
                handleUnhideByCriteria={this.handleUnhideByCriteria}
                handleFullUnhide={this.handleFullUnhide}
              />
            )}

            <PostLikes
              post={props}
              likes={props.usersLikedPost}
              showMoreLikes={props.showMoreLikes}
            />

            <PostComments
              post={props}
              comments={props.comments}
              creatingNewComment={props.isCommenting}
              addComment={props.addComment}
              toggleCommenting={props.toggleCommenting}
              showMoreComments={props.showMoreComments}
              showMedia={props.showMedia}
              commentEdit={props.commentEdit}
              readMoreStyle={props.readMoreStyle}
              entryUrl={canonicalPostURI}
              highlightTerms={props.highlightTerms}
              isSinglePost={props.isSinglePost}
              forceAbsTimestamps={this.state.forceAbsTimestamps}
              user={props.user}
              preopened={props.justCreated}
            />
          </div>
        </ErrorBoundary>
      </div>
    );
  }
}

function selectState(state, ownProps) {
  return {
    destinationsPrivacy: ownProps.isEditing
      ? (destNames) => destinationsPrivacy(destNames, state)
      : null,
    hideStatus: state.postHideStatuses[ownProps.id] || initialAsyncState,
    submitMode: state.submitMode,
  };
}

export default connect(selectState, { savePost, hidePostsByCriterion, unhidePostsByCriteria })(
  Post,
);
