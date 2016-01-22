import React from 'react'
import ImageAttachment from './post-attachment-image'
import AudioAttachment from './post-attachment-audio'
import GeneralAttachment from './post-attachment-general'

export default (props) => {
  const attachments = props.attachments || []

  const imageAttachments = attachments
    .filter(attachment => attachment.mediaType === 'image')
    .map(attachment => (
      <ImageAttachment
        key={attachment.id}
        isEditing={props.isEditing}
        removeAttachment={props.removeAttachment}
        {...attachment}/>
    ))

  const audioAttachments = attachments
    .filter(attachment => attachment.mediaType === 'audio')
    .map(attachment => (
      <AudioAttachment
        key={attachment.id}
        isEditing={props.isEditing}
        removeAttachment={props.removeAttachment}
        {...attachment}/>
    ))

  const generalAttachments = attachments
    .filter(attachment => attachment.mediaType === 'general')
    .map(attachment => (
      <GeneralAttachment
        key={attachment.id}
        isEditing={props.isEditing}
        removeAttachment={props.removeAttachment}
        {...attachment}/>
    ))

  return (attachments.length > 0 ? (
    <div className="attachments">
      <div className="image-attachments">
        {imageAttachments}
      </div>
      <div className="audio-attachments">
        {audioAttachments}
      </div>
      <div className="general-attachments">
        {generalAttachments}
      </div>
    </div>
  ) : <div/>)
}
