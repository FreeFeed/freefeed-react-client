import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

import { contentResized } from './events';

/**
 * Component that track resize of it's content and trigger 'elementResize' event.
 *
 * Based on GWT algorithm: /user/src/com/google/gwt/user/client/ui/ResizeLayoutPanel.java
 */
export default class ResizeTracker extends React.Component {
  // fixed, only applies at creation time
  static propTypes = { debounce: PropTypes.number.isRequired };

  static defaultProps = { debounce: 150, };

  root = null;
  expSensor = null;
  colSensor = null;
  prevRootHeight = 0;

  setRoot = (el) => {
    this.root = el;
    if (this.root !== null) {
      this.prevRootHeight = this.root.offsetHeight;
    } else {
      this.prevRootHeight = 0;
    }
  };
  setExpSensor = (el) => this.expSensor = el;
  setColSensor = (el) => this.colSensor = el;

  scrollHandler = () => {
    if (this.expSensor) { // Expand
      const sensor = this.expSensor;
      const slider = sensor.firstChild;
      const height = sensor.offsetHeight + 100;
      const width = sensor.offsetWidth + 100;
      slider.style.width = `${width}px`;
      slider.style.height = `${height}px`;
      sensor.scrollLeft = width;
      sensor.scrollTop = height;
    }
    if (this.colSensor) { // Collapse
      const sensor = this.colSensor;
      sensor.scrollLeft = sensor.scrollWidth + 100;
      sensor.scrollTop = sensor.scrollHeight + 100;
    }
    if (this.prevRootHeight !== this.root.offsetHeight) {
      this.prevRootHeight = this.root.offsetHeight;
      contentResized(this.root);
    }
  };

  constructor(props) {
    super(props);
    this.scrollHandler = _.debounce(this.scrollHandler, props.debounce);
  }

  componentDidMount() {
    this.scrollHandler();
  }

  render() {
    return (
      <div style={trackerStyle} ref={this.setRoot}>
        {this.props.children}
        <div style={sensorStyle} ref={this.setExpSensor} onScroll={this.scrollHandler}><div /></div>
        <div style={sensorStyle} ref={this.setColSensor} onScroll={this.scrollHandler}><div style={colSliderStyle} /></div>
      </div>
    );
  }
}

const trackerStyle = {
  position: 'relative',
  overflow: 'hidden',
};

const sensorStyle = {
  position:      'absolute',
  top:           '0',
  left:          '0',
  width:         '100%',
  height:        '100%',
  overflow:      'scroll',
  pointerEvents: 'none',
  zIndex:        -1,
  opacity:       0,
};

const colSliderStyle = {
  width:  '200%',
  height: '200%',
};
