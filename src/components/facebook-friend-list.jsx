import React from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';

import throbber16 from '../../assets/images/throbber-16.gif';
import { getFacebookFriends } from '../redux/action-creators';
import { openOauthAuthzPopup } from '../services/auth';
import { tileUserListFactory, WITH_MUTUALS } from './tile-user-list';

const TileList = tileUserListFactory({
  type: WITH_MUTUALS,
  alwaysShowHeader: true,
  displayQuantity: true,
});

function selectState(state) {
  const { facebookFriends, users, authMethods } = state;
  return { facebookFriends, users, authMethods };
}

function selectActions(dispatch) {
  return {
    getFacebookFriends: (...args) => dispatch(getFacebookFriends(...args)),
  };
}

class FriendList extends React.PureComponent {
  openAuthzPopup = async () => {
    const { accessToken } = await openOauthAuthzPopup('facebook');
    this.props.getFacebookFriends(this.props.profile.id, accessToken);
  };

  render() {
    const { profile, facebookFriends, users } = this.props;
    const friends = facebookFriends.friendIds.map((id) => users[id]);

    if (!profile) {
      return null;
    }

    return (
      <div>
        <TileList header={`Facebook friends: ${profile.displayName}`} users={friends} />
        {facebookFriends.inProgress &&
          <img width="16" height="16" src={throbber16} />
        }

        {facebookFriends.errorString &&
          <span className="error-string">{facebookFriends.errorString}</span>
        }

        {facebookFriends.needReauthorization &&
          <div>
            It seems like your access token has expired. You need to reauthorize your facebook account.
            <button className="btn btn-default btn-block" onClick={this.openAuthzPopup}>
              Reauthorize
            </button>
          </div>
        }
      </div>
    );
  }
}

class FacebookFriendLists extends React.PureComponent {
  render() {
    const {
      facebookFriends,
      users,
      authMethods,
      getFacebookFriends,
    } = this.props;

    if (!find(authMethods.profiles, { provider: 'facebook' })) {
      return null;
    }

    const lists = Object.keys(facebookFriends)
      .map((facebookId) => {
        const profile = find(authMethods.profiles, { provider: 'facebook', id: facebookId });

        return (
          <FriendList
            facebookFriends={facebookFriends[facebookId]}
            getFacebookFriends={getFacebookFriends}
            key={facebookId}
            profile={profile}
            users={users}
          />
        );
      });

    return (
      <div className="box">
        {lists}
      </div>
    );
  }
}

export default connect(selectState, selectActions)(FacebookFriendLists);
