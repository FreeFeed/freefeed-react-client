import moment from 'moment'

export function fromNowOrNow(date) {
  var now = moment(date)

  if (Math.abs(moment().diff(now)) < 1000) { // 1000 milliseconds
    return 'just now'
  }

  return now.fromNow()
}
