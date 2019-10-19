import { describe, it, before } from 'mocha';
import expect from 'unexpected';

import {
  asyncPhase,
  request,
  response,
  fail,
  reset,
  REQUEST_PHASE,
  RESET_PHASE,
  FAIL_PHASE,
  RESPONSE_PHASE,
  isAsync,
  baseType,
  asyncState,
  initialAsyncState,
  asyncStatesMap,
} from '../../../src/redux/async-helpers';

describe('Async helpers', () => {
  describe('Async phases', () => {
    const table = [
      { maker: request, phase: REQUEST_PHASE },
      { maker: response, phase: RESPONSE_PHASE },
      { maker: fail, phase: FAIL_PHASE },
      { maker: reset, phase: RESET_PHASE },
    ];

    for (const { maker, phase } of table) {
      it(`should create '${phase}' type`, () => {
        expect(asyncPhase(maker('TEST')), 'to be', phase);
      });
    }

    for (const { maker, phase } of table) {
      it(`should check that '${phase}' type is async`, () => {
        expect(isAsync(maker('TEST')), 'to be true');
      });
    }

    for (const { maker, phase } of table) {
      it(`should extract the base type from '${phase}' type`, () => {
        expect(baseType(maker('TEST')), 'to be', 'TEST');
      });
    }
  });

  describe('asyncState reducer', () => {
    const actionType = 'TEST';
    let reducer;
    before(() => {
      reducer = asyncState(actionType);
    });

    it('should return initial state', () => {
      const state = reducer(undefined, { type: 'UNKNOWN' });
      expect(state, 'to be', initialAsyncState);
    });

    it('should not touch state on unknown action', () => {
      const initialState = 42;
      const state = reducer(initialState, { type: 'UNKNOWN' });
      expect(state, 'to be', initialState);
    });

    it('should process the REQUEST action', () => {
      const state = reducer(initialAsyncState, { type: request(actionType) });
      expect(state, 'to equal', { ...initialAsyncState, loading: true });
    });

    it('should process the RESPONSE action', () => {
      const state = reducer(initialAsyncState, { type: response(actionType) });
      expect(state, 'to equal', { ...initialAsyncState, success: true });
    });

    it('should process the FAIL action without payload', () => {
      const state = reducer(initialAsyncState, { type: fail(actionType) });
      expect(state, 'to equal', { ...initialAsyncState, error: true });
    });

    it('should process the FAIL action without error in payload', () => {
      const state = reducer(initialAsyncState, {
        type: fail(actionType),
        payload: { err: 'AAA!' },
      });
      expect(state, 'to equal', { ...initialAsyncState, error: true, errorText: 'AAA!' });
    });

    it('should process the RESET action after RESPONSE', () => {
      let state = reducer(initialAsyncState, { type: response(actionType) });
      state = reducer(state, { type: reset(actionType) });
      expect(state, 'to equal', initialAsyncState);
    });
  });

  describe('asyncStatesMap reducer', () => {
    describe('with default parameters', () => {
      const actionType = 'TEST';
      let reducer;
      before(() => {
        reducer = asyncStatesMap(actionType);
      });

      it('should return initial state', () => {
        const state = reducer(undefined, { type: 'UNKNOWN' });
        expect(state, 'to equal', {});
      });

      it('should process the REQUEST action', () => {
        const state = reducer(
          {},
          {
            type: request(actionType),
            payload: { id: 'id1' },
          },
        );
        expect(state, 'to equal', { id1: { ...initialAsyncState, loading: true } });
      });

      it('should process two actions with different ids', () => {
        let state = {};
        state = reducer(state, {
          type: request(actionType),
          payload: { id: 'id1' },
        });
        state = reducer(state, {
          type: response(actionType),
          request: { id: 'id2' },
        });
        expect(state, 'to equal', {
          id1: { ...initialAsyncState, loading: true },
          id2: { ...initialAsyncState, success: true },
        });
      });
    });

    describe('with keyMustExist', () => {
      const actionType = 'TEST';
      let reducer;
      before(() => {
        reducer = asyncStatesMap(actionType, { keyMustExist: true });
      });

      it('should process the REQUEST action of existing key', () => {
        const state = reducer(
          { id1: initialAsyncState },
          {
            type: request(actionType),
            payload: { id: 'id1' },
          },
        );
        expect(state, 'to equal', { id1: { ...initialAsyncState, loading: true } });
      });

      it('should not process the REQUEST action of non-existing key', () => {
        const initialState = { id2: initialAsyncState };
        const state = reducer(initialState, {
          type: request(actionType),
          payload: { id: 'id1' },
        });
        expect(state, 'to be', initialState);
      });
    });

    describe('with applyState function', () => {
      const actionType = 'TEST';
      let reducer;
      before(() => {
        reducer = asyncStatesMap(actionType, {
          applyState: (prev = { foo: 42 }, async) => ({ ...prev, async }),
        });
      });

      it('should process the REQUEST action of existing key', () => {
        const state = reducer(
          { id1: { foo: 41, async: initialAsyncState } },
          {
            type: request(actionType),
            payload: { id: 'id1' },
          },
        );
        expect(state, 'to equal', {
          id1: { foo: 41, async: { ...initialAsyncState, loading: true } },
        });
      });

      it('should process the REQUEST action of non-existing key', () => {
        const state = reducer(
          { id2: { foo: 41, async: initialAsyncState } },
          {
            type: request(actionType),
            payload: { id: 'id1' },
          },
        );
        expect(state, 'to equal', {
          id1: { foo: 42, async: { ...initialAsyncState, loading: true } },
          id2: { foo: 41, async: initialAsyncState },
        });
      });
    });
  });
});
