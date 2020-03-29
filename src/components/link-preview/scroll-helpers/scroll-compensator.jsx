import React from 'react';

import { ELEMENT_RESIZE_EVENT } from './events';

export default class ScrollCompensator extends React.Component {
  root = null;
  prevHeight = 0;

  setRoot = (el) => {
    if (el) {
      el.addEventListener(ELEMENT_RESIZE_EVENT, this.compensateScroll);
    } else if (this.root) {
      this.root.removeEventListener(ELEMENT_RESIZE_EVENT, this.compensateScroll);
    }
    this.root = el;
  };

  compensateScroll = () => {
    const newHeight = this.root ? this.root.offsetHeight : this.prevHeight;
    if (newHeight === this.prevHeight) {
      return;
    }

    this.prevHeight = newHeight;
  };

  render() {
    return <div ref={this.setRoot}>{this.props.children}</div>;
  }
}
