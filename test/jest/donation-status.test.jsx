/* global jest, expect, describe, it, beforeEach */
import { renderHook } from '@testing-library/react-hooks';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';

import { donationAccount, donationLoadingStatus } from '../../src/redux/reducers/donation-status';
import { fail, request, response } from '../../src/redux/async-helpers';
import { GET_USER_INFO } from '../../src/redux/action-types';
import { useDonationStatus, fundingStatuses } from '../../src/components/hooks/donation-status';

const CLEAR_STATE = 'test/CLEAR_STATE';
const cleanState = () => ({ type: CLEAR_STATE });

const reducer = combineReducers({
  donationAccount,
  donationLoadingStatus,
});

describe('useDonationStatus hook', () => {
  const actionSpy = jest.fn();
  const testReducer = (state, action) => {
    if (action.type === CLEAR_STATE) {
      state = undefined;
    } else {
      actionSpy(action);
    }
    return reducer(state, action);
  };

  const store = createStore(testReducer);
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

  const accName = 'acc';

  beforeEach(() => {
    store.dispatch(cleanState());
  });

  describe('Without the account name', () => {
    it(`should return null and shouldn't dispatch any actions`, () => {
      const { result } = renderHook(() => useDonationStatus(''), { wrapper });
      expect(result.current).toBeNull();
      expect(actionSpy.mock.calls).toHaveLength(0);
    });
  });

  it(`should return 'Loading...' and dispatch GET_USER_INFO action`, () => {
    const { result } = renderHook(() => useDonationStatus(accName), { wrapper });
    expect(result.current).toBe('Loading\u2026');
    expect(actionSpy.mock.calls).toMatchObject([
      [{ type: GET_USER_INFO, payload: { username: accName } }],
    ]);
  });

  it(`should return 'Loading...' when the account info is loading`, () => {
    const action = {
      type: request(GET_USER_INFO),
      payload: { username: accName },
      extra: { donationAccount: true },
    };

    store.dispatch(action);
    actionSpy.mockClear();

    const { result } = renderHook(() => useDonationStatus(accName), { wrapper });
    expect(actionSpy.mock.calls).toHaveLength(0);
    expect(result.current).toBe('Loading\u2026');
  });

  it(`should return 'Load error' on load error`, () => {
    const action = {
      type: fail(GET_USER_INFO),
      request: { username: accName },
      payload: { err: 'Error happened' },
      extra: { donationAccount: true },
    };

    store.dispatch(action);
    actionSpy.mockClear();

    const { result } = renderHook(() => useDonationStatus(accName), { wrapper });
    expect(actionSpy.mock.calls).toHaveLength(0);
    expect(result.current).toBe('Load error');
  });

  it(`should return 'Unknown' on unsupported screenname`, () => {
    const action = {
      type: response(GET_USER_INFO),
      payload: { users: { username: accName, screenName: 'test' } },
      extra: { donationAccount: true },
    };

    store.dispatch(action);
    actionSpy.mockClear();

    const { result } = renderHook(() => useDonationStatus(accName), { wrapper });
    expect(actionSpy.mock.calls).toHaveLength(0);
    expect(result.current).toBe('Unknown');
  });

  describe('Well-known statuses', () => {
    for (const status of fundingStatuses) {
      it(`should return '${status}' on '${status}' screenname`, () => {
        const action = {
          type: response(GET_USER_INFO),
          payload: { users: { username: accName, screenName: status } },
          extra: { donationAccount: true },
        };

        store.dispatch(action);

        const { result } = renderHook(() => useDonationStatus(accName), { wrapper });
        expect(result.current).toBe(status);
      });

      it(`should return '${status}' on '${status.toLowerCase()}' screenname`, () => {
        const action = {
          type: response(GET_USER_INFO),
          payload: { users: { username: accName, screenName: status.toLowerCase() } },
          extra: { donationAccount: true },
        };

        store.dispatch(action);

        const { result } = renderHook(() => useDonationStatus(accName), { wrapper });
        expect(result.current).toBe(status);
      });

      it(`should return '${status}' on 'abc${status.toLowerCase()}def' screenname`, () => {
        const action = {
          type: response(GET_USER_INFO),
          payload: { users: { username: accName, screenName: `abc${status.toLowerCase()}def` } },
          extra: { donationAccount: true },
        };

        store.dispatch(action);

        const { result } = renderHook(() => useDonationStatus(accName), { wrapper });
        expect(result.current).toBe(status);
      });
    }
  });
});
