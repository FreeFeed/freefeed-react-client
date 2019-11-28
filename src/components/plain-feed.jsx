import React from 'react';
import { connect } from 'react-redux';

import { joinPostData, postActions } from './select-utils';
import Feed from './feed';
import PaginatedView from './paginated-view';
import FeedOptionsSwitch from './feed-options-switch';
import ErrorBoundary from './error-boundary';

const FeedHandler = (props) => (
  <div className="box">
    <ErrorBoundary>
      <div className="box-header-timeline">
        {props.boxHeader}
        {props.route.name === 'everything' && (
          <div className="pull-right">
            <FeedOptionsSwitch />
          </div>
        )}
      </div>
      <PaginatedView {...props}>
        <Feed {...props} />
      </PaginatedView>
      <div className="box-footer" />
    </ErrorBoundary>
  </div>
);

function selectState(state) {
  const { authenticated, boxHeader, timelines, user } = state;
  const entries = state.feedViewState.entries.map(joinPostData(state));

  return { user, authenticated, entries, timelines, boxHeader };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(FeedHandler);
