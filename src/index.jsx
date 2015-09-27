import 'styles/common/common.scss'
import 'styles/helvetica/app.scss'

import React from 'react'
import ReactDOM from 'react-dom'
import {createHashHistory} from 'history'
import {Router, Route, IndexRoute} from 'react-router'
import {Provider} from 'react-redux'

import configureStore from './Redux/configure-store'
import {whoAmI, home} from './Redux/action-creators'

import Layout from './Components/layout'
import Home from './Components/home'
import About from './Components/about'
import NotFound from './Components/not-found'

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
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
)
