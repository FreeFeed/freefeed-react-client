import React from 'react';
import { connect } from 'react-redux';

import {joinPostData, postActions} from './select-utils';
import PaginatedView from './paginated-view';
import Feed from './feed';

class Summary extends React.Component {
  render() {
    const props = this.props;

    return (
      <div className="box">
        <div className="box-header-timeline">
          {props.boxHeader}
        </div>

        {props.isLoading || props.visibleEntries.length ? (
          <PaginatedView {...props}>
            <Feed {...props}/>
          </PaginatedView>
        ) : (
          <div className="search-no-results">
            <h4>No results</h4>
            <p>Please make sure that all words are spelled correctly or try different keywords.</p>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;
  const user = state.user;
  const authenticated = state.authenticated;
  const visibleEntries = state.feedViewState.visibleEntries.map(joinPostData(state));
  const boxHeader = state.boxHeader;

  return { isLoading, user, authenticated, visibleEntries, boxHeader };
}

function mapActionsToDispatch(dispatch) {
  return {
    ...postActions(dispatch),
  };
}

export default connect(mapStateToProps, mapActionsToDispatch)(Summary);
