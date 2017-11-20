import React from 'react';
import { Link } from 'react-router';

export default () => (
  <div className="box-body">
    <h3>Welcome to FreeFeed</h3>

    <p>FreeFeed is a social network that enables you to discover and discuss
      the interesting stuff your friends find on the web.</p>

    <p><Link to="/about">Read more</Link> about FreeFeed.</p>

    <p><b><Link to="/signup">Sign up</Link></b> now or <Link to='/signin'>sign in</Link> if
      you already have an account.</p>
  </div>
);
