import React from 'react';
import {Link} from 'react-router';

export default (props) => (
  <div className="box">
    <div className="box-header-timeline"></div>
    <div className="box-body">
      <h3>Help us build WereFeed</h3>

      <p>We are looking for volunteers to help us build WereFeed, an open-source
        social network, replacement of FriendFeed.com.</p>

      <p>We need help with both development and testing.</p>

      <p>WereFeed is open-source: <a href="https://github.com/FreeFeed/" target="_blank">https://github.com/WereFeed/</a></p>

      <p>The <a href="https://github.com/FreeFeed/freefeed-server" target="_blank">backend</a> is
        built with Node.js and Redis. It is now being re-written to use PostgreSQL instead of Redis.</p>

      <p>The <a href="https://github.com/FreeFeed/freefeed-react-client" target="_blank">frontend</a> is built
        with React.</p>

      <h3>Roadmap</h3>

      <p>[x] v 0.6 React frontend<br/>
        [x] v 0.7 Add real-time updates to the frontend<br/>
        [x] v 0.8 Add support for private groups<br/>
        [ &nbsp;] v 0.9 Migrate to Postgres<br/>
        [ &nbsp;] v 1.0 Support for search and #hashtags</p>

      <p><a href="https://dev.freefeed.net" target="_blank">Join</a> our team of volunteers!</p>

      <p>P.S. We welcome contributions of features outside of the core ones
        outlined above, however we feel that the core has higher priority
        (especially switching the primary data store).</p>
    </div>
  </div>
);
