import { Link } from 'react-router';

import { MIN_DATE, MAX_DATE, pad, monthNames } from '../../utils/calendar-utils';

import styles from './calendar.module.scss';

function CalendarHeaderNav(props) {
  const { username, year, month } = props;

  const yearAsInt = parseInt(year, 10);
  const monthAsInt = parseInt(month, 10) || 1; // 1-indexed

  let prevDate, prevLink, prevLabel, thisDate, thisLabel, nextDate, nextLink, nextLabel;

  if (month) {
    // navigating months
    thisDate = new Date(yearAsInt, monthAsInt - 1, 1);
    thisLabel = `${monthNames[thisDate.getMonth()]} ${thisDate.getFullYear()}`;

    prevDate = new Date(yearAsInt, monthAsInt - 2, 1);
    prevLink = `/${username}/calendar/${prevDate.getFullYear()}/${pad(prevDate.getMonth() + 1)}`;
    prevLabel = `← ${monthNames[prevDate.getMonth()]} ${prevDate.getFullYear()}`;

    nextDate = new Date(yearAsInt, monthAsInt, 1);
    nextLink = `/${username}/calendar/${nextDate.getFullYear()}/${pad(nextDate.getMonth() + 1)}`;
    nextLabel = `${monthNames[nextDate.getMonth()]} ${nextDate.getFullYear()} →`;
  } else {
    // navigating years
    thisDate = new Date(yearAsInt, 0, 1);
    thisLabel = thisDate.getFullYear();

    prevDate = new Date(yearAsInt - 1, 0, 1);
    prevLink = `/${username}/calendar/${prevDate.getFullYear()}`;
    prevLabel = `← ${prevDate.getFullYear()}`;

    nextDate = new Date(yearAsInt + 1, 0, 1);
    nextLink = `/${username}/calendar/${nextDate.getFullYear()}`;
    nextLabel = `${nextDate.getFullYear()} →`;
  }

  const canShowPrevLink = prevDate >= MIN_DATE;
  const canShowNextLink = nextDate <= MAX_DATE;

  return (
    <div className={styles.calendarNav}>
      <span className={styles.prevDate}>
        {canShowPrevLink ? <Link to={prevLink}>{prevLabel}</Link> : prevLabel}
      </span>
      <strong className={styles.currentDate}>{thisLabel}</strong>
      <span className={styles.nextDate}>
        {canShowNextLink ? <Link to={nextLink}>{nextLabel}</Link> : nextLabel}
      </span>
    </div>
  );
}

export default CalendarHeaderNav;
