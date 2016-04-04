import React from 'react'

import {tileUserListFactory, PLAIN} from './tile-user-list'
const TileList = tileUserListFactory({type: PLAIN})

import throbber16 from 'assets/images/throbber-16.gif'

export default (props) => {
  const title = !props.isPending && props.title && props.displayQuantity ?
    props.title + ` (${(props.subs || []).length})` :
    props.title

  return (
    <div>
      {title ? (
        <h3>
          <span>{title}</span>
          {props.isPending ? (
            <span className="comment-throbber">
              <img width="16" height="16" src={throbber16}/>
            </span>
          ) : false}
        </h3>
      ) : false}

      {props.errorString ? (
        <span className="error-string">{props.errorString}</span>
      ) : false}

      <TileList users={props.subs}/>

      {(props.subs.length == 0) && !props.errorString && props.emptyString ? (
        <span>{props.emptyString}</span>
      ) : false}
    </div>
  )
}
