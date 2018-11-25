import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

import { ELEMENT_RESIZE_EVENT } from './events';

export default class FoldableContent extends React.Component {
  static propTypes = {
    maxUnfoldedHeight: PropTypes.number.isRequired,
    foldedHeight:      PropTypes.number.isRequired,
  };

  static defaultProps = {
    maxUnfoldedHeight: 550,
    foldedHeight:      400,
  };

  content = null;
  state = {
    contentHeight: 0,
    expanded:      false,
  };

  toggleFold = () => this.setState({ expanded: !this.state.expanded });

  updateHeight = () => {
    const contentHeight = this.content.offsetHeight;
    if (contentHeight !== this.state.contentHeight) {
      this.setState({ contentHeight });
    }
  };

  setContent = (el) => {
    if (el) {
      this.content = el;
      this.content.addEventListener(ELEMENT_RESIZE_EVENT, this.updateHeight);
      window.addEventListener('resize', this.updateHeight);
      this.updateHeight(); // initial height
    } else if (this.content) {
      this.content.removeEventListener(ELEMENT_RESIZE_EVENT, this.updateHeight);
      window.removeEventListener('resize', this.updateHeight);
      this.content = null;
    }
  };

  render() {
    const foldNeeded = this.state.contentHeight > this.props.maxUnfoldedHeight;
    const wrapperHeight = (foldNeeded && !this.state.expanded) ? this.props.foldedHeight : this.state.contentHeight;

    return (
      <div className="folder-container">
        <div
          className={classnames({ 'content-wrapper': true, folded: foldNeeded && !this.state.expanded })}
          style={{ height: `${wrapperHeight + 1}px` }}
        >
          <div ref={this.setContent}>{this.props.children}</div>
        </div>
        {foldNeeded ? (
          <div className="preview-expand">
            <i onClick={this.toggleFold} className={`fa fa-${this.state.expanded ? 'minus' : 'plus'}-square-o`} />
            {' '}
            <a onClick={this.toggleFold}>{this.state.expanded ? 'Fold' : 'Expand'} preview</a>
          </div>
        ) : false}
      </div>
    );
  }
}
