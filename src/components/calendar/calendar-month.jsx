import { Link } from 'react-router';
import { connect } from 'react-redux';
import cx from 'classnames';

import { pad, monthNames, dayOfWeek, daysInMonth } from '../../utils/calendar-utils';
import { pluralForm } from '../../utils';
import { Throbber } from '../throbber';
import CalendarHeaderNav from './calendar-header-nav';

import styles from './calendar.module.scss';

function CalendarMonth(props) {
  const {
    isLoading,
    calendarDaysMap,
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
  const mm = pad(monthAsInt);
  const monthName = monthNames[monthAsInt - 1];
  const days = [...Array(daysInMonth(year, monthAsInt - 1))].map((_, i) => i + 1);
  const firstDayOfWeek = dayOfWeek(year, monthAsInt - 1, 1);

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
      <div className="box-body" style={{ marginTop: '1em' }}>
        <CalendarHeaderNav username={userName} year={year} month={month} />

        {calendarDaysMap ? (
          <div className={styles.daysList}>
            {days.map((d) => {
              const dd = pad(d);
              const dayId = `${year}-${mm}-${dd}`;
              const postsOnThisDay = calendarDaysMap[dayId] || 0;

              return (
                <span key={d} className={styles.day}>
                  <span className={styles.dayName}>
                    {(d + firstDayOfWeek) % 7 === 1 ? 'Sunday, ' : ''} {d} {monthName}:
                  </span>
                  <span className={cx(styles.dayPosts, postsOnThisDay ? false : styles.emptyDay)}>
                    {postsOnThisDay ? (
                      <Link
                        to={`/${userName}/calendar/${year}/${mm}/${dd}`}
                        className={styles.dayWithPosts}
                      >
                        {pluralForm(postsOnThisDay, 'post')}
                      </Link>
                    ) : (
                      'no posts'
                    )}
                  </span>
                </span>
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
