import {Actions} from 'flummox';
import fetch from 'isomorphic-fetch';

const API_HOST = 'http://localhost:3000';

class AuthActions extends Actions {
  async getWhoami() {
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

export default AuthActions;
