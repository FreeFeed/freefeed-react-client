import React from 'react'
import {connect} from 'react-redux'
import {bindRouteActions} from '../redux/route-actions'
import PaginationLinks from './pagination-links'

const PaginatedView = props => (
  <div className='box-body'>
    {props.pageHead}
    {props.offset > 0 ? props.children ? <PaginationLinks {...props}/> : false : props.firstPageHead}
    {props.children}
    <PaginationLinks {...props}/>
  </div>
)

const mapStateToProps = state => {
  const offset = (+state.router.location.query.offset || 0)
  const routename = state.router.routes[state.router.routes.length - 1].name
  const router = state.router
  return { offset, routename, router}
}

const mapDispatchToProps = dispatch => ({
  routingActions: bindRouteActions(dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(PaginatedView)
