import { Store } from 'flummox';
import { Map, List } from 'immutable'

class AuthStore extends Store {

  constructor(flux) {
    super(); // Don't forget this step

    const actionIds = flux.getActionIds('auth');
    this.register(actionIds.getWhoami, this.handleAuthData);

    this.state = {
      user: Map(),
      subscribers: List(),
      subscriptions: List()
    };
  }

  handleAuthData(whoami) {
    this.setState({
      user: this.state.user.merge(whoami.users)
    })
  }

  getUser() {
    return this.state.user
  }
}

export default AuthStore;
