import React from 'react'

export default ({loading, children, fullPage}) => (
  <div className={`loader-container ${fullPage ? '-full' : ''}`}>
    {loading ?
      (<div className='loader-overlay'>
        <img src='/assets/images/throbber.gif'/>
      </div>) : false}
    {children}
  </div>
)
