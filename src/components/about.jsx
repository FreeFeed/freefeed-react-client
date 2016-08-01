import React from 'react';
import {Link} from 'react-router';

import screenshot from 'assets/images/screenshot.png';

export default (props) => (
  <div className="box">
    <div className="box-header-timeline"></div>
    <div className="box-body">
      <h3>What is FreeFeed?</h3>

      <p>FreeFeed is a social network that enables you to discover and discuss
        the interesting stuff your friends find on the web.</p>

      <p><b><Link to="/signup">Sign up</Link></b> now or <Link to="/signin">sign in</Link> if
        you already have an account.</p>

      <p><img src={screenshot} width="450" height="431" style={{border: '1px solid #ccc'}}/></p>

      <h3>Why FreeFeed?</h3>

      <p>FreeFeed is being built as a replacement
        for <a href="https://en.wikipedia.org/wiki/FriendFeed" target="_blank">FriendFeed</a>,
        the real-time aggregator and social network where "likes" for user
        generated content were implemented for the first time.</p>

      <p>After Facebook had acquired FriendFeed and announced its plan to shut
        down the website on April 9, 2015, a small group of Russian-speaking
        FriendFeed users decided to build an open-source free-for-all replacement.</p>

      <h3>Help us build better FreeFeed</h3>

      <p>FreeFeed is an open-source project. We are <Link to="/dev">looking
        for volunteers</Link> to help us with the development of FreeFeed.net.</p>

      <h3>Important pages</h3>

      <p><Link to="/support">https://freefeed.net/support</Link> –
        Tech support (we speak English, Russian as well as some other languages :))</p>

      <p><Link to="/freefeed">https://freefeed.net/freefeed</Link> -
        Important service announcements</p>

      <h3>The team behind FreeFeed</h3>

      <p>A team of volunteers registered a non-profit organization, FreeFeed.net MTÜ,
        in Tallinn, Estonia to fund and coordinate open-source development of the
        platform.</p>

      <p>After launching a <a href="https://www.indiegogo.com/projects/freefeed-v-1" target="_blank">successful
        crowdfunding campaign</a> in December 2015, the platform is now being
        actively developed. It is being used by hundreds of people now, even
        though the work is still underway.</p>

      <p>FreeFeed v.1 was released in August 2016.</p>

      <p>You can <b><Link to="/signup">sign up</Link></b> now and join FreeFeed.</p>
    </div>
  </div>
);
