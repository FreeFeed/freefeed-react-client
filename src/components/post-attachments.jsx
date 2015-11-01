import React from 'react'
import ImageAttachment from './post-attachment-image'
import AudioAttachment from './post-attachment-audio'
import GeneralAttachment from './post-attachment-general'

export default (props) => {
  const attachments = props.attachments || []

  const imageAttachments = attachments
    .filter(attachment => attachment.mediaType === 'image')
    .map(attachment => (<ImageAttachment key={attachment.id} {...attachment}/>))

  const audioAttachments = attachments
    .filter(attachment => attachment.mediaType === 'audio')
    .map(attachment => (<AudioAttachment key={attachment.id} {...attachment}/>))

  const generalAttachments = attachments
    .filter(attachment => attachment.mediaType === 'general')
    .map(attachment => (<GeneralAttachment key={attachment.id} {...attachment}/>))

  return (
    <div className='attachments'>
      <div className='image-attachments'>
        {imageAttachments}
      </div>
      <div className='audio-attachments'>
        {audioAttachments}
      </div>
      <div className='general-attachments'>
        {generalAttachments}
      </div>
    </div>
  )
}
