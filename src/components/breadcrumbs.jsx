import React from 'react';
import UserName from './user-name';

export default (props) => (
  <div>
    <UserName user={props.user} /> › {props.breadcrumb}
  </div>
);
