import React from 'react';
import ReactDOM from 'react-dom';
import CustomEvent from 'custom-event';


export const ELEMENT_RESIZE_EVENT = 'elementResize';

export function contentResized(el) {
  try {
    if (el instanceof HTMLElement) {
      // pass
    } else if (el instanceof React.Component) {
      el = ReactDOM.findDOMNode(el);
    } else {
      return;
    }
    el.dispatchEvent(new CustomEvent(ELEMENT_RESIZE_EVENT, { bubbles: true }));
  } catch (e) {
    // pass
  }
}
