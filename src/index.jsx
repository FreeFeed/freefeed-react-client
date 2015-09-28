import 'styles/common/common.scss'
import 'styles/helvetica/app.scss'
import 'index.jade'

require.context('assets/fonts', true, /fontawesome.*/i)

import React from 'react'
import ReactDOM from 'react-dom'
import {createHashHistory} from 'history'
import {Router, Route, IndexRoute} from 'react-router'
import {Provider} from 'react-redux'

import configureStore from './redux/configure-store'
import {whoAmI, home} from './redux/action-creators'

import Layout from './components/layout'
import Home from './components/home'
import About from './components/about'
import NotFound from './components/not-found'
import Login from './components/login'

const store = configureStore()

const history = createHashHistory()

const unlistenHistory = history.listen((location) => {
  if (location.pathname.search('timeline.home') !== -1 || location.hash.search('timeline.home') !== -1){
    store.dispatch(home())
  }
})

//request main info for user
store.dispatch(whoAmI())
//request feed
store.dispatch(home())

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path='/' component={Layout}>
        <IndexRoute component={Home}/>
        <Route name='timeline.home' component={Home} />
        <Route path='about' name='about' component={About} />
        <Route path='login' component={Login}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
)
