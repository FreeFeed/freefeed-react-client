import React from 'react';
import ImageAttachmentsContainer from './post-attachment-image-container';
import AudioAttachment from './post-attachment-audio';
import GeneralAttachment from './post-attachment-general';
import ErrorBoundary from './error-boundary';

export default (props) => {
  const attachments = props.attachments || [];

  const imageAttachments = attachments.filter((attachment) => attachment.mediaType === 'image');
  const imageAttachmentsContainer = imageAttachments.length ? (
    <ImageAttachmentsContainer
      isEditing={props.isEditing}
      isSinglePost={props.isSinglePost}
      removeAttachment={props.removeAttachment}
      reorderImageAttachments={props.reorderImageAttachments}
      attachments={imageAttachments}
      postId={props.postId}
    />
  ) : (
    false
  );

  const audioAttachments = attachments.filter((attachment) => attachment.mediaType === 'audio');
  const audioAttachmentsNodes = audioAttachments.map((attachment) => (
    <AudioAttachment
      key={attachment.id}
      isEditing={props.isEditing}
      removeAttachment={props.removeAttachment}
      {...attachment}
    />
  ));
  const audioAttachmentsContainer = audioAttachments.length ? (
    <div className="audio-attachments">{audioAttachmentsNodes}</div>
  ) : (
    false
  );

  const generalAttachments = attachments.filter((attachment) => attachment.mediaType === 'general');
  const generalAttachmentsNodes = generalAttachments.map((attachment) => (
    <GeneralAttachment
      key={attachment.id}
      isEditing={props.isEditing}
      removeAttachment={props.removeAttachment}
      {...attachment}
    />
  ));
  const generalAttachmentsContainer = generalAttachments.length ? (
    <div className="general-attachments">{generalAttachmentsNodes}</div>
  ) : (
    false
  );

  return attachments.length > 0 ? (
    <div className="attachments">
      <ErrorBoundary>
        {imageAttachmentsContainer}
        {audioAttachmentsContainer}
        {generalAttachmentsContainer}
      </ErrorBoundary>
    </div>
  ) : (
    false
  );
};
