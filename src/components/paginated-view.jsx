import React from 'react';
import {connect} from 'react-redux';

import {bindRouteActions} from '../redux/route-actions';
import {getCurrentRouteName} from '../utils';
import PaginationLinks from './pagination-links';

const PaginatedView = props => (
  <div className='box-body'>
    {props.offset > 0 ? props.children ? <PaginationLinks {...props}/> : false : props.firstPageHead}
    {props.children}
    <PaginationLinks {...props}/>
  </div>
);

const mapStateToProps = (state, ownProps) => {
  const offset = +state.routing.locationBeforeTransitions.query.offset || 0;
  const routename = getCurrentRouteName(ownProps);
  return { offset, routename };
};

const mapDispatchToProps = dispatch => ({
  routingActions: bindRouteActions(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PaginatedView);
