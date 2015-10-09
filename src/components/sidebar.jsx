import React from 'react'
import {Link} from 'react-router'

import UserName from './user-name'
import {preventDefault} from '../utils'

export default (props) => (
  <div className='col-md-3 sidebar'>
    <div className='logged'>
      <div className='logged-avatar'>
        <Link to='timeline.index' params={{username: props.user.username}}><img className='media-object' src={props.user.profilePictureMediumUrl}/></Link>
      </div>

      <div className='logged-user'>
        <div className='author'>
          <UserName user={props.user} />
        </div>
        <div>
          <Link to='/settings'>settings</Link>
          &nbsp;-&nbsp;
          <a onClick={preventDefault(props.signOut)}>sign out</a>
        </div>
      </div>
    </div>

    <div className='box'>
      <div className='box-header-friends'>
        Friends
      </div>
      <div className='box-body'>
        <ul>
          <li className='p-home'><Link to='timeline.home'>Home</Link></li>
          <li className='p-direct-messages'><Link to='timeline.directs'>Direct messages</Link></li>
          <li className='p-my-discussions'><Link to='timeline.discussions'>My discussions</Link></li>
        </ul>
      </div>
      <div className='box-footer'>
        <Link to='timeline.subscriptions' params={{username: props.user.username}}>Browse/edit friends</Link>
      </div>
    </div>

    <div className='box'>
      <div className='box-header-groups'>
        Groups
      </div>
      <div className='box-body'>
        groups
      </div>
      <div className='box-footer'>
        <Link to='groups.home'>Browse/edit groups</Link>
      </div>
    </div>

    <div className='box'>
      <div className='box-header-groups'>
        Info
      </div>
      <div className='box-body'>
        <ul>
          <li>News</li>
          <li>Support</li>
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
        Click and drag ​
        <a className='bookmarklet-button' href="BOOKMARKLET_PLACEHOLDER" onclick='return false'>Share on FreeFeed</a>
        to&nbsp;your toolbar.
      </div>
    </div>

    <div className='box'>
      <div className='box-header-groups'>
        Coin Jar
      </div>
      <div className='box-body'>
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
        <p style={{marginBottom: '10px'}}>Or <a href='#' onclick='document.forms["singlePayPalPayment"].submit(); return false;' style={{textDecoration:'underline'}}>send a one-time payment first&nbsp;→</a></p>
      </div>
    </div>
  </div>
)
