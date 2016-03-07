import React from 'react'
import {Link} from 'react-router'

const PAGE_SIZE = 30

const offsetObject = offset => offset ? ({offset}) : undefined
const minOffset = offset => Math.max(offset - PAGE_SIZE, 0)
const maxOffset = offset => offset + PAGE_SIZE

//deep merge is deep indeed
const getNextRoute = (router, offset) => ({
  ...router,
  location: {
    ...router.location,
    query: {
      ...router.location.query,
      offset
    }
  }
})

const routingCallback = (props, offsetSelector) => _ => props.routingActions(props.routename)(getNextRoute(props, offsetSelector(props.offset)))

export default props => (
  <ul className="pager p-pagination-controls">
    {props.offset > 0 ?
      <li>
        <Link to={{pathname: props.location.pathname, query: offsetObject(minOffset(props.offset))}}
              onClick={routingCallback(props, minOffset)}
              className="p-pagination-newer">« Newer items</Link>
      </li>
      : false}
    <li>
      <Link to={{pathname: props.location.pathname, query: offsetObject(maxOffset(props.offset))}}
            onClick={routingCallback(props, maxOffset)}
            className="p-pagination-older">Older items »</Link>
      </li>
  </ul>
)
