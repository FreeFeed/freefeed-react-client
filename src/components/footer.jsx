import React from 'react';
import {Link} from 'react-router';

export default (props) => (
  <footer className="footer">
    &copy; WereFeed 0.8.3 (April 9, 2016)<br/>
    <Link to="/about">About</Link> | <Link to="/freefeed">News</Link> | <a href="https://twitter.com/freefeednet" target="_blank">Twitter</a> | <a href="https://status.freefeed.net/" target="_blank">Status</a> | <a href="https://dev.freefeed.net/" target="_blank">Development</a>
  </footer>
);
