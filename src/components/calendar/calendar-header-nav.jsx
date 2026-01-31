import { Link } from '../../services/nouter';

import { MIN_DATE, MAX_DATE } from '../../utils/calendar-utils';

import { format } from '../../utils/date-format';
import styles from './calendar.module.scss';

function getDateLink(date, mode) {
  return format(date, mode === 'year' ? 'yyyy' : mode === 'month' ? 'yyyy/MM' : 'yyyy/MM/dd');
}

function getDateLabel(date, mode) {
  return format(date, mode === 'year' ? 'yyyy' : mode === 'month' ? 'MMMM yyyy' : 'd MMMM yyyy');
}

function CalendarHeaderNav(props) {
  const {
    username,
    mode,
    currentDate: currentDateString,
    nextDate: nextDateString,
    previousDate: previousDateString,
  } = props;

  const currentDate = new Date(currentDateString);
  const nextDate = nextDateString ? new Date(nextDateString) : null;
  const previousDate = previousDateString ? new Date(previousDateString) : null;

  const canShowPrevLink = previousDate && previousDate >= MIN_DATE;
  const canShowNextLink = nextDate && nextDate <= MAX_DATE;

  return (
    <div className={styles.calendarNav}>
      <span className={styles.prevDate}>
        {canShowPrevLink ? (
          <Link to={`/${username}/calendar/${getDateLink(previousDate, mode)}`}>
            ← {getDateLabel(previousDate, mode)}
          </Link>
        ) : null}
      </span>
      <strong className={styles.currentDate}>{getDateLabel(currentDate, mode)}</strong>
      <span className={styles.nextDate}>
        {canShowNextLink ? (
          <Link to={`/${username}/calendar/${getDateLink(nextDate, mode)}`}>
            {getDateLabel(nextDate, mode)} →
          </Link>
        ) : null}
      </span>
    </div>
  );
}

export default CalendarHeaderNav;
