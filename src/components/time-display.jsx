import EventEmitter from 'events';
import { connect } from 'react-redux';
import pt from 'prop-types';
import React from 'react';

import parseISO from 'date-fns/parseISO';
import toDate from 'date-fns/toDate';
import format from 'date-fns/format';
import addMilliseconds from 'date-fns/addMilliseconds';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import formatDistance from 'date-fns/formatDistance';

const datetimeFormat = 'MMM d, yyyy HH:mm';

class Ticker extends EventEmitter {
  tick = () => this.emit('tick');

  constructor(interval) {
    super();
    this.setMaxListeners(0);
    this.once('newListener', () => setInterval(this.tick, interval));
  }
}

const ticker = new Ticker(30000); // 30 sec

class TimeDisplay extends React.Component {
  static propTypes = {
    timeStamp: pt.oneOfType([
      pt.number.isRequired, // JS timestamp in ms
      pt.string.isRequired, // ISO date string
    ]),
    className: pt.string,
    timeAgoInTitle: pt.bool,
    showAbsTime: pt.bool,
    serverTimeAhead: pt.number.isRequired,
  };

  refresh = () => this.forceUpdate();

  componentDidMount() {
    ticker.addListener('tick', this.refresh);
  }

  componentWillUnmount() {
    ticker.removeListener('tick', this.refresh);
  }

  render() {
    const time =
      typeof this.props.timeStamp === 'number'
        ? toDate(this.props.timeStamp)
        : parseISO(this.props.timeStamp);
    const serverNow = addMilliseconds(new Date(), this.props.serverTimeAhead);
    const timeAgo =
      Math.abs(differenceInMilliseconds(serverNow, time)) < 1000
        ? 'just now'
        : `${formatDistance(time, serverNow)} ago`;
    const timeAbs = format(time, datetimeFormat);
    const timeISO = time.toISOString();

    const title = this.props.timeAgoInTitle || this.props.showAbsTime ? timeAgo : timeAbs;
    const contents = this.props.children || (this.props.showAbsTime && timeAbs) || timeAgo;
    // const contents = this.props.children ? this.props.children : this.props.showAbsTime ? format(time, datetimeFormat) : timeAgo;

    return (
      <time className={this.props.className} dateTime={timeISO} title={title}>
        {contents}
      </time>
    );
  }
}

export default connect(({ serverTimeAhead }) => ({ serverTimeAhead }))(TimeDisplay);
