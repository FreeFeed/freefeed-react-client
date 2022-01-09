import ErrorBoundary from '../error-boundary';

import ImageAttachmentsContainer from './post-attachment-image-container';
import AudioAttachment from './post-attachment-audio';
import GeneralAttachment from './post-attachment-general';
import VideoAttachment from './post-attachment-video';

const looksLikeAVideoFile = (attachment) => {
  const lowercaseFileName = attachment.fileName.toLowerCase();
  return lowercaseFileName.endsWith('.mov') || lowercaseFileName.endsWith('.mp4');
};

export default (props) => {
  const attachments = props.attachments || [];

  const imageAttachments = [];
  const audioAttachments = [];
  const videoAttachments = [];
  const generalAttachments = [];

  attachments.forEach((attachment) => {
    if (attachment.mediaType === 'image') {
      imageAttachments.push(attachment);
    } else if (attachment.mediaType === 'audio') {
      audioAttachments.push(attachment);
    } else if (attachment.mediaType === 'general' && looksLikeAVideoFile(attachment)) {
      videoAttachments.push(attachment);
    } else {
      generalAttachments.push(attachment);
    }
  });

  const imageAttachmentsContainer =
    imageAttachments.length > 0 ? (
      <ImageAttachmentsContainer
        isEditing={props.isEditing}
        isSinglePost={props.isSinglePost}
        showMedia={props.showMedia}
        removeAttachment={props.removeAttachment}
        reorderImageAttachments={props.reorderImageAttachments}
        attachments={imageAttachments}
        postId={props.postId}
      />
    ) : (
      false
    );

  const audioAttachmentsNodes = audioAttachments.map((attachment) => (
    <AudioAttachment
      key={attachment.id}
      isEditing={props.isEditing}
      removeAttachment={props.removeAttachment}
      {...attachment}
    />
  ));
  const audioAttachmentsContainer =
    audioAttachments.length > 0 ? (
      <div className="audio-attachments">{audioAttachmentsNodes}</div>
    ) : (
      false
    );

  const videoAttachmentsNodes = videoAttachments.map((attachment) => (
    <VideoAttachment
      key={attachment.id}
      isEditing={props.isEditing}
      removeAttachment={props.removeAttachment}
      {...attachment}
    />
  ));
  const videoAttachmentsContainer =
    videoAttachments.length > 0 ? (
      <div className="video-attachments">{videoAttachmentsNodes}</div>
    ) : (
      false
    );

  const generalAttachmentsNodes = generalAttachments.map((attachment) => (
    <GeneralAttachment
      key={attachment.id}
      isEditing={props.isEditing}
      removeAttachment={props.removeAttachment}
      {...attachment}
    />
  ));
  const generalAttachmentsContainer =
    generalAttachments.length > 0 ? (
      <div className="general-attachments">{generalAttachmentsNodes}</div>
    ) : (
      false
    );

  return attachments.length > 0 ? (
    <div className="attachments" role="region" aria-label={`${attachments.length} attachments`}>
      <ErrorBoundary>
        {imageAttachmentsContainer}
        {audioAttachmentsContainer}
        {videoAttachmentsContainer}
        {generalAttachmentsContainer}
      </ErrorBoundary>
    </div>
  ) : (
    false
  );
};
