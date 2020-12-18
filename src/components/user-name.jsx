import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { Portal } from 'react-portal';

import * as FrontendPrefsOptions from '../utils/frontend-preferences-options';
import UserCard from './user-card';
import ErrorBoundary from './error-boundary';

const DisplayOption = ({ user, me, preferences }) => {
  const { username, screenName } = user;

  if (username === me && preferences.useYou) {
    return <span dir="ltr">You</span>;
  }

  if (screenName === username) {
    return <span dir="ltr">{screenName}</span>;
  }

  switch (preferences.displayOption) {
    case FrontendPrefsOptions.DISPLAYNAMES_DISPLAYNAME: {
      return <span dir="auto">{screenName}</span>;
    }
    case FrontendPrefsOptions.DISPLAYNAMES_BOTH: {
      return (
        <span dir="auto">
          {screenName} <span dir="ltr">({username})</span>
        </span>
      );
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
      isCardOpen: false,
    };
    this.enterUserName = this.enterUserName.bind(this);
    this.leaveUserName = this.leaveUserName.bind(this);
  }

  enterUserName() {
    this.setState({ isHovered: true });

    this.enterTimeout = setTimeout(() => {
      if (this.state.isHovered) {
        const { bottom, left } = ReactDOM.findDOMNode(this).getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.setState({ bottom: bottom + scrollTop, left, isCardOpen: true });

        if (this.props.userHover) {
          this.props.userHover.hover(this.props.user.username);
        }
      }
    }, 500);
  }

  leaveUserName() {
    this.setState({ isHovered: false });

    this.leaveTimeout = setTimeout(() => {
      if (!this.state.isHovered) {
        this.setState({ isCardOpen: false });
        if (this.props.userHover) {
          this.props.userHover.leave();
        }
      }
    }, 500);
  }

  render() {
    const { bottom, left } = this.state;
    return (
      <span
        className="user-name-wrapper"
        onMouseEnter={this.enterUserName}
        onMouseLeave={this.leaveUserName}
      >
        <ErrorBoundary>
          <Link to={`/${this.props.user.username}`} className={this.props.className}>
            {this.props.children ? (
              <span dir="ltr">{this.props.children}</span>
            ) : (
              <DisplayOption
                user={this.props.user}
                me={this.props.me}
                preferences={this.props.frontendPreferences.displayNames}
              />
            )}
          </Link>

          {this.state.isCardOpen ? (
            <Portal isOpened={true}>
              <div onMouseEnter={this.enterUserName} onMouseLeave={this.leaveUserName}>
                <UserCard username={this.props.user.username} top={bottom} left={left} />
              </div>
            </Portal>
          ) : (
            false
          )}
        </ErrorBoundary>
      </span>
    );
  }

  componentWillUnmount() {
    if (this.enterTimeout) {
      clearTimeout(this.enterTimeout);
    }
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }
  }
}

const mapStateToProps = (state) => {
  return {
    me: state.user.username,
    frontendPreferences: state.user.frontendPreferences,
  };
};

export default connect(mapStateToProps)(UserName);
