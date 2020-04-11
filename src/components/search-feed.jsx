import React from 'react';
import { connect } from 'react-redux';
import { joinPostData, postActions } from './select-utils';
import Feed from './feed';
import PaginatedView from './paginated-view';
import { lazyComponent } from './lazy-component';

const SearchHelp = lazyComponent(() => import('./search-help.md'), {
  fallback: <div>Loading search help...</div>,
  errorMessage: "Couldn't load search help",
});

const FeedHandler = (props) => (
  <div className="box">
    <div className="box-header-timeline">{props.boxHeader}</div>
    {props.entries.length ? (
      <PaginatedView {...props}>
        <Feed {...props} />
      </PaginatedView>
    ) : (
      <div className="box-body">
        <SearchHelp />
      </div>
    )}
    <div className="box-footer" />
  </div>
);

function selectState(state) {
  const { authenticated, boxHeader, highlightTerms, timelines, user } = state;
  const entries = state.feedViewState.entries.map(joinPostData(state));

  return { user, authenticated, entries, timelines, boxHeader, highlightTerms };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(FeedHandler);
