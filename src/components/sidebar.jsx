import React from 'react';
import {Link} from 'react-router';

import external from 'assets/images/external.png';

import UserName from './user-name';
import {preventDefault} from '../utils';
import RecentGroups from './recent-groups';

export default ({user, signOut, recentGroups}) => (
  <div className='col-md-3 sidebar'>
    <div className='logged-in'>
      <div className='avatar'>
        <Link to={`/${user.username}`} ><img src={user.profilePictureMediumUrl} width="50" height="50"/></Link>
      </div>

      <div className='user'>
        <div className='author'>
          <UserName user={user} display={user.screenName}/>
        </div>
        <div>
          <Link to='/settings'>settings</Link>
          &nbsp;-&nbsp;
          <a onClick={preventDefault(signOut)}>sign out</a>
        </div>
      </div>
    </div>

    <div className='box'>
      <div className='box-header-friends'>
        Friends
      </div>
      <div className='box-body'>
        <ul>
          <li className='p-home'><Link to='/'>Home</Link></li>
          <li className='p-direct-messages'><Link to='/filter/direct'>Direct messages</Link></li>
          <li className='p-my-discussions'><Link to='/filter/discussions'>My discussions</Link></li>
        </ul>
      </div>
      <div className='box-footer'>
        <Link to={`/friends`}>Browse/edit friends</Link>
      </div>
    </div>

    <div className='box'>
      <div className='box-header-search'>
        Search
      </div>
      <div className='box-body'>
        <ul>
          <li><Link to='/search'>FreeFeed search</Link></li>
          <li><Link to={{ pathname: "/search", query: { qs: `"@${user.username}"` } }}>Vanity search</Link></li>
          <li><a href="http://search.pepyatka.com/" target="_blank">Search.pepyatka.com</a>
            <img width="18" height="12" src={external} style={{paddingLeft:5}}/>
          </li>
        </ul>
      </div>
    </div>

    <div className='box'>
      <div className='box-header-groups'>
        Groups
      </div>
      <div className='box-body'>
        <RecentGroups recentGroups={recentGroups}/>
      </div>
      <div className='box-footer'>
        <Link to='/groups'>Browse/edit groups</Link>
      </div>
    </div>

    <div className='box'>
      <div className='box-header-groups'>
        Info
      </div>
      <div className='box-body'>
        <ul>
          <li><Link to='/freefeed'>News</Link></li>
          <li><Link to='/support'>Support</Link></li>
        </ul>
      </div>
      <div className='box-footer'>

      </div>
    </div>

    <div className='box'>
      <div className='box-header-groups'>
        Bookmarklet
      </div>
      <div className='box-footer'>
        Once added to your toolbar, this button will let you share web pages on your FreeFeed.
        You can even attach thumbnails of images from the page you share!
      </div>
      <div className='box-footer'>
        Click and drag
        {' '}
        <a className="bookmarklet-button" href="BOOKMARKLET_PLACEHOLDER" onClick={preventDefault(_ => false)}>Share on FreeFeed</a>
        {' '}
        to&nbsp;your toolbar.
      </div>
    </div>

    <div className='box'>
      <div className='box-header-groups'>
        Coin Jar
      </div>
      <div className='box-footer'>
        <p style={{marginBottom: '10px'}}>Subscribe to Freefeed today! Arrangement is plain and simple — you wire funds to Freefeed, it gets better every week.</p>
        <span style={{display: 'block', marginLeft: 'auto', marginRight: 'auto'}}>
          <form action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_top'>
            <input type='hidden' name='cmd' value='_s-xclick'/>
            <input type='hidden' name='hosted_button_id' value='DRR5XU73QLD7Y'/>
            <table>
              <tbody>
                <tr><td style={{paddingBottom: '5px'}}>
                  <input type='hidden' name='on0' value='Pick monthly donation amount' style={{padding:'5px 0'}}/>Choose your option:
                </td></tr>
                <tr><td><select name='os0' defaultValue='Advanced'>
                  <option value='Basic'>€5.00 EUR / month</option>
                  <option value='Advanced'>€10.00 EUR / month</option>
                  <option value='Sizable'>€15.00 EUR / month</option>
                  <option value='Luxurious'>€20.00 EUR / month</option>
                  <option value='King size'>€30.00 EUR / month</option>
                  <option value='Master of the Universe'>€50.00 EUR / month</option>
                  <option value='Chuck Norris'>€75.00 EUR / month</option>
                  <option value='Duke Nukem'>€100.00 EUR / month</option>
                </select></td></tr>
              </tbody>
            </table>

            <input type='hidden' name='currency_code' value='EUR'/>
            <input type='image' src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png' border='0' name='submit' alt='PayPal - The safer, easier way to pay online!' style={{margin:'5px'}}/>
            <img alt='' border='0' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1' style={{display: 'none !important'}}/>
          </form>
        </span>
        <form action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_top' id='singlePayPalPayment'>
          <input type='hidden' name='cmd' value='_s-xclick'/>
          <input type='hidden' name='hosted_button_id' value='HMVYD6GEWNWH8'/>
          <input type='image' src='https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png' width='0' height='0' border='0' name='submit' alt='PayPal - The safer, easier way to pay online!'/>
          <img alt='' border='0' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1' style={{display: 'none !important'}}/>
        </form>
        <p style={{marginBottom: '10px'}}>Or <span onClick={_ => document.forms["singlePayPalPayment"].submit()} style={{textDecoration:'underline', cursor:'pointer'}}>send a one-time payment first&nbsp;→</span></p>
      </div>
    </div>
  </div>
);
