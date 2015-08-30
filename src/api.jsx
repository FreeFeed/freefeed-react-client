import fetch from 'isomorphic-fetch';

import {whoAmIAction, serverErrorAction, homeAction, getStore} from './store'

const API_HOST = 'http://localhost:3000';

export async function getWhoami() {
  var promise = fetch(
    `${API_HOST}/v1/users/whoami`,
    {
      headers: {
        'Accept': 'application/json',
        'X-Authentication-Token': window.localStorage.getItem('authToken')
      }
    }
  );

  try {
    var response = await promise
    var parsedBody = response.json();

    if (response.status === 200) {
      getStore().dispatch(whoAmIAction(true, (await parsedBody).users))
    } else if (response.status === 401) {
      getStore().dispatch(whoAmIAction(false))
    } else {
      getStore().dispatch(serverErrorAction())
    }
  } catch (e) {
    getStore().dispatch(serverErrorAction())
  }
}

export async function getHome(offset) {
  var token = window.localStorage.getItem('authToken');

  if (!token) {
    getStore().dispatch(whoAmIAction(false))
    return
  }

  var promise = fetch(
    `${API_HOST}/v1/timelines/home?offset=${offset}`,
    {
      headers: {
        'Accept': 'application/json',
        'X-Authentication-Token': token
      }
    }
  );

  try {
    var response = await promise
    var parsedBody = await response.json();

    if (response.status === 200) {
      getStore().dispatch(homeAction(true, parsedBody.posts, parsedBody.users))
    } else if (response.status === 401) {
      getStore().dispatch(whoAmIAction(false))
    } else {
      getStore().dispatch(serverErrorAction())
    }
  } catch (e) {
    getStore().dispatch(serverErrorAction())
  }
}
