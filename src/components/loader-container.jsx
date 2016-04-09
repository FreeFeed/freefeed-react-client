import React from 'react';
import throbber from 'assets/images/throbber.gif';

export default ({loading, children, fullPage}) => (
  <div className={`loader-container ${fullPage ? '-full' : ''}`}>
    {loading ?
      (<div className='loader-overlay'>
        <img src={throbber}/>
      </div>) : false}
    {children}
  </div>
);
