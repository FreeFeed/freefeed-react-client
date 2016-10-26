import React from 'react';
import {Link} from 'react-router';

export default () => (
  <footer className="footer">
    &copy; FreeFeed 1.5.1 (October 20, 2016)<br/>
    <Link to="/about">About</Link> | <Link to="/freefeed">News</Link> | <a href="https://status.freefeed.net/" target="_blank">Status</a> | <a href="https://dev.freefeed.net/" target="_blank">Development</a>
  </footer>
);
