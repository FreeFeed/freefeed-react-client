import React from 'react';
import { Link } from 'react-router';
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

          <div className="sidelinks">
            {'View best of: '}
            {+props.params.days === 1 ? <b>day</b> : <Link to={`/summary/1`}>day</Link>}
            {' - '}
            {+(props.params.days||7) === 7 ? <b>week</b> : <Link to={`/summary/7`}>week</Link>}
            {' - '}
            {+props.params.days === 30 ? <b>month</b> : <Link to={`/summary/30`}>month</Link>}
          </div>
        </div>

        {props.isLoading || props.visibleEntries.length ? (
          <Feed {...props}/>
        ) : (
          <div className="summary-no-results">
            <p>No entries here yet. You might want to subscribe for more users and groups.</p>
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
