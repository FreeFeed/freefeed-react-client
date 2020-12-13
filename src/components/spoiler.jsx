import React from 'react';
import cn from 'classnames';

import styles from './spoiler.module.scss';

export default class Spoiler extends React.PureComponent {
  state = {
    visible: false,
  };

  show = () => this.setState({ visible: true });
  toggle = () => this.setState({ visible: !this.state.visible });

  render() {
    const { visible } = this.state;
    const { children, tagBefore, tagAfter } = this.props;

    return (
      <span className={styles.container}>
        <span className={cn(styles.tag, visible && styles.tagVisible)} onClick={this.toggle}>
          {tagBefore}
        </span>
        <span className={cn(styles.content, !visible && styles.contentHidden)} onClick={this.show}>
          {children}
        </span>
        <span className={cn(styles.tag, visible && styles.tagVisible)} onClick={this.toggle}>
          {tagAfter}
        </span>
      </span>
    );
  }
}
