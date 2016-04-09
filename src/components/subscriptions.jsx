import React from 'react';
import {connect} from 'react-redux';

import {Link} from 'react-router';
import SubsList from './subs-list';


const SubscriptionsHandler = (props) => {
  return (
    <div className='box'>
      <div className='box-header-timeline'>
        {props.boxHeader}
      </div>
      <div className='box-body'>
        <div><Link to={`/${props.username}`}>{props.username}</Link> › Subscriptions</div>
        <SubsList {...props} title='Subscriptions' />
      </div>
      <div className='box-footer'></div>
    </div>
  );
};

function selectState(state, ownProps) {
  const boxHeader = state.boxHeader;
  const username = ownProps.params.userName;
  const users = _.sortBy(state.usernameSubscriptions.payload, 'username');
  const isPending = state.usernameSubscriptions.isPending;
  const errorString = state.usernameSubscriptions.errorString;

  return { boxHeader, username, users, isPending, errorString };
}

export default connect(selectState)(SubscriptionsHandler);
