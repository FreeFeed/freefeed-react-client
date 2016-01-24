import React from 'react'
import DropdownMenu from 'react-dd-menu';

export default class PostMoreMenu extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isOpen: false
    }
  }

  toggle() {
    this.setState({ isOpen: !this.state.isOpen })
  }

  close() {
    this.setState({ isOpen: false })
  }

  render() {
    let menuOptions = {
      align: 'left',
      close: this.close.bind(this),
      isOpen: this.state.isOpen,
      toggle: <a onClick={this.toggle.bind(this)}>More&nbsp;&#x25be;</a>
    }

    return (
      <DropdownMenu {...menuOptions}>
        <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.toggleEditingPost}>Edit</a></li>

        {this.props.post.isModeratingComments
          ? <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.toggleModeratingComments}>Stop moderating comments</a></li>
          : <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.toggleModeratingComments}>Moderate comments</a></li>}

        {this.props.post.commentsDisabled
          ? <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.enableComments}>Enable comments</a></li>
          : <li className="dd-menu-item"><a className="dd-menu-item-link" onClick={this.props.disableComments}>Disable comments</a></li>}

        <li className="dd-menu-item dd-menu-item-danger"><a className="dd-menu-item-link" onClick={this.props.deletePost}>Delete</a></li>
      </DropdownMenu>
    )
  }
}
