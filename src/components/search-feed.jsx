import React from 'react';
import {connect} from 'react-redux';
import {joinPostData, postActions} from './select-utils';
import Feed from './feed';
import PaginatedView from './paginated-view';
import SearchForm from './search-form';

const searchHelper =<div className='search-memo'>
  <div className='search-memo-header'>Advanced search operators</div>
  <div className='search-operator'>
    <span className='operator'>-</span>
    <span className='helper'>exclude keyword from a search, e.g.: <span className='example'>jobs -steve</span></span>
  </div>
  <div className='search-operator'>
    <span className='operator'>from:</span>
    <span className='helper'>return entries from a specific user, e.g.: <span className='example'>from:freefeed</span></span>
  </div>
  <div className='search-operator'>
    <span className='operator'>group:</span>
    <span className='helper'>return entries from a specific group, e.g.: <span className='example'>group:travel</span></span>
  </div>
</div>;

const FeedHandler = (props) => (
  <div className='box'>
    <div className='box-header-timeline'>
      {props.boxHeader}
    </div>
    {props.visibleEntries.length ? <PaginatedView {...props}>
      <Feed {...props}/>
    </PaginatedView> : searchHelper}
    <div className='box-footer'>
    </div>
  </div>
);


function selectState(state) {
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const timelines = state.timelines;
  const boxHeader = state.boxHeader;

  return { user, authenticated, visibleEntries, timelines, boxHeader };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
  };
}

export default connect(selectState, selectActions)(FeedHandler);
