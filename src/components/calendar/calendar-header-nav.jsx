import { Link } from 'react-router';

import { MIN_DATE, MAX_DATE, pad, monthNames } from '../../utils/calendar-utils';

import styles from './calendar.module.scss';

function getDateLink(date, mode) {
  const bits = [date.getFullYear()];
  if (mode !== 'year') {
    bits.push(pad(date.getMonth() + 1));
  }
  if (mode === 'day') {
    bits.push(pad(date.getDate()));
  }
  return bits.join('/');
}

function getDateLabel(date, mode) {
  const bits = [date.getFullYear()];
  if (mode !== 'year') {
    bits.push(monthNames[date.getMonth()]);
  }
  if (mode === 'day') {
    bits.push(pad(date.getDate()));
  }
  return bits.reverse().join(' ');
}

function parseDateString(string) {
  const [yyyy, mm, dd] = string.split('-');
  return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
}

function CalendarHeaderNav(props) {
  const {
    username,
    mode,
    currentDate: currentDateString,
    nextDate: nextDateString,
    previousDate: previousDateString,
  } = props;

  const currentDate = parseDateString(currentDateString);
  const nextDate = nextDateString ? parseDateString(nextDateString) : null;
  const previousDate = previousDateString ? parseDateString(previousDateString) : null;

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
