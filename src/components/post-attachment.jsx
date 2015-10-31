import React from 'react'
import numeral from 'numeral'

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b')
  const nameAndSize = props.fileName + ' (' + formattedFileSize + ')'

  const isImage = props.mediaType === 'image'
  const isGeneral = props.mediaType === 'general'

  return (
    <div className='attachment'>
      {isImage ? (
        <a href={props.url} title={nameAndSize} target="_blank">
          {props.thumbnailUrl ? (
            <img src={props.thumbnailUrl} alt={nameAndSize} />
          ) : (
            props.id
          )}
        </a>
      ) : false}

      {isGeneral ? (
        <a href={props.url} title={nameAndSize} target="_blank">
          <i className='fa fa-file-o'></i>
          <span>{nameAndSize}</span>
        </a>
      ) : false}
    </div>
  )
}
