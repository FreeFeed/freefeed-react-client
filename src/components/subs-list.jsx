import React from 'react';

import {tileUserListFactory, PLAIN} from './tile-user-list';
const TileList = tileUserListFactory({type: PLAIN});

import throbber16 from 'assets/images/throbber-16.gif';

export default (props) => {

  const title = props.title || "No title";  
  
  if (props.isPending) {
    
    return (
      <div>
        <h3>
          <span>{title} </span>
          <span className="comment-throbber">
            <img width="16" height="16" src={throbber16}/>
          </span>
        </h3>
      </div>
    );
    
  } else if (props.errorString) {
    
    return (
      <div>
        <h3><span>{title}</span></h3>
        <span className="error-string">{props.errorString}</span>
      </div>
    );
    
  } else {
    
    const users = [];
    const groups = [];
    
    props.users.forEach(u => ((u.type === "user") ? users : groups).push(u));
    
    const showTitles = (users.length !== 0 && groups.length !== 0); 
    
    return (
      <div>
        <h3><span>{title}</span></h3>
        
        {showTitles ? <h4 className="tile-list-subheader">Users</h4> : false}
        <TileList users={users}/>

        {showTitles ? <h4 className="tile-list-subheader">Groups</h4> : false}
        <TileList users={groups}/>
      </div>
    );
    
  }
};
