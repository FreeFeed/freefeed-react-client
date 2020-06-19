import { describe, it } from 'mocha';
import expect from 'unexpected';
import { parseISO } from 'date-fns';

import { formatDistance } from '../../../src/components/time-display';

describe('<TimeDisplay>', () => {
  describe('formatDistance', () => {
    const testData = [
      {
        now: '2020-01-01T12:00',
        date: '2020-01-01T12:00',
        result: 'Just now',
        description: 'now',
      },
      {
        now: '2020-01-01T12:00',
        date: '2020-01-01T13:00',
        result: 'Just now',
        description: 'date in future',
      },
      {
        now: '2020-01-01T12:20',
        date: '2020-01-01T12:00',
        result: '20 minutes ago',
        description: 'after less than hour',
      },
      {
        now: '2020-01-01T12:59:59',
        date: '2020-01-01T12:00',
        result: '59 minutes ago',
        description: 'almost after hour',
      },
      {
        now: '2020-01-01T13:00:01',
        date: '2020-01-01T12:00',
        result: '1 hour ago',
        description: 'after 1 hour',
      },
      {
        now: '2020-01-01T15:34',
        date: '2020-01-01T12:00',
        result: '3 hours ago',
        description: 'after 3 hours',
      },
      {
        now: '2020-01-01T17:59:59',
        date: '2020-01-01T12:00',
        result: '5 hours ago',
        description: 'after 5 hours',
      },
      {
        now: '2020-01-01T18:00:00',
        date: '2020-01-01T12:00',
        result: 'Today at 12:00',
        description: 'after 6+ hours at same day',
      },
      {
        now: '2020-01-01T23:59:59',
        date: '2020-01-01T12:00',
        result: 'Today at 12:00',
        description: 'at the end of same day',
      },
      {
        now: '2020-01-02T00:00',
        date: '2020-01-01T12:00',
        result: 'Yesterday at 12:00',
        description: "at next day's midnight",
      },
      {
        now: '2020-01-02T14:00',
        date: '2020-01-01T12:00',
        result: 'Yesterday at 12:00',
        description: 'at next day',
      },
      {
        now: '2020-01-03T01:00',
        date: '2020-01-01T12:00',
        result: '2 days ago',
        description: 'day after tomorrow',
      },
      {
        now: '2020-01-04T23:59',
        date: '2020-01-01T12:00',
        result: '3 days ago',
        description: 'after almost 3 days',
      },
      {
        now: '2020-01-05T00:00',
        date: '2020-01-01T12:00',
        result: 'Jan 1',
        description: 'on the 4-th day',
      },
      {
        now: '2020-01-05T00:00',
        date: '2019-12-31T12:00',
        result: 'Dec 31, 2019',
        description: 'date in the past year',
      },
      {
        now: '2020-01-05T00:00',
        date: '2015-05-15T12:00',
        result: 'May 15, 2015',
        description: 'date in the distant past',
      },
      // AM/PM
      {
        now: '2020-01-01T18:00',
        date: '2020-01-01T12:00',
        result: 'Today at 12:00 p.m.',
        description: 'in 12:00 at same day (am/pm)',
        amPm: true,
      },
      {
        now: '2020-01-01T18:00',
        date: '2020-01-01T01:00',
        result: 'Today at 1:00 a.m.',
        description: 'in 01:00 at same day (am/pm)',
        amPm: true,
      },
      {
        now: '2020-01-01T18:00',
        date: '2020-01-01T00:10',
        result: 'Today at 12:10 a.m.',
        description: 'in 00:10 at same day (am/pm)',
        amPm: true,
      },
      // Inline
      {
        now: '2020-01-01T12:00',
        date: '2020-01-01T12:00',
        result: 'just now',
        description: 'now (inline)',
        inline: true,
      },
      {
        now: '2020-01-01T18:00',
        date: '2020-01-01T01:00',
        result: '1:00',
        description: 'in 01:00 at same day (inline)',
        inline: true,
      },
      {
        now: '2020-01-02T14:00',
        date: '2020-01-01T12:00',
        result: 'yest. 12:00',
        description: 'at next day (inline)',
        inline: true,
      },
    ];

    for (const { date, now, result, description, amPm = false, inline = false } of testData) {
      it(`should format ${description || result}`, () => {
        expect(formatDistance(parseISO(date), parseISO(now), { amPm, inline }), 'to be', result);
      });
    }
  });
});
