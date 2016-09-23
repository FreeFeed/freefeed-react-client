import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import UserCard from './user-card';
import * as FrontendPrefsOptions from '../utils/frontend-preferences-options';

const DisplayOption = ({user, me, preferences, applyHyphenations}) => {
  let username, screenName;

  if (applyHyphenations) {
    username = user.username;
    screenName = user.screenName;
  } else {
    username = user.username;
    screenName = user.screenName;
  }

  if (user.username === me && preferences.useYou) {
    return <span dir="ltr">You</span>;
  }

  if (user.screenName === user.username) {
    return <span dir="ltr">{screenName}</span>;
  }

  switch (preferences.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return <span dir="auto">{screenName}</span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return <span dir="auto">{screenName} <span dir="ltr">({username})</span></span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_USERNAME: {
      return <span dir="ltr">{username}</span>;
    }
  }

  return <span>{user.screenName}</span>;
};

class UserName extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isHovered: false,
      isCardOpen: false
    };
  }

  enterUserName() {
    this.setState({isHovered: true});

    setTimeout(() => {
      if (this.state.isHovered) {
        this.setState({isCardOpen: true});
      }
    }, 500);
    
    if (this.props.userHover) {
      this.props.userHover.hover(this.props.user.username);
    }
  }

  leaveUserName() {
    this.setState({isHovered: false});

    setTimeout(() => {
      if (!this.state.isHovered) {
        this.setState({isCardOpen: false});
      }
    }, 500);

    if (this.props.userHover) {
      this.props.userHover.leave();
    }
  }

  render() {
    return (
      <div className="user-name-wrapper"
        onMouseEnter={this.enterUserName.bind(this)}
        onMouseLeave={this.leaveUserName.bind(this)}>

        <Link to={`/${this.props.user.username}`} className={this.props.className}>
          {this.props.display ? (
            <span dir="ltr">{this.props.display}</span>
          ) : (
            <DisplayOption
              user={this.props.user}
              me={this.props.me}
              preferences={this.props.frontendPreferences.displayNames}
              applyHyphenations={this.props.applyHyphenations}/>
          )}
        </Link>

        {this.state.isCardOpen ? (
          <UserCard username={this.props.user.username}/>
        ) : false}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences
  };
};

export default connect(mapStateToProps)(UserName);
