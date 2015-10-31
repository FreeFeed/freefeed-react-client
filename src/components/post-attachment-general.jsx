import React from 'react'
import numeral from 'numeral'

export default (props) => {
  const formattedFileSize = numeral(props.fileSize).format('0.[0] b')
  const nameAndSize = props.fileName + ' (' + formattedFileSize + ')'

  return (
    <div className='attachment'>
      <a href={props.url} title={nameAndSize} target="_blank">
        <i className='fa fa-file-o'></i>
        <span>{nameAndSize}</span>
      </a>
    </div>
  )
}
