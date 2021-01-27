import { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';

import { joinPostData, postActions } from './select-utils';
import Feed from './feed';

class Summary extends Component {
  render() {
    const { props } = this;
    const days = props.params.days ? parseInt(props.params.days) : 7;

    return (
      <div className="box">
        <div className="box-header-timeline" role="heading">
          {props.boxHeader}

          <div className="sidelinks">
            <span>View best of: </span>
            {days === 1 ? <b>day</b> : <Link to={`/summary/1`}>day</Link>}
            {' - '}
            {days === 7 ? <b>week</b> : <Link to={`/summary/7`}>week</Link>}
            {' - '}
            {days === 30 ? <b>month</b> : <Link to={`/summary/30`}>month</Link>}
          </div>
        </div>

        <div className="box-body">
          <Feed
            {...props}
            emptyFeedMessage={<p>You might want to subscribe for more users and groups.</p>}
          />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const isLoading = state.routeLoadingState;
  const { authenticated, boxHeader, user } = state;
  const entries = state.feedViewState.entries.map(joinPostData(state));

  return { isLoading, user, authenticated, entries, boxHeader };
}

function mapActionsToDispatch(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(mapStateToProps, mapActionsToDispatch)(Summary);
