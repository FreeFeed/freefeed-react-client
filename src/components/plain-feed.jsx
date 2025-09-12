import { connect } from 'react-redux';

import { useNouter } from '../services/nouter';
import { joinPostData, postActions } from './select-utils';
import Feed from './feed';
import PaginatedView from './paginated-view';
import FeedOptionsSwitch from './feed-options-switch';
import ErrorBoundary from './error-boundary';

function FeedHandler(props) {
  const { name: routeName } = useNouter();
  return (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline" role="heading">
          {props.boxHeader}
          {routeName === 'everything' && (
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
}

function selectState(state) {
  const { authenticated, boxHeader, timelines, user } = state;
  const entries = state.feedViewState.entries.map(joinPostData(state));

  return { user, authenticated, entries, timelines, boxHeader };
}

function selectActions(dispatch) {
  return { ...postActions(dispatch) };
}

export default connect(selectState, selectActions)(FeedHandler);
