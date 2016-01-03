import React from 'react'
import {Link} from 'react-router'

export default _ => (
  <div className='box-body'>
    <h3>Welcome to FreeFeed</h3>
    <p>&lt;Here's the description of what FreeFeed is. We need a copywriter!&gt;</p>
    <p>If you already have an account, you might want to <Link to='/signin'>sign in</Link>.</p>
    <p>Otherwise, consider <Link to='/signup'>signing up</Link> to enjoy all the fun stuff.</p>
  </div>
)
