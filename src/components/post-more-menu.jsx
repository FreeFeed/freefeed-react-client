import React from 'react';
import DropdownMenu from 'react-dd-menu';

import { confirmFirst } from '../utils';

export default class PostMoreMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isOpen: false };
  }

  handleClickOnMore = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  close = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const menuOptions = {
      align: 'left',
      close: this.close,
      isOpen: this.state.isOpen,
      animate: false,
      toggle: (
        <a className="post-action" onClick={this.handleClickOnMore}>
          More&nbsp;&#x25be;
        </a>
      ),
    };

    const delLabel = this.props.post.isFullyRemovable ? 'Delete' : 'Remove from group';

    return (
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
    );
  }
}
