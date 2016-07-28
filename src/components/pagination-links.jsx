import React from 'react';
import {Link} from 'react-router';

const PAGE_SIZE = 30;

const offsetObject = offset => offset ? ({offset}) : undefined;
const minOffset = offset => Math.max(offset - PAGE_SIZE, 0);
const maxOffset = offset => offset + PAGE_SIZE;

export default props => {
  const {offset, ...allQuery} = props.location.query;
  return (
  <ul className="pager p-pagination-controls">
    {props.offset > 0 ?
      <li>
        <Link to={{pathname: props.location.pathname, query: {...allQuery, ...offsetObject(minOffset(props.offset))}}}
              className="p-pagination-newer">« Newer items</Link>
      </li>
      : false}
    <li>
      <Link to={{pathname: props.location.pathname, query: {...allQuery, ...offsetObject(maxOffset(props.offset))}}}
            className="p-pagination-older">Older items »</Link>
      </li>
  </ul>);
};
