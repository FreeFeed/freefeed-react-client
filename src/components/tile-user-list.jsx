import React from 'react';
import { Link } from 'react-router';
import classnames from 'classnames';
import _ from 'lodash';

import { confirmFirst } from '../utils';
import UserName from './user-name';


class UserTile extends React.PureComponent {
  handleAcceptClick = () => {
    const { user } = this.props;
    user.acceptRequest(user.username);
  };

  handleRejectClick = () => {
    const { user } = this.props;
    user.rejectRequest(user.username);
  };

  handlePromoteClick = () => {
    const { user } = this.props;
    user.makeAdmin(user);
  };

  handleUnsubscribeClick = confirmFirst(() => {
    const { user } = this.props;
    user.remove(user.username);
  });

  handleDemoteClick = () => {
    const { user } = this.props;
    user.removeAdminRights(user);
  };

  handleRevokeClick = () => {
    const { user } = this.props;
    user.revokeSentRequest(user.username);
  };

  render() {
    const { type, user } = this.props;

    return (
      <li key={user.id}>
        <div className="avatar">
          <Link to={`/${user.username}`}>
            <img src={user.profilePictureUrl} />
          </Link>
        </div>

        <UserName user={user} applyHyphenations={true} />

        {type == WITH_MUTUALS && user.isMutual ? (
          <div className="user-ismutual">mutual</div>
        ) : false}

        {type == WITH_REQUEST_HANDLES ? (
          <div className="user-actions">
            <a onClick={this.handleAcceptClick}>Accept</a>
            <span> - </span>
            <a onClick={this.handleRejectClick}>Reject</a>
          </div>
        ) : false}

        {type == WITH_REMOVE_AND_MAKE_ADMIN_HANDLES ? (
          <div className="user-actions">
            <a onClick={this.handlePromoteClick} title="Promote user to admin">Promote</a>
            <span> - </span>
            <a onClick={this.handleUnsubscribeClick} title="Unsubscribe user from the group">Unsub</a>
          </div>
        ) : false}

        {type == WITH_REMOVE_ADMIN_RIGHTS ? (
          <div className="user-actions">
            <a onClick={this.handleDemoteClick} title="Demote user from admin">Demote</a>
          </div>
        ) : false}

        {type == WITH_REVOKE_SENT_REQUEST ? (
          <div className="user-actions">
            <a onClick={this.handleRevokeClick} title="Revoke sent request">Revoke</a>
          </div>
        ) : false}

      </li>
    );
  }
}

const renderUsers = (type) => (user) => {
  return <UserTile key={user.id} type={type} user={user} />;
};

export const PLAIN = 'PLAIN';
export const WITH_REQUEST_HANDLES = 'WITH_REQUEST_HANDLES';
export const WITH_REMOVE_AND_MAKE_ADMIN_HANDLES = 'WITH_REMOVE_AND_MAKE_ADMIN_HANDLES';
export const WITH_REMOVE_ADMIN_RIGHTS = 'WITH_REMOVE_ADMIN_RIGHTS';
export const WITH_REVOKE_SENT_REQUEST = 'WITH_REVOKE_SENT_REQUEST';
export const WITH_MUTUALS = 'WITH_MUTUALS';

function pickActions(type, props) {
  switch (type) {
    case WITH_REQUEST_HANDLES: {
      return _.pick(props, ['acceptRequest', 'rejectRequest']);
    }
    case WITH_REMOVE_AND_MAKE_ADMIN_HANDLES: {
      return _.pick(props, ['makeAdmin', 'remove']);
    }
    case WITH_REMOVE_ADMIN_RIGHTS: {
      return { removeAdminRights: props.removeAdminRights };
    }
    case WITH_REVOKE_SENT_REQUEST: {
      return { revokeSentRequest: props.revokeSentRequest };
    }
  }

  return {};
}

class TileUserList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOrder: props.sorting && props.sorting[0].key || null,
      isReverse: props.sorting && props.sorting[0].isReverse || false
    };
  }

  render() {
    const { props } = this;
    const { config } = props;

    const usersData = props.users.map((user) => {
      return {
        ..._.pick(user, ['id', 'screenName', 'username', 'isMutual']),
        profilePictureUrl:
          (user.profilePictureUrl
            ? user.profilePictureUrl
            : (config.size === 'large'
              ? user.profilePictureLargeUrl
              : user.profilePictureMediumUrl)),
        ...pickActions(config.type, props)
      };
    });

    const users = usersData.map(renderUsers(config.type));

    const listClasses = classnames({
      'tile-list': true,
      'large-pics': config.size === 'large',
      'with-actions': config.type !== PLAIN
    });

    const header = props.header && config.displayQuantity ?
      `${props.header} (${props.users.length})` :
      props.header;

    const sorting = [
      { 'key': 'id', 'label': 'date they subscribed (most recent first)' },
      { 'key': 'username', 'label': 'username' },
      { 'key': 'screenName', 'label': 'display name' }
    ];

    const state = {
      selectedOrder: 'id'
    };

    const sortingOptions = (sorting ? (
      <p>
        Ordered by:
        {sorting.map((option, index) => (
          <span key={index}>
            {index > 0 ? ', ' : ' '}
            {option.key === state.selectedOrder ? (
              <b>{option.label}</b>
            ) : (
              <a onClick="">{option.label}</a>
            )}
          </span>
        ))}
      </p>
    ) : false);

    return (
      <div>
        {users.length ? (
          <div>
            <h3>{header}</h3>
            {sortingOptions}
            <ul className={listClasses}>
              {users}
            </ul>
          </div>
        ) : false}
      </div>
    );
  }
}

export const tileUserListFactory = (config) => (props) => <TileUserList config={config} {...props} />;
