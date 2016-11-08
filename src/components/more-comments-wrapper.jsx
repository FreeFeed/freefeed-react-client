import React from 'react';

import throbber16 from '../../assets/images/throbber-16.gif';
import {preventDefault} from '../utils';

export default (props) => (
  <div className="comment more-comments-wrapper">
    <span className="more-comments-throbber">
      {props.isLoading ? (
        <img width="16" height="16" src={throbber16}/>
      ) : false}
    </span>
    <a className="more-comments-link"
       href={props.entryUrl}
       onClick={preventDefault(()=>props.showMoreComments())}>
      {`${props.omittedComments}`} more comments
    </a>
  </div>
);
