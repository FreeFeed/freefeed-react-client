import React from 'react'
import ImageAttachment from './post-attachment-image'
import GeneralAttachment from './post-attachment-general'

export default (props) => {
  const attachments = props.attachments || []

  const imageAttachments = attachments
    .filter(attachment => attachment.mediaType === 'image')
    .map(attachment => (<ImageAttachment key={attachment.id} {...attachment}/>))

  const generalAttachments = attachments
    .filter(attachment => attachment.mediaType === 'general')
    .map(attachment => (<GeneralAttachment key={attachment.id} {...attachment}/>))

  return (
    <div className='attachments'>
      <div className='image-attachments'>
        {imageAttachments}
      </div>
      <div className='general-attachments'>
        {generalAttachments}
      </div>
    </div>
  )
}
