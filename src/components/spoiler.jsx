import { PureComponent } from 'react';
import classnames from 'classnames';

export default class Spoiler extends PureComponent {
  state = {
    visible: false,
  };

  onShow = () => {
    this.setState({ visible: true });
  };

  render() {
    const { visible } = this.state;
    const { children } = this.props;

    const cn = classnames(visible ? 'spoiler-visible' : 'spoiler-hidden');

    return (
      <span
        className={cn}
        onClick={visible ? undefined : this.onShow}
        title={visible ? undefined : `This is a spoiler. Click to reveal its contents.`}
      >
        {children}
      </span>
    );
  }
}
