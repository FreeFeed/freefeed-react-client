import { describe, it, before, after } from 'mocha';
import unexpected from 'unexpected';
import unexpectedSinon from 'unexpected-sinon';
import sinon from 'sinon';

import { retry as retryIt } from '../../../src/utils/retry-promise';

const expect = unexpected.clone();
expect.use(unexpectedSinon);

// Fixing the retry function arguments
const retry = (fn) => retryIt(fn, 5, 1000);

describe('retry', () => {
  let clock;
  before(() => (clock = sinon.useFakeTimers()));
  after(() => clock.restore());

  it('should return first result if function succeeds', async () => {
    const fn = sinon.stub().returns(Promise.resolve(42));
    const retryFn = retry(fn);
    const result = await retryFn();
    expect(result, 'to be', 42);
    expect(fn, 'was called once');
  });

  it('should return result if function succeeds at second call', async () => {
    let i = 0;
    const fn = sinon.spy(async () => {
      if (i === 0) {
        i++;
        throw new Error('some error');
      }
      return 42;
    });
    const retryFn = retry(fn);
    const start = Date.now();
    const [result] = await Promise.all([retryFn(), clock.runAllAsync()]);
    expect(result, 'to be', 42);
    expect(fn, 'was called twice');
    expect(Date.now() - start, 'to be', 1000);
  });

  it('should throw error after all unsuccessful calls', async () => {
    const fn = sinon.stub().returns(Promise.reject(new Error('some error')));
    const retryFn = retry(fn);

    const start = Date.now();
    const test = Promise.all([retryFn(), clock.runAllAsync()]);
    await expect(test, 'to be rejected with', 'some error');
    expect(fn, 'was called times', 5);
    expect(Date.now() - start, 'to be', 4000);
  });
});
