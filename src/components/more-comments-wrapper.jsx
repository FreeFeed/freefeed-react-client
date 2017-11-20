import React from 'react';

import throbber16 from '../../assets/images/throbber-16.gif';
import { preventDefault } from '../utils';

export default (props) => (
  <div className="comment more-comments-wrapper">
    <span className="more-comments-throbber">
      {props.isLoading ? (
        <img width="16" height="16" src={throbber16}/>
      ) : false}
    </span>
    <a className="more-comments-link"
      href={props.entryUrl}
      onClick={preventDefault(() => props.showMoreComments())}>
      {getText(props)}
    </a>
  </div>
);

function getText({ omittedComments, omittedCommentLikes }) {
  const ommitedLikes = omittedCommentLikes > 0 ? ` with ${omittedCommentLikes} like${plural(omittedCommentLikes)}` : "";
  return `${omittedComments} more comment${plural(omittedComments)}${ommitedLikes}`;
}

function plural(count) {
  return count > 1 ? "s" : "";
}
