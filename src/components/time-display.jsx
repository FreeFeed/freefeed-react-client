import EventEmitter from 'events';
import { useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import pt from 'prop-types';

import parseISO from 'date-fns/parseISO';
import toDate from 'date-fns/toDate';
import format from 'date-fns/format';
import addMilliseconds from 'date-fns/addMilliseconds';
import differenceInMinutes from 'date-fns/differenceInMinutes';
import differenceInDays from 'date-fns/differenceInDays';
import startOfDay from 'date-fns/startOfDay';

import { useBool } from './hooks/bool';
import { withListener } from './hooks/sub-unsub';

const datetimeFormat = 'MMM d, yyyy HH:mm';
const datetimeFormatAmPm = 'MMM d, yyyy hh:mm a';
const dateOnlyFormat = 'MMM d, yyyy';

class Ticker extends EventEmitter {
  tick = () => this.emit('tick');

  constructor(interval) {
    super();
    this.setMaxListeners(0);
    this.once('newListener', () => setInterval(this.tick, interval));
    // Redraw all timers when document becomes visible
    typeof document !== 'undefined' &&
      document.addEventListener('visibilitychange', () => !document.hidden && this.tick());
  }
}

const ticker = new Ticker(30000); // 30 sec

const TimeDisplay = memo(function TimeDisplay({
  timeStamp,
  className,
  absolute,
  amPm,
  inline = false,
  dateOnly = false,
  children,
}) {
  const serverTimeAhead = useSelector((state) => state.serverTimeAhead);
  const prefsAmPm = useSelector((state) => state.user.frontendPreferences.timeDisplay.amPm);
  const prefsAbsolute = useSelector((state) => state.user.frontendPreferences.timeDisplay.absolute);
  const [, refresh] = useBool();

  useEffect(() => withListener(ticker, 'tick', refresh));

  const showAmPm = typeof amPm === 'boolean' ? amPm : prefsAmPm;
  const showAbsolute = typeof absolute === 'boolean' ? absolute : prefsAbsolute;

  const time = typeof timeStamp === 'number' ? toDate(timeStamp) : parseISO(timeStamp);
  const serverNow = addMilliseconds(new Date(), serverTimeAhead);
  const timeRel = formatDistance(time, serverNow, { inline, amPm: showAmPm });
  const timeAbs = format(
    time,
    dateOnly ? dateOnlyFormat : showAmPm ? datetimeFormatAmPm : datetimeFormat,
  );
  const timeISO = time.toISOString();

  return (
    <time className={className} dateTime={timeISO} title={showAbsolute ? timeRel : timeAbs}>
      {children || (showAbsolute ? timeAbs : timeRel)}
    </time>
  );
});

TimeDisplay.propTypes = {
  timeStamp: pt.oneOfType([
    pt.number.isRequired, // JS timestamp in ms
    pt.string.isRequired, // ISO date string
  ]),
  className: pt.string,
  absolute: pt.bool,
  amPm: pt.bool,
  inline: pt.bool,
  dateOnly: pt.bool,
};

export default TimeDisplay;

/**
 * Date difference formatter
 */
export function formatDistance(date, now = new Date(), { amPm = false, inline = false } = {}) {
  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) {
    return inline ? 'just now' : 'Just now';
  }
  if (minutes < 60) {
    return `${Math.floor(minutes)} ${inline ? 'min' : 'minutes'} ago`;
  }
  if (minutes < 1.5 * 60) {
    return `1 hour ago`;
  }
  if (minutes < 2 * 60) {
    return `1.5 hours ago`;
  }
  if (minutes < 4 * 60) {
    return `${Math.floor(minutes / 60)} hours ago`;
  }

  const dateNoon = startOfDay(date);
  const days = differenceInDays(now, dateNoon);

  if (days <= 1) {
    const prefix = do {
      if (days === 1) {
        inline ? 'yest. ' : 'Yesterday at ';
      } else {
        inline ? 'today ' : 'Today at ';
      }
    };
    return prefix + format(date, amPm ? 'h:mm aaaa' : 'H:mm');
  }
  if (days < 4) {
    return `${days} days ago`;
  }
  if (now.getFullYear() === date.getFullYear()) {
    return format(date, 'LLL d');
  }
  return format(date, 'LLL d, y');
}
