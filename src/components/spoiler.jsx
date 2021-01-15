import { PureComponent } from 'react';
import classnames from 'classnames';

export default class Spoiler extends PureComponent {
  state = {
    visible: false,
  };

  onToggle = (e) => {
    const sel = window.getSelection();
    if (sel.toString() !== '') {
      // do nothing if there is a text selection, because this click is from
      // user finishing selecting something inside the spoiler
      return;
    }
    if (e.target.closest('a')) {
      // clicked element is wrapped in an <a> which means it's something
      // like a link, which should not close the spoiler
      return;
    }
    this.setState({ visible: !this.state.visible });
  };

  render() {
    const { visible } = this.state;
    const { children } = this.props;

    const cn = classnames(visible ? 'spoiler-visible' : 'spoiler-hidden');

    return (
      <span
        className={cn}
        onClick={this.onToggle}
        title={visible ? undefined : 'This is a spoiler. Click to reveal its contents.'}
      >
        {children}
      </span>
    );
  }
}
