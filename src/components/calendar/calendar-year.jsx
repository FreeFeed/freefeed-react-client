import { Link } from 'react-router';
import { connect } from 'react-redux';
import cx from 'classnames';

import { Throbber } from '../throbber';

import styles from './calendar.module.scss';

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const dayOfWeek = (year, month, day) => new Date(year, month, day).getDay();

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

  const FRIENDFEED_LAUNCH_YEAR = 2007;
  const thisYear = new Date().getFullYear();

  const yearAsInt = parseInt(year, 10);
  const prevYear = yearAsInt - 1;
  const nextYear = yearAsInt + 1;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

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
        <div className={styles.yearNav}>
          {prevYear >= FRIENDFEED_LAUNCH_YEAR ? (
            <Link to={`/${userName}/calendar/${prevYear}`}>&larr; {prevYear}</Link>
          ) : (
            <span>&larr; {prevYear}</span>
          )}
          <strong className={styles.currentYear}>{year}</strong>
          {nextYear <= thisYear ? (
            <Link to={`/${userName}/calendar/${nextYear}`}>{nextYear} &rarr;</Link>
          ) : (
            <span>{nextYear} &rarr;</span>
          )}
        </div>

        {calendarDaysMap ? (
          <div className={styles.monthsGrid}>
            {[...Array(12)].map((_, m) => {
              const days = [...Array(daysInMonth(year, m))].map((_, i) => i + 1);
              const firstDayOfWeek = dayOfWeek(year, m, 1);

              return (
                <div key={m} className={styles.month}>
                  <div className={styles.monthName}>{monthNames[m]}</div>
                  <div className={styles.weekDays}>{weekdays}</div>
                  <div className={styles.monthDays}>
                    {days.map((d) => {
                      const mm = String(m + 1).padStart(2, '0');
                      const dd = String(d).padStart(2, '0');
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
                              to={`/${userName}/calendar/${year}/${mm}${dd}`}
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
