import { Link } from 'react-router';
import { connect } from 'react-redux';
import cx from 'classnames';

import { pad, monthNames, dayOfWeek, daysInMonth } from '../../utils/calendar-utils';
import { Throbber } from '../throbber';
import CalendarHeaderNav from './calendar-header-nav';

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

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d, i) => (
    <span key={i} className={styles.day}>
      {d}
    </span>
  ));

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
              const days = [...Array(daysInMonth(year, m))].map((_, i) => i + 1);
              const firstDayOfWeek = dayOfWeek(year, m, 1);
              const mm = pad(m + 1);

              return (
                <div key={m} className={styles.month}>
                  <div className={styles.monthName}>
                    <Link to={`/${userName}/calendar/${year}/${mm}`}>{monthNames[m]}</Link>
                  </div>
                  <div className={styles.weekDays}>{weekdays}</div>
                  <div className={styles.monthDays}>
                    {days.map((d) => {
                      const dd = pad(d);
                      const dayId = `${year}-${mm}-${dd}`;
                      const postsOnThisDay = calendarDaysMap[dayId] || 0;

                      return (
                        <span
                          key={d}
                          className={cx(
                            styles.day,
                            d === 1 ? styles[`dayOffset${firstDayOfWeek}`] : false,
                          )}
                        >
                          {postsOnThisDay ? (
                            <Link
                              to={`/${userName}/calendar/${year}/${mm}/${dd}`}
                              className={styles.dayWithPosts}
                            >
                              {d}
                            </Link>
                          ) : (
                            d
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
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
