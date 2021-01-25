import { connect } from 'react-redux';
import { Link } from 'react-router';
import _ from 'lodash';

import SubsList from './subs-list';

const SubscriptionsHandler = (props) => {
  return (
    <div className="box">
      <div className="box-header-timeline" role="heading">
        {props.boxHeader}
      </div>
      <div className="box-body">
        <div>
          <Link to={`/${props.username}`}>{props.username}</Link> › Subscriptions
        </div>
        <SubsList {...props} title="Subscriptions" />
      </div>
      <div className="box-footer" />
    </div>
  );
};

function selectState(state, ownProps) {
  const { boxHeader } = state;
  const { errorString, isPending } = state.usernameSubscriptions;
  const username = ownProps.params.userName;

  const isMyPage = state.user.username === username;
  const subscribersUsernames =
    state.usernameSubscribers.payload &&
    state.usernameSubscribers.payload.map((user) => user.username);

  const listSections = [
    { title: 'Users', users: [] },
    { title: 'Groups', users: [] },
  ];

  _.sortBy(state.usernameSubscriptions.payload, 'username').forEach((u) => {
    // "mutual" markings should be displayed only if browsing my own subscriptions
    u.isMutual = isMyPage && subscribersUsernames.includes(u.username);
    listSections[u.type === 'user' ? 0 : 1].users.push(u);
  });

  return { boxHeader, username, listSections, isPending, errorString };
}

export default connect(selectState)(SubscriptionsHandler);
