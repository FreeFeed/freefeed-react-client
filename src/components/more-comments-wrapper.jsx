import React from 'react'

import {preventDefault} from '../utils'

export default (props) => (
  <div className="more-comments-wrapper">
    <a className="more-comments" onClick={preventDefault(()=>props.showMoreComments())}>
      {`${props.omittedComments}`} more comments
    </a>
  </div>
)
