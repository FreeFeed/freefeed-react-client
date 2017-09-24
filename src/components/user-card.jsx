import React from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import _ from 'lodash';

import throbber16 from '../../assets/images/throbber-16.gif';
import {getUserInfo, updateUserPreferences} from '../redux/action-creators';
import {userActions} from './select-utils';

class UserCard extends React.Component {
  constructor(props) {
    super(props);

    // Load this user's info if it's not in the store already
    if (!props.user.id) {
      setTimeout(() => props.getUserInfo(props.username), 0);
    }
  }

  unsubscribe = () => {
    if (this.props.amIGroupAdmin) {
      alert('You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first.');
    } else {
      this.props.unsubscribe({username: this.props.user.username});
    }
  }

  render() {
    const props = this.props;
    const style = {top: `${this.props.top + 10}px`, left: `${this.props.left}px`};

    if (props.notFound) {
      return (<div className="user-card" style={style}>
        <div className="user-card-info">
          <div className="userpic loading"></div>
          <div className="names">
                User not found
          </div>
        </div>
      </div>);
    }

    if (!props.user.id) {
      return (<div className="user-card" style={style}>
        <div className="user-card-info">
          <div className="userpic loading"></div>
          <div className="names">
            <img width="16" height="16" src={throbber16}/>
          </div>
        </div>
      </div>);
    }

    let description;
    if (props.isItMe) {
      description = 'It\u2019s you!';
    } else {
      if (props.user.isPrivate === '1') {
        description = 'Private';
      } else if (props.user.isProtected === '1') {
        description = 'Protected';
      } else {
        description = 'Public';
      }
      description = description + ' ' + (props.user.type === 'user' ? 'user' : 'group');
    }

    return (
      <div className="user-card" style={style}>
        <div className="user-card-info">
          <Link to={`/${props.user.username}`} className="userpic">
            <img src={props.user.profilePictureLargeUrl} width="75" height="75"/>
          </Link>

          <div className="names">
            <Link to={`/${props.user.username}`} className="display-name" dir="auto">{props.user.screenName}</Link><br/>

            {props.user.screenName !== props.user.username ? (
              <span className="username">@{props.user.username}</span>
            ) : false}
          </div>

          <div className="description">{description}</div>
        </div>

        {props.blocked ? (
          <div className="user-card-actions">
            <span>Blocked user - </span>
            <a onClick={()=>props.unban({username: props.user.username, id: props.user.id})}>Un-block</a>
          </div>
        ) : !props.isItMe ? (
          <div className="user-card-actions">
            {props.user.isPrivate === '1' && !props.subscribed ? (
              props.hasRequestBeenSent ? (
                <span>Subscription request sent</span>
              ) : (
                <a onClick={()=>props.sendSubscriptionRequest({username: props.user.username, id: props.user.id})}>Request a subscription</a>
              )
            ) : (
              props.subscribed ? (
                <a onClick={this.unsubscribe}>Unsubscribe</a>
              ) : (
                <a onClick={()=>props.subscribe({username: props.user.username})}>Subscribe</a>
              )
            )}

            {props.user.type !== 'group' && !props.subscribed ? (
              <span> - <a onClick={()=>props.ban({username: props.user.username, id: props.user.id})}>Block</a></span>
            ) : props.amIGroupAdmin ? (
              <span> - <Link to={`/${props.user.username}/settings`}>Settings</Link></span>
            ) : false}

            <span> - <a onClick={()=>props.hideShowUser(props.me, props.user.username)}>{props.hidden ? 'Show' : 'Hide'} posts</a></span>

          </div>
        ) : false}
      </div>);
  }
}

const mapStateToProps = (state, ownProps) => {
  const me = state.user;
  const user = (_.find(state.users, {username: ownProps.username}) || {});
  const notFound = (!user.id && state.usersNotFound.indexOf(ownProps.username) >= 0);

  return {
    me,
    user,
    notFound,
    isItMe: (me.username === user.username),
    subscribed: ((me.subscriptions || []).indexOf(user.id) > -1),
    hasRequestBeenSent: ((me.pendingSubscriptionRequests || []).indexOf(user.id) > -1),
    blocked: ((me.banIds || []).indexOf(user.id) > -1),
    hidden: (me.frontendPreferences.homefeed.hideUsers.indexOf(user.username) > -1),
    amIGroupAdmin: (user.type === 'group' && (user.administrators || []).indexOf(me.id) > -1)
  };
};

function mapDispatchToProps(dispatch) {
  return {
    ...userActions(dispatch),
    getUserInfo: (username) => dispatch(getUserInfo(username)),
    hideShowUser: (me, username) => {
      const {homefeed: {hideUsers}} = me.frontendPreferences;
      const p = hideUsers.indexOf(username);
      if (p < 0) {
        hideUsers.push(username);
      } else {
        hideUsers.splice(p, 1);
      }
      dispatch(updateUserPreferences(me.id, {...me.frontendPreferences, homefeed: {...me.frontendPreferences.homefeed, hideUsers}}));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCard);
