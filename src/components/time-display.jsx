import EventEmitter from 'events';
import { connect } from 'react-redux';
import pt from 'prop-types';
import React from 'react';
import moment from 'moment';

import { datetimeFormat } from '../utils/get-date-from-short-string';


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
    timeStamp:       pt.oneOfType([pt.number.isRequired, pt.string.isRequired]),
    className:       pt.string,
    timeAgoInTitle:  pt.bool,
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
    const time = moment(this.props.timeStamp);
    const serverNow = moment().add(this.props.serverTimeAhead);
    const timeAgo = Math.abs(serverNow.diff(time)) < 1000 ? 'just now' : time.from(serverNow);
    const timeISO = time.format();

    const title = this.props.timeAgoInTitle ? timeAgo : time.format(datetimeFormat);
    const contents = this.props.children ? this.props.children : timeAgo;

    return (
      <time className={this.props.className} dateTime={timeISO} title={title}>{contents}</time>
    );
  }
}

export default connect(({ serverTimeAhead }) => ({ serverTimeAhead }))(TimeDisplay);
