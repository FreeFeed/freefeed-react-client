import React from 'react';
import {Route} from 'react-router';

import Layout from './layout.jsx';
import Home from './home.jsx';
import About from './about.jsx';
import NotFound from './notfound.jsx';

var routes = (
  <Route component={Layout}>
    <Route path="/" name="timeline.home" component={Home} />
    <Route path="/about" name="about" component={About} />
  </Route>
);

export default routes;
