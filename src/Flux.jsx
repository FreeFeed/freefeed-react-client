import {Flux} from 'flummox';
import AuthAction from './actions/auth';
import AuthStore from './stores/auth';

export default class extends Flux {
  constructor() {
    super();

    this.createActions('auth', AuthAction);
    this.createStore('auth', AuthStore, this);
  }
}
