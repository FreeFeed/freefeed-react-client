import React, { Component, Children } from 'react';
import classNames from 'classnames';
import memoize from 'memoize-one';

import '../../styles/shared/invisible-select.scss';


const optionsProps = memoize((children) => Children.toArray(children).filter((c) => c.type === 'option').map((c) => c.props));

export class InvisibleSelect extends Component {
  render() {
    const optProps = optionsProps(this.props.children);
    let selectedLabel = optProps[0].children;
    for (const o of optProps) {
      if (this.props.value === o.value) {
        selectedLabel = o.children;
        break;
      }
    }

    return (
      <div className={classNames('invisibleSelect', this.props.className)}>
        <div className="invisibleSelect__label">{selectedLabel}</div>
        <select {...this.props} className="invisibleSelect__select">
          {this.props.children}
        </select>
      </div>
    );
  }
}
