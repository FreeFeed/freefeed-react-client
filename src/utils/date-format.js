import { isValid, lightFormat, toDate } from 'date-fns';

export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * This function extends date-fns'es 'lightFormat' by the following tokens,
 * taken from full 'format' and acting as in 'en-US' locale:
 * - EEE/eee/ccc     (Mon, Tue, Wed, ..., Sun)
 * - EEEE/eeee/cccc  (Monday, Tuesday, ..., Sunday)
 * - MMM/LLL    (Jan, Feb, ..., Dec)
 * - MMMM/LLLL  (January, February, ..., December)
 * - do         (1st, 2nd, ..., 31st)
 *
 * @see https://date-fns.org/v2.30.0/docs/lightFormat
 * @see https://date-fns.org/v2.30.0/docs/format
 *
 * @param {Date | number} date
 * @param {string} pattern
 * @returns {string}
 */
export function format(date, pattern) {
  if (!pattern) {
    return '';
  }

  date = toDate(date);
  if (!isValid(date)) {
    throw new RangeError('Invalid time value');
  }

  /**
   * A variant of the regexp that is used in the original 'format' function to
   * parse the format string.
   *
   * @see
   * https://github.com/date-fns/date-fns/blob/v2.30.0/src/format/index.ts#L36
   */
  const formattingTokensRegExp = /do|(\w)\1*|''|'(''|[^'])+('|$)|./g;
  const tokens = pattern.match(formattingTokensRegExp).map((token) => {
    switch (token) {
      case 'MMM':
      case 'MMMM':
      case 'LLL':
      case 'LLLL': {
        let m = monthNames[date.getMonth()];
        if (token.length === 3) {
          m = m.slice(0, 3);
        }
        return `'${m}'`;
      }
      case 'EEE':
      case 'EEEE':
      case 'eee':
      case 'eeee':
      case 'ccc':
      case 'cccc': {
        let m = weekDays[date.getDay()];
        if (token.length === 3) {
          m = m.slice(0, 3);
        }
        return `'${m}'`;
      }
      case 'do': {
        const d = ordinal(date.getDate());
        return `'${d}'`;
      }
      default:
        return token;
    }
  });

  return lightFormat(date, tokens.join(''));
}

/**
 * @param {number} x
 * @returns {string}
 */
function ordinal(x) {
  if (x > 3 && x < 21) {
    return `${x}th`;
  }
  switch (x % 10) {
    case 1:
      return `${x}st`;
    case 2:
      return `${x}nd`;
    case 3:
      return `${x}rd`;
    default:
      return `${x}th`;
  }
}
