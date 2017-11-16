import React from 'react';
import { connect } from 'react-redux';

import {joinPostData, postActions} from './select-utils';
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
          <Feed {...props}/>
        ) : (
          <div className="summary-no-results">
            <h4>No summary posts</h4>
            <p>This feed has no best posts for this period of time</p>
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
