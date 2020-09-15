import React from 'react';
import { Link } from 'react-router';

export default () => (
  <footer className="footer">
    &copy; FreeFeed 1.86.0 (Sep, 15, 2020)
    <br />
    <Link to="/about">About</Link>
    {' | '}
    <a href="https://github.com/FreeFeed/freefeed-server/wiki/FAQ" target="_blank">
      FAQ
    </a>
    {' | '}
    <Link to="/about/terms">Terms</Link>
    {' | '}
    <Link to="/about/privacy">Privacy</Link>
    {' | '}
    <Link to="/about/stats">Stats</Link>
    {' | '}
    <a href="https://status.freefeed.net/" target="_blank">
      Status
    </a>
    {' | '}
    <a href="https://github.com/FreeFeed" target="_blank">
      GitHub
    </a>
  </footer>
);
