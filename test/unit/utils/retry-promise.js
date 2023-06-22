import { describe, it, vi, afterEach, beforeEach, expect } from 'vitest';

import { retry as retryIt } from '../../../src/utils/retry-promise';

// Fixing the retry function arguments
const retry = (fn) => retryIt(fn, 5, 1000);

describe('retry', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.restoreAllMocks());

  it('should return first result if function succeeds', async () => {
    const fn = vi.fn(() => Promise.resolve(42));
    const retryFn = retry(fn);
    const result = await retryFn();
    expect(result).toBe(42);
    expect(fn).toBeCalledTimes(1);
  });

  it('should return result if function succeeds at second call', async () => {
    let i = 0;
    const fn = vi.fn(async () => {
      if (i === 0) {
        i++;
        throw new Error('some error');
      }
      return 42;
    });
    const retryFn = retry(fn);
    const start = Date.now();
    vi.runAllTimers();
    const [result] = await Promise.all([retryFn(), vi.runAllTimersAsync()]);
    expect(result).toBe(42);
    expect(fn).toBeCalledTimes(2);
    expect(Date.now() - start).toBe(1000);
  });

  it('should throw error after all unsuccessful calls', async () => {
    const fn = vi.fn(() => Promise.reject(new Error('some error')));
    const retryFn = retry(fn);

    const start = Date.now();
    const test = Promise.all([retryFn(), vi.runAllTimersAsync()]);
    await expect(test).rejects.toThrow('some error');
    expect(fn).toBeCalledTimes(5);
    expect(Date.now() - start).toBe(4000);
  });
});
