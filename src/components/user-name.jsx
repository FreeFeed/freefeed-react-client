import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'

import UserCard from './user-card'
import * as FrontendPrefsOptions from '../utils/frontend-preferences-options'

const DisplayOption = ({user, me, preferences}) => {
  if (user.username === me && preferences.useYou) {
    return <span>You</span>
  }

  if (user.screenName === user.username) {
    return <span>{user.screenName}</span>
  }

  switch (preferences.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return <span>{user.screenName}</span>
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return <span>{user.screenName} ({user.username})</span>
    }
    case FrontendPrefsOptions.DISPLAYNAMES_USERNAME: {
      return <span>{user.username}</span>
    }
  }

  return <span>{user.screenName}</span>
}

class UserName extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isHovered: false,
      isCardOpen: false
    }
  }

  enterUserName() {
    this.setState({isHovered: true})

    setTimeout(() => {
      if (this.state.isHovered) {
        this.setState({isCardOpen: true})
      }
    }, 500)
  }

  leaveUserName() {
    this.setState({isHovered: false})

    setTimeout(() => {
      if (!this.state.isHovered) {
        this.setState({isCardOpen: false})
      }
    }, 500)
  }

  render() {
    return (
      <div className="user-name-wrapper"
        onMouseEnter={this.enterUserName.bind(this)}
        onMouseLeave={this.leaveUserName.bind(this)}>

        <Link to={`/${this.props.user.username}`} className={this.props.className}>
          {this.props.display ? (
            <span>{this.props.display}</span>
          ) : (
            <DisplayOption
              user={this.props.user}
              me={this.props.me}
              preferences={this.props.frontendPreferences.displayNames}/>
          )}
        </Link>

        {this.state.isCardOpen ? (
          <UserCard username={this.props.user.username}/>
        ) : false}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences
  }
}

export default connect(mapStateToProps)(UserName)
