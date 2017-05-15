import React from 'react';
import {connect} from 'react-redux';

import {bindRouteActions} from '../redux/route-actions';
import {getCurrentRouteName} from '../utils';
import PaginationLinks from './pagination-links';

const PaginatedView = props => (
  <div className='box-body'>
    {props.offset > 0
      ? props.children
        ? <PaginationLinks location={props.location} offset={props.offset} isLastPage={props.isLastPage}/>
        : false
      : props.firstPageHead}
    {props.children}
    <PaginationLinks location={props.location} offset={props.offset} isLastPage={props.isLastPage}/>
  </div>
);

const mapStateToProps = (state, ownProps) => {
  const offset = +state.routing.locationBeforeTransitions.query.offset || 0;
  const routename = getCurrentRouteName(ownProps);
  const isLastPage = state.feedViewState.isLastPage;
  return { offset, routename, isLastPage };
};

const mapDispatchToProps = dispatch => ({
  routingActions: bindRouteActions(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(PaginatedView);
