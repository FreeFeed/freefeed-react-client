import React from 'react'

import {tileUserListFactory, PLAIN} from './tile-user-list'
const TileList = tileUserListFactory({type: PLAIN})

import throbber16 from 'assets/images/throbber-16.gif'

export default (props) => {
  return (
    <div>
      {props.title ? (
        <h3>
          <span>{props.title} </span>
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

      <TileList users={props.users}/>
    </div>
  )
}
