import React from 'react';
import ImageAttachmentsContainer from './post-attachment-image-container';
import AudioAttachment from './post-attachment-audio';
import GeneralAttachment from './post-attachment-general';

export default (props) => {
  const attachments = props.attachments || [];

  const imageAttachmentsContainer = (
    <ImageAttachmentsContainer
      isEditing={props.isEditing}
      isSinglePost={props.isSinglePost}
      removeAttachment={props.removeAttachment}
      attachments={attachments.filter(a => a.mediaType === 'image')}
      postId={props.postId}
      />
  );

  const audioAttachments = attachments
    .filter(attachment => attachment.mediaType === 'audio')
    .map(attachment => (
      <AudioAttachment
        key={attachment.id}
        isEditing={props.isEditing}
        removeAttachment={props.removeAttachment}
        {...attachment}/>
    ));

  const generalAttachments = attachments
    .filter(attachment => attachment.mediaType === 'general')
    .map(attachment => (
      <GeneralAttachment
        key={attachment.id}
        isEditing={props.isEditing}
        removeAttachment={props.removeAttachment}
        {...attachment}/>
    ));

  return (attachments.length > 0 ? (
    <div className="attachments">
      {imageAttachmentsContainer}
      <div className="audio-attachments">
        {audioAttachments}
      </div>
      <div className="general-attachments">
        {generalAttachments}
      </div>
    </div>
  ) : <div/>);
};
