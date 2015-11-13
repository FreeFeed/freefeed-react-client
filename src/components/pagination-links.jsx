import React from 'react'
import {Link} from 'react-router'

const PAGE_SIZE = 30

const minOffset = offset => Math.max(offset - PAGE_SIZE,0)
const maxOffset = offset => offset + PAGE_SIZE
const offsetObject = offset => offset ? ({offset}) : {}

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

const routingCallback = ({offset, routename, router, routingActions}, offsetSelector) => _ => routingActions(routename)(getNextRoute(router, offsetSelector(offset)))

export default props => (
  <ul className="pager p-pagination-controls">
    {props.offset > 0 ?
      <li>
        <Link onClick={routingCallback(props, minOffset)}
              to={props.router.location.pathname}
              query={offsetObject(minOffset(props.offset))}
              className="p-pagination-newer">« Newer items</Link>
      </li>
      : false}
    <li>
      <Link to={props.router.location.pathname}
            onClick={routingCallback(props, maxOffset)}
            query={offsetObject(maxOffset(props.offset))}
            className="p-pagination-older">Older items »</Link>
      </li>
  </ul>
)
