import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { bindRouteActions } from '../redux/route-actions';
import { getCurrentRouteName } from '../utils';
import PaginationLinks from './pagination-links';
import ErrorBoundary from './error-boundary';

const PaginatedView = (props) => {
  const summaryDays = props.params && props.params.days ? parseInt(props.params.days) : 7;

  return (
    <div className="box-body">
      <ErrorBoundary>
        {props.showSummaryHeader ? (
          <h4 className="user-subheader">
            {props.boxHeader.title}
            <div className="user-subheader-sidelinks">
              {'View best of: '}
              {summaryDays === 1 ? (
                <b>day</b>
              ) : (
                <Link to={`/${props.viewUser.username}/summary/1`}>day</Link>
              )}
              {' - '}
              {summaryDays === 7 ? (
                <b>week</b>
              ) : (
                <Link to={`/${props.viewUser.username}/summary/7`}>week</Link>
              )}
              {' - '}
              {summaryDays === 30 ? (
                <b>month</b>
              ) : (
                <Link to={`/${props.viewUser.username}/summary/30`}>month</Link>
              )}
            </div>
          </h4>
        ) : props.offset > 0 ? (
          props.children ? (
            <PaginationLinks
              location={props.location}
              offset={props.offset}
              isLastPage={props.isLastPage}
            />
          ) : (
            false
          )
        ) : (
          props.firstPageHead
        )}
        {props.children}
        <PaginationLinks
          location={props.location}
          offset={props.offset}
          isLastPage={props.isLastPage}
        />
      </ErrorBoundary>
    </div>
  );
};

const mapStateToProps = (state, ownProps) => {
  const offset = +state.routing.locationBeforeTransitions.query.offset || 0;
  const routename = getCurrentRouteName(ownProps);
  const { isLastPage } = state.feedViewState;
  return { offset, routename, isLastPage };
};

const mapDispatchToProps = (dispatch) => ({ routingActions: bindRouteActions(dispatch) });

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PaginatedView);
