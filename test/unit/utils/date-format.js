import { describe, expect, it } from 'vitest';
import { format } from '../../../src/utils/date-format';

describe('Date formatter', () => {
  const testData = [
    { date: '2023-01-02 03:04', pattern: 'yyyy-MM-dd HH:mm', result: '2023-01-02 03:04' },
    { date: '2023-01-02 03:04', pattern: 'MMMM do, yyyy', result: 'January 2nd, 2023' },
    { date: '2023-01-02 03:04', pattern: 'EEE, MMM do, yyyy', result: 'Mon, Jan 2nd, 2023' },
    {
      date: '2023-01-03 03:04',
      pattern: `'Captain', 'it''s' cccc`,
      result: `Captain, it's Tuesday`,
    },
  ];

  for (const { date, pattern, result } of testData) {
    it(`should format '${pattern}' as '${result}'`, () => {
      expect(format(new Date(date), pattern)).toBe(result);
    });
  }
});
