import React from 'react'

export default (props) => (
  <div className='loader-container'>
    {props.loading ?
      (<div className='loader-overlay'>
        <img src='../assets/images/throbber.gif'/>
      </div>) : false}
    {props.children}
  </div>
)
