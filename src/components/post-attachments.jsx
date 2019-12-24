import React from 'react';
import ImageAttachmentsContainer from './post-attachment-image-container';
import AudioAttachment from './post-attachment-audio';
import GeneralAttachment from './post-attachment-general';
import ErrorBoundary from './error-boundary';
import VideoAttachmentsContainer from './post-attachment-video-container';

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

  const isVideo = (attachment) => attachment.fileName.match(/\.(mp4|webm)$/i);
  const videoAttachments = attachments.filter((attachment) => isVideo(attachment));
  const videoAttachmentNodes = videoAttachments.length ? (
    <VideoAttachmentsContainer
      isEditing={props.isEditing}
      isSinglePost={props.isSinglePost}
      removeAttachment={props.removeAttachment}
      reorderImageAttachments={props.reorderImageAttachments}
      attachments={videoAttachments}
      postId={props.postId}
    />
  ) : (
    false
  );

  const generalAttachments = attachments.filter(
    (attachment) => attachment.mediaType === 'general' && !isVideo(attachment),
  );
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
        {videoAttachmentNodes}
        {generalAttachmentsContainer}
      </ErrorBoundary>
    </div>
  ) : (
    false
  );
};
