import React from 'react'
import ReactDOM from 'react-dom'
import {history} from 'react-router/lib/History'
import {Router, Route} from 'react-router'
import { Provider } from 'react-redux'

import {initState, getStore} from './store'

import Layout from './layout'
import Home from './home'
import About from './about'
import NotFound from './notfound'

initState()

ReactDOM.render(
  <Provider store={getStore()}>
    <Router history={history}>
      <Route path='/' component={Layout}>
        <Route name='timeline.home' component={Home} />
        <Route path='/about' name='about' component={About} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
)
