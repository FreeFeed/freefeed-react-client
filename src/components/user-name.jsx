import React from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {preventDefault} from '../utils'

const DisplayOption = ({user, me, preferences}) => {
  if (user.username === me && preferences.useYou) {
    return <span>You</span>
  }

  switch (preferences.displayOption) {
    case 1: {
      return <span>{user.screenName}</span>
    }
    case 2: {
      return <span>{user.screenName} ({user.username})</span>
    }
    case 3: {
      return <span>{user.username}</span>
    }
  }

  return <span>{user.screenName}</span>
}

const UserName = (props) => (
  <Link to={`/${props.user.username}`} className={`user-name-info ${props.className}`}>
    {props.display ? (
      <span>{props.display}</span>
    ) : (
      <DisplayOption
        user={props.user}
        me={props.me}
        preferences={props.frontendPreferences.displayNames}/>
    )}
  </Link>
)

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences
  }
}

export default connect(mapStateToProps)(UserName)
