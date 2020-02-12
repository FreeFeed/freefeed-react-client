import EventEmitter from 'events';
import React, { useEffect, memo } from 'react';
import { useSelector } from 'react-redux';
import pt from 'prop-types';

import parseISO from 'date-fns/parseISO';
import toDate from 'date-fns/toDate';
import format from 'date-fns/format';
import addMilliseconds from 'date-fns/addMilliseconds';
import formatDistance from 'date-fns/formatDistance';
import { useBool } from './hooks/bool';
import { withListener } from './hooks/sub-unsub';

const datetimeFormat = 'MMM d, yyyy HH:mm';
const dateOnlyFormat = 'MMM d, yyyy';

class Ticker extends EventEmitter {
  tick = () => this.emit('tick');

  constructor(interval) {
    super();
    this.setMaxListeners(0);
    this.once('newListener', () => setInterval(this.tick, interval));
  }
}

const ticker = new Ticker(30000); // 30 sec

const TimeDisplay = memo(function TimeDisplay({
  timeStamp,
  className,
  timeAgoInTitle = false,
  showAbsTime = false,
  showDateOnly = false,
  children,
}) {
  const serverTimeAhead = useSelector((state) => state.serverTimeAhead);
  const [, refresh] = useBool();

  useEffect(() => withListener(ticker, 'tick', refresh));

  const time = typeof timeStamp === 'number' ? toDate(timeStamp) : parseISO(timeStamp);
  const serverNow = addMilliseconds(new Date(), serverTimeAhead);
  let timeAgo = `${formatDistance(time, serverNow)} ago`;
  if (timeAgo === 'less than a minute ago') {
    timeAgo = 'just now';
  }
  const timeAbs = format(time, showDateOnly ? dateOnlyFormat : datetimeFormat);
  const timeISO = time.toISOString();

  const title = timeAgoInTitle || showAbsTime ? timeAgo : timeAbs;
  const contents = children || (showAbsTime && timeAbs) || timeAgo;

  return (
    <time className={className} dateTime={timeISO} title={title}>
      {contents}
    </time>
  );
});

TimeDisplay.propTypes = {
  timeStamp: pt.oneOfType([
    pt.number.isRequired, // JS timestamp in ms
    pt.string.isRequired, // ISO date string
  ]),
  className: pt.string,
  timeAgoInTitle: pt.bool,
  showAbsTime: pt.bool,
  showDateOnly: pt.bool,
};

export default TimeDisplay;
