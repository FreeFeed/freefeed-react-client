import React from 'react';
import DropdownMenu from 'react-dd-menu';

import { confirmFirst } from '../utils';

export default class PostMoreMenu extends React.Component {
  state = { isOpen: false, menuAlign: 'left' };
  rootEl = React.createRef();

  handleClickOnMore = () => {
    this.setState({ isOpen: !this.state.isOpen, menuAlign: 'left' });
  };

  close = () => {
    this.setState({ isOpen: false, menuAlign: 'left' });
  };

  // A little hack to keep the menu inside window
  componentDidUpdate(prevProps, prevState) {
    if (prevState.isOpen || !this.state.isOpen || !this.rootEl.current) {
      return;
    }
    const menuBounds = this.rootEl.current.querySelector('.dd-menu-items').getBoundingClientRect();
    if (menuBounds.right > document.documentElement.clientWidth) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ menuAlign: 'right' });
    } else if (menuBounds.left < 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ menuAlign: 'left' });
    }
  }

  render() {
    const menuOptions = {
      align: this.state.menuAlign,
      close: this.close,
      isOpen: this.state.isOpen,
      animate: false,
      toggle: (
        <a className="post-action" onClick={this.handleClickOnMore}>
          More&#x200a;&#x25be;
        </a>
      ),
    };

    const delLabel = this.props.post.isFullyRemovable ? 'Delete' : 'Remove from group';

    return (
      <span ref={this.rootEl}>
        <DropdownMenu {...menuOptions}>
          {this.props.post.isEditable ? (
            <li className="dd-menu-item">
              <a className="dd-menu-item-link" onClick={this.props.toggleEditingPost}>
                Edit
              </a>
            </li>
          ) : (
            false
          )}

          {this.props.post.isModeratingComments ? (
            <li className="dd-menu-item">
              <a className="dd-menu-item-link" onClick={this.props.toggleModeratingComments}>
                Stop moderating comments
              </a>
            </li>
          ) : (
            <li className="dd-menu-item">
              <a className="dd-menu-item-link" onClick={this.props.toggleModeratingComments}>
                Moderate comments
              </a>
            </li>
          )}

          {this.props.post.commentsDisabled ? (
            <li className="dd-menu-item">
              <a className="dd-menu-item-link" onClick={this.props.enableComments}>
                Enable comments
              </a>
            </li>
          ) : (
            <li className="dd-menu-item">
              <a className="dd-menu-item-link" onClick={this.props.disableComments}>
                Disable comments
              </a>
            </li>
          )}

          <li className="dd-menu-item dd-menu-item-danger">
            <a className="dd-menu-item-link" onClick={confirmFirst(this.props.deletePost)}>
              {delLabel}
            </a>
          </li>
        </DropdownMenu>
      </span>
    );
  }
}
