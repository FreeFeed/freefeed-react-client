import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';

import UserCard from './user-card';
import * as FrontendPrefsOptions from '../utils/frontend-preferences-options';

function chunk(str, chunkSize) {
  const stringLength = str.length;

  const chunksRequired = Math.ceil(stringLength / chunkSize);
  let stringArray = new Array(chunksRequired);

  let lengthRemaining = stringLength;

  for (let i = 0; i < chunksRequired; ++i) {
    let lengthToUse = Math.min(lengthRemaining, chunkSize);
    let startIndex = chunkSize * i;

    stringArray[i] = str.substr(startIndex, lengthToUse);

    lengthRemaining = lengthRemaining - lengthToUse;
  }

  return stringArray;
}

const CHUNK_SIZE = 12;

function wrap(str) {
  let parts = str.split(' ');
  for (let i = 0; i < parts.length; ++i) {
    if (parts[i].length > CHUNK_SIZE) {
      parts[i] = chunk(parts[i], CHUNK_SIZE).join('\u200B');
    }
  }

  return parts.join(' ');
}

const DisplayOption = ({user, me, preferences, applyHyphenations}) => {
  let username, screenName;

  if (applyHyphenations) {
    username = wrap(user.username);
    screenName = wrap(user.screenName);
  } else {
    username = user.username;
    screenName = user.screenName;
  }

  if (user.username === me && preferences.useYou) {
    return <span>You</span>;
  }

  if (user.screenName === user.username) {
    return <span>{screenName}</span>;
  }

  switch (preferences.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return <span>{screenName}</span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return <span>{screenName} ({username})</span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_USERNAME: {
      return <span>{username}</span>;
    }
  }

  return <span>{wrap(user.screenName)}</span>;
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
  }

  leaveUserName() {
    this.setState({isHovered: false});

    setTimeout(() => {
      if (!this.state.isHovered) {
        this.setState({isCardOpen: false});
      }
    }, 500);
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
