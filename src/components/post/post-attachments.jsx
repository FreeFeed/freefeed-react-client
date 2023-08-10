import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import ErrorBoundary from '../error-boundary';

import { showMedia } from '../../redux/action-creators';
import ImageAttachmentsContainer from './post-attachment-image-container';
import AudioAttachment from './post-attachment-audio';
import GeneralAttachment from './post-attachment-general';
import VideoAttachment from './post-attachment-video';

/*
const videoTypes = {
  mov: 'video/quicktime',
  mp4: 'video/mp4; codecs="avc1.42E01E"',
  ogg: 'video/ogg; codecs="theora"',
  webm: 'video/webm; codecs="vp8, vorbis"',
};

// find video-types which browser supports
let video = document.createElement('video');
const supportedVideoTypes = [];
Object.keys(videoTypes).forEach((extension) => {
  const mime = videoTypes[extension];

  if (video.canPlayType(mime) !== '') {
    supportedVideoTypes.push(extension);
  }
});
video = null;
*/

// Nov video support for now
const supportedVideoTypes = [];

const looksLikeAVideoFile = (attachment) => {
  const lowercaseFileName = attachment.fileName.toLowerCase();

  for (const extension of supportedVideoTypes) {
    if (lowercaseFileName.endsWith(`.${extension}`)) {
      return true;
    }
  }

  return false;
};

export default function PostAttachments(props) {
  const attachments = useSelector(
    (state) => (props.attachmentIds || []).map((id) => state.attachments[id]),
    shallowEqual,
  );

  const dispatch = useDispatch();
  const doShowMedia = useCallback((...args) => dispatch(showMedia(...args)), [dispatch]);

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
        showMedia={doShowMedia}
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
}
