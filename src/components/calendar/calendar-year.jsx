import { connect } from 'react-redux';

import { Throbber } from '../throbber';
import CalendarHeaderNav from './calendar-header-nav';
import MonthDaysGrid from './month-days-grid';

import styles from './calendar.module.scss';

function CalendarYear(props) {
  const {
    isLoading,
    calendarDaysMap,
    params: { userName, year },
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

  const yearAsInt = parseInt(year, 10);

  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        Calendar{' '}
        {isLoading && (
          <span className="throbber">
            <Throbber />
          </span>
        )}
      </div>
      <div className="box-body" style={{ marginTop: '1em' }}>
        <CalendarHeaderNav username={userName} year={year} />

        {calendarDaysMap ? (
          <div className={styles.monthsGrid}>
            {[...Array(12)].map((_, m) => {
              return (
                <MonthDaysGrid
                  key={m}
                  username={userName}
                  year={year}
                  month={m}
                  postCounts={calendarDaysMap}
                />
              );
            })}
          </div>
        ) : (
          false
        )}
      </div>
      <div className="box-footer" />
    </div>
  );
}

function selectState(state) {
  const { routeLoadingState: isLoading, calendarYearDays, authenticated, user } = state;

  const calendarDaysMap = {};
  if (calendarYearDays && calendarYearDays.days) {
    calendarYearDays.days.forEach((day) => {
      calendarDaysMap[day.date] = day.posts;
    });
  }
  return { isLoading, calendarYearDays, calendarDaysMap, authenticated, user };
}

export default connect(selectState)(CalendarYear);
