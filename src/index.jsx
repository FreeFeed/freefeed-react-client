import React from 'react'
import ReactDOM from 'react-dom'
import {history} from 'react-router/lib/BrowserHistory';
import {Router} from 'react-router';
import { Provider } from 'react-redux';

import routes from './routing.jsx';
import {initState, getStore} from './store.jsx'

initState();

ReactDOM.render(
  <Provider store={getStore()}>
    {() => <Router history={history}>{routes}</Router>}
  </Provider>,
  document.getElementById('app')
);
