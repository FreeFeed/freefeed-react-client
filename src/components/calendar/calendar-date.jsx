import { Link } from 'react-router';
import { connect } from 'react-redux';

import { joinPostData, postActions } from '../select-utils';
import { Throbber } from '../throbber';
import Feed from '../feed';
import PaginatedView from '../paginated-view';

function CalendarYear(props) {
  const {
    isLoading,
    params: { userName, year, mmdd },
    authenticated,
    user,
  } = props;

  if (!authenticated || !user || user.username !== userName) {
    return (
      <div className="box">
        <div className="box-header-timeline" role="heading">
          Calendar
        </div>
        <div className="box-body" style={{ marginTop: '1em' }}>
          <p className="alert alert-danger" role="alert">
            You cannot access this page
          </p>
        </div>
      </div>
    );
  }

  const month = parseInt(mmdd.slice(0, 2), 10) - 1;
  const day = parseInt(mmdd.slice(2, 4), 10);
  const thisDate = new Date(year, month, day);

  const readableDate = thisDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        {readableDate}{' '}
        {isLoading && (
          <span className="throbber">
            <Throbber />
          </span>
        )}
        <div className="sidelinks">
          <Link to={`/${userName}/calendar/${year}`}>Back to {year}</Link>
        </div>
      </div>

      <div className="box-body">
        <PaginatedView {...props}>
          <Feed {...props} />
        </PaginatedView>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { routeLoadingState: isLoading, authenticated, user, routing, feedViewState } = state;
  const location = routing.locationBeforeTransitions;
  const offset = +location.query.offset || 0;
  const { isLastPage } = feedViewState;
  const entries = feedViewState.entries.map(joinPostData(state));

  console.log('state', state);

  return { isLoading, user, authenticated, entries, location, offset, isLastPage };
}

function mapActionsToDispatch(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(mapStateToProps, mapActionsToDispatch)(CalendarYear);
