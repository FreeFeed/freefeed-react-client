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

    const halfScreen = Math.round(document.documentElement.clientHeight / 2);
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > halfScreen / 2) { // if user scrolled more than 1/4 screen from site top
      const top = Math.round(this.root.getBoundingClientRect().top);
      let scroll = 0;
      if (top > halfScreen) {
        // nope
      } else if (top + this.prevHeight < halfScreen) {
        scroll = newHeight - this.prevHeight;
      } else {
        // content in the center of the screen must not move
        scroll = Math.round(newHeight * (halfScreen - top) / this.prevHeight);
      }
      scrollBy(0, scroll);
    }

    this.prevHeight = newHeight;
  };

  render() {
    return (
      <div ref={this.setRoot}>
        {this.props.children}
      </div>
    );
  }
}
