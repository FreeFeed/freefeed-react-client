import { Link } from 'react-router';
import { connect } from 'react-redux';

import { Throbber } from '../throbber';
import CalendarHeaderNav from './calendar-header-nav';
import MonthDaysGrid from './month-days-grid';

import styles from './calendar.module.scss';

function CalendarMonth(props) {
  const {
    isLoading,
    calendarDaysMap,
    calendarMonthDays,
    params: { userName, year, month },
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

  const monthAsInt = parseInt(month, 10);

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        Calendar{' '}
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
          mode="month"
          currentDate={`${year}-${month}-01`}
          previousDate={calendarMonthDays?.previousDay}
          nextDate={calendarMonthDays?.nextDay}
        />

        {calendarDaysMap ? (
          <MonthDaysGrid
            username={userName}
            year={year}
            month={monthAsInt - 1}
            postCounts={calendarDaysMap}
            hideMonthName
            withCounts
            className={styles.singleMonth}
          />
        ) : (
          false
        )}
      </div>
      <div className="box-footer" />
    </div>
  );
}

function selectState(state) {
  const { routeLoadingState: isLoading, calendarMonthDays, authenticated, user } = state;

  const calendarDaysMap = {};
  if (calendarMonthDays && calendarMonthDays.days) {
    calendarMonthDays.days.forEach((day) => {
      calendarDaysMap[day.date] = day.posts;
    });
  }
  return { isLoading, calendarMonthDays, calendarDaysMap, authenticated, user };
}

export default connect(selectState)(CalendarMonth);
