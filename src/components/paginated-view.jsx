import { connect } from 'react-redux';
import { Link, withNouter } from '../services/nouter';

import { bindRouteActions } from '../redux/route-actions';
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
  const { location, params, name: routename } = ownProps.router;
  const offset = +location.query.offset || 0;
  const { isLastPage } = state.feedViewState;
  return { location, params, offset, routename, isLastPage };
};

const mapDispatchToProps = (dispatch) => ({ routingActions: bindRouteActions(dispatch) });

export default withNouter(connect(mapStateToProps, mapDispatchToProps)(PaginatedView));
