import {Actions} from 'flummox';
import fetch from 'isomorphic-fetch';

const API_HOST = 'http://localhost:3000';

class AuthActions extends Actions {
  async getWhoami() {
    var response = fetch(`${API_HOST}/v1/users/whoami`, {
      headers: {
        'Accept': 'application/json',
        'X-Authentication-Token': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI5ZmQ3NDUwMy00ZTI5LTRiZGMtYjdmMC01OGY0NDcyZWY1MTYiLCJpYXQiOjE0MzQ3MjI3NjF9.HH9Gj-NoUnTMegz9y_L2H32pcFK7O5L2OBxF7TKz1fo"
      }
    });
    return (await response).json();
  }
}

export default AuthActions;
