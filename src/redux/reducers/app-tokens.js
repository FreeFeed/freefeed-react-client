import { combineReducers } from 'redux';
import { omit, without } from 'lodash';

import { fail, response, request } from '../action-helpers';
import {
  GET_APP_TOKENS,
  GET_APP_TOKENS_SCOPES,
  CREATE_APP_TOKEN,
  REISSUE_APP_TOKEN,
  UPDATE_APP_TOKEN,
  DELETE_APP_TOKEN,
  DELETE_APP_TOKEN_ID,
} from '../action-types';
import { asyncStatus, patchObjectByKey, fromResponse } from './helpers';


const fillToken = (token) => ({
  ...token,
  // Additional props
  tokenString: null,
  error:       null,
  deleted:     false,
});

export const appTokens = combineReducers({
  tokensStatus: asyncStatus(GET_APP_TOKENS),
  scopesStatus: asyncStatus(GET_APP_TOKENS_SCOPES),
  createStatus: asyncStatus(CREATE_APP_TOKEN),

  scopes:       fromResponse(GET_APP_TOKENS_SCOPES, ({ payload }) => payload.scopes, []),
  createdToken: fromResponse(CREATE_APP_TOKEN, ({ payload }) => payload.tokenString, ''),
  tokenIds:     fromResponse(
    GET_APP_TOKENS,
    ({ payload }) => payload.tokens.map((t) => t.id), [],
    (state, action) => {
      if (action.type === DELETE_APP_TOKEN_ID) {
        return state.includes(action.payload) ? without(state, action.payload) : state;
      }

      return state;
    }),
  tokens: fromResponse(GET_APP_TOKENS,
    ({ payload }) => payload.tokens.reduce((obj, t) => ({ ...obj, [t.id]: fillToken(t) }), {}), {},
    (state, action) => {
      // Requests
      if (action.type === request(REISSUE_APP_TOKEN)) {
        return patchObjectByKey(state, action.request, (token) => fillToken(token));
      }

      // Responses
      if (action.type === response(REISSUE_APP_TOKEN)) {
        return patchObjectByKey(state, action.request, (token) => ({ ...fillToken(token), tokenString: action.payload.tokenString }));
      }
      if (action.type === response(DELETE_APP_TOKEN)) {
        return patchObjectByKey(state, action.request, (token) => ({ ...fillToken(token), deleted: true }));
      }
      if (action.type === response(UPDATE_APP_TOKEN)) {
        return patchObjectByKey(state, action.request.tokenId, () => fillToken(action.payload.token));
      }

      // Failures
      if (
        action.type === fail(REISSUE_APP_TOKEN) ||
        action.type === fail(DELETE_APP_TOKEN)
      ) {
        return patchObjectByKey(state, action.request, (token) => ({ ...fillToken(token), error: action.payload.err }));
      }
      if (action.type === fail(UPDATE_APP_TOKEN)) {
        return patchObjectByKey(state, action.request.tokenId, (token) => ({ ...fillToken(token), error: action.payload.err }));
      }

      if (action.type === DELETE_APP_TOKEN_ID) {
        return (action.payload in state) ? omit(state, action.payload) : state;
      }

      return state;
    }),
});
