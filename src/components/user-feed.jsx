import React from 'react';
import {Link} from 'react-router';

import PaginatedView from './paginated-view';
import Feed from './feed';

export default props => (
  <div>
    {props.viewUser.blocked ? (
      <div className="box-body">
        <p>You have blocked <b>{props.viewUser.screenName}</b>, so all of their posts and comments are invisible to you.</p>
        <p><a onClick={()=>props.userActions.unban({username: props.viewUser.username, id: props.viewUser.id})}>Un-block</a></p>
      </div>
    ) : props.viewUser.isPrivate === '1' && !props.viewUser.subscribed && !props.viewUser.isItMe ? (
      <div className="box-body">
        <p><b>{props.viewUser.screenName}</b> has a private feed.</p>
      </div>
    ) : (
      <PaginatedView {...props}>
        <Feed {...props} isInUserFeed={true}/>
      </PaginatedView>
    )}
  </div>
);
