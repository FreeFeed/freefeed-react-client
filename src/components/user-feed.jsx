import React from 'react'
import {Link} from 'react-router'

import PaginatedView from './paginated-view'
import Feed from './feed'

export default props => (
  <div>
    {props.viewUser.blocked ? (
      false
    ) : (
      <PaginatedView>
        <Feed {...props} isInUserFeed={true}/>
      </PaginatedView>
    )}
  </div>
)
