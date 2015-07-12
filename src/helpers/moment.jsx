import moment from 'moment';

export function fromNowOrNow(date) {
  var mmnt = moment(date)

  if (Math.abs(moment().diff(mmnt)) < 1000) { // 1000 milliseconds
    return 'just now';
  }

  return mmnt.fromNow();
}
