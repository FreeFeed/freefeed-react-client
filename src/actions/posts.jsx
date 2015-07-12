import {Actions} from 'flummox';
import fetch from 'isomorphic-fetch';

const API_HOST = 'http://localhost:3000';

export default class PostsActions extends Actions {
  async getHome(offset) {
    var token = window.localStorage.getItem('authToken');

    if (!token) {
      return {ok: false, authenticated: false}
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
      var parsedBody = response.json();

      if (response.status === 200) {
        return {ok: true, authenticated: true, body: await parsedBody}
      } else if (response.status === 401) {
        return {ok: true, authenticated: false, body: await parsedBody}
      } else {
        return {ok: false}
      }
    } catch (e) {
      return {ok: false}
    }
  }
}
