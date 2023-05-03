import { Link } from 'react-router';
import { connect } from 'react-redux';

import { joinPostData, postActions } from '../select-utils';
import { Throbber } from '../throbber';
import Feed from '../feed';
import PaginatedView from '../paginated-view';
import CalendarHeaderNav from './calendar-header-nav';

function CalendarYear(props) {
  const {
    isLoading,
    params: { userName, year, month, day },
    authenticated,
    user,
    nextDay,
    previousDay,
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

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        Calendar
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
        <CalendarHeaderNav
          username={userName}
          currentDate={`${year}-${month}-${day}`}
          mode="day"
          previousDate={previousDay}
          nextDate={nextDay}
        />
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
  const { isLastPage, nextDay, previousDay } = feedViewState;
  const entries = feedViewState.entries.map(joinPostData(state));

  return {
    isLoading,
    user,
    authenticated,
    entries,
    location,
    offset,
    isLastPage,
    nextDay,
    previousDay,
  };
}

function mapActionsToDispatch(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(mapStateToProps, mapActionsToDispatch)(CalendarYear);
