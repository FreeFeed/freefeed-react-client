import React from 'react';
import { connect } from 'react-redux';
import { joinPostData, postActions } from './select-utils';
import Feed from './feed';
import PaginatedView from './paginated-view';

const FeedHandler = (props) => (
  <div className='box'>
    <div className='box-header-timeline'>
      {props.boxHeader}
    </div>
    <PaginatedView {...props}>
      <Feed {...props}/>
    </PaginatedView>
    <div className='box-footer'>
    </div>
  </div>
);


function selectState(state) {
  const { authenticated, boxHeader, timelines, user } = state;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));

  return { user, authenticated, visibleEntries, timelines, boxHeader };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
  };
}

export default connect(selectState, selectActions)(FeedHandler);
