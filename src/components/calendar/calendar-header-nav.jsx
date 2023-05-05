import { Link } from 'react-router';
import parse from 'date-fns/parse';
import format from 'date-fns/format';

import { MAX_DATE } from '../../utils/calendar-utils';

import styles from './calendar.module.scss';

function getDateLink(date, mode) {
  return format(date, mode === 'year' ? 'yyyy' : mode === 'month' ? 'yyyy/MM' : 'yyyy/MM/dd');
}

function getDateLabel(date, mode) {
  return format(date, mode === 'year' ? 'yyyy' : mode === 'month' ? 'MMMM yyyy' : 'd MMMM yyyy');
}

function parseDateString(string) {
  return parse(string, 'yyyy-MM-dd', new Date());
}

function CalendarHeaderNav(props) {
  const {
    username,
    mode,
    currentDate: currentDateString,
    nextDate: nextDateString,
    previousDate: previousDateString,
    createdAt,
  } = props;

  const createdAtDate = new Date(Number(createdAt));
  const minYear = createdAtDate.getFullYear();
  const MIN_DATE = new Date(minYear, 0, 1);

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
