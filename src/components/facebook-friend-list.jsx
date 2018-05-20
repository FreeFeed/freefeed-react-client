import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

import { getFacebookFriends } from '../redux/action-creators';
import { openOauthAuthzPopup } from '../services/auth';
import { tileUserListFactory, WITH_MUTUALS } from './tile-user-list';

const TileList = tileUserListFactory({
  type: WITH_MUTUALS,
  alwaysShowHeader: true,
  displayQuantity: true,
});

function selectState(state) {
  const { facebookFriends, users, user } = state;
  return { facebookFriends, users, user };
}

function selectActions(dispatch) {
  return {
    getFacebookFriends: (...args) => dispatch(getFacebookFriends(...args)),
  };
}

class FacebookFriendList extends React.PureComponent {
  openAuthzPopup = async () => {
    const { accessToken } = await openOauthAuthzPopup('facebook');
    this.props.getFacebookFriends({ accessToken });
  };

  render() {
    const {
      facebookFriends,
      users,
      user,
    } = this.props;

    if (!get(user, 'providers.facebook.id')) {
      return null;
    }

    const friends = facebookFriends.friendIds.map((id) => users[id]);

    return (
      <div className="box">
        <TileList header="Facebook friends" users={friends} />

        {facebookFriends.errorString &&
          <span className="error-string">{this.props.errorString}</span>
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

export default connect(selectState, selectActions)(FacebookFriendList);
