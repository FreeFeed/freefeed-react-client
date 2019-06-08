import React from 'react';

import throbber16 from '../../assets/images/throbber-16.gif';
import throbber100 from '../../assets/images/throbber.gif';


export const SMALL = 'SMALL';
export const BIG = 'BIG';

export function Throbber({ size = SMALL }) {
  if (size === SMALL) {
    return <img src={throbber16} width="16" height="16" />;
  } else if (size === BIG) {
    return <img src={throbber100} width="100" height="100" />;
  }
  return null;
}
