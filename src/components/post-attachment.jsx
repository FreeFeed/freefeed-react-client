import React from 'react'

export default (props) => {
  return (
    <div className='attachment'>
      <a href={props.url} target="_blank">
        {props.thumbnailUrl ? (
          <img src={props.thumbnailUrl} />
        ) : (
          props.id
        )}
      </a>
    </div>
  )
}
