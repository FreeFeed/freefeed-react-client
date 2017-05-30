import EventEmitter from 'events';
import React, {PropTypes as pt} from 'react';
import moment from 'moment';

class Ticker extends EventEmitter {
  tick = () => this.emit('tick');

  constructor(interval) {
    super();
    this.setMaxListeners(0);
    this.once('newListener', () => setInterval(this.tick, interval));
  }
}

const ticker = new Ticker(30000); // 30 sec

export default class TimeDisplay extends React.Component {
  static propTypes = {
    timeStamp: pt.oneOfType([pt.number.isRequired, pt.string.isRequired]),
    className: pt.string,
    timeAgoInTitle: pt.bool,
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
    const timeAgo = Math.abs(moment().diff(time)) < 1000 ? 'just now' : time.fromNow();
    const timeISO = time.format();

    const title = this.props.timeAgoInTitle ? timeAgo : time.format('lll');
    const contents = this.props.children ? this.props.children : timeAgo;

    return (
      <time className={this.props.className} dateTime={timeISO} title={title}>{contents}</time>
    );
  }
}
