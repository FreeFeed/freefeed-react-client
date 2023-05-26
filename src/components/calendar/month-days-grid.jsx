import { Link } from 'react-router';
import cx from 'classnames';

import { pluralForm } from '../../utils';
import { pad, dayOfWeek, daysInMonth } from '../../utils/calendar-utils';

import { monthNames } from '../../utils/date-format';
import styles from './calendar.module.scss';

export default function MonthDaysGrid(props) {
  const { username, year, month, postCounts, withCounts, hideMonthName, className, ...other } =
    props;

  const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d, i) => (
    <span key={i} className={styles.day}>
      {d}
    </span>
  ));

  const days = [...Array(daysInMonth(year, month))].map((_, i) => i + 1);
  const firstDayOfWeek = dayOfWeek(year, month, 1);
  const mm = pad(month + 1);

  return (
    <div
      className={cx(styles.month, withCounts ? styles.monthWithPostCounts : false, className)}
      {...other}
    >
      {hideMonthName ? null : (
        <div className={styles.monthName}>
          <Link to={`/${username}/calendar/${year}/${mm}`}>{monthNames[month]}</Link>
        </div>
      )}
      <div className={styles.weekDays}>{weekdays}</div>
      <div className={styles.monthDays}>
        {days.map((d) => {
          const dd = pad(d);
          const dayId = `${year}-${mm}-${dd}`;
          const postsOnThisDay = postCounts[dayId] || 0;

          return (
            <span
              key={dayId}
              className={cx(styles.day, d === 1 ? styles[`dayOffset${firstDayOfWeek}`] : false)}
            >
              {postsOnThisDay ? (
                <Link
                  to={`/${username}/calendar/${year}/${mm}/${dd}`}
                  className={styles.dayWithPosts}
                >
                  {d}
                  {withCounts ? (
                    <span className={styles.postCount}>{pluralForm(postsOnThisDay, 'post')}</span>
                  ) : null}
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
}
