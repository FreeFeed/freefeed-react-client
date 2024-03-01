import { connect } from 'react-redux';
import { createPost, resetPostCreateForm } from '../redux/action-creators';
import formatInvitation from '../utils/format-invitation';
import { postActions } from './select-utils';

import CreatePost from './create-post';
import Feed from './feed';
import PaginatedView from './paginated-view';
import FeedOptionsSwitch from './feed-options-switch';
import ErrorBoundary from './error-boundary';

const FeedHandler = (props) => {
  const createPostComponent = (
    <CreatePost
      key={props.isDirects ? 'directs' : 'discussions'}
      sendTo={props.sendTo}
      isDirects={props.isDirects}
    />
  );

  const emptyFeedMessage = props.isSaves && (
    <p>
      To save a post, click the Save link under the post body. Saved posts will appear on this page.
    </p>
  );

  return (
    <div className="box">
      <ErrorBoundary>
        <div className="box-header-timeline" role="heading">
          {props.boxHeader}
          <div className="pull-right">
            <FeedOptionsSwitch />
          </div>
        </div>
        <PaginatedView firstPageHead={props.isSaves || createPostComponent} {...props}>
          <Feed {...props} emptyFeedMessage={emptyFeedMessage} />
        </PaginatedView>
        <div className="box-footer" />
      </ErrorBoundary>
    </div>
  );
};

function selectState(state) {
  const { authenticated, boxHeader, timelines, user } = state;
  const isDirects = state.routing.locationBeforeTransitions.pathname.includes('direct');
  const isSaves = state.routing.locationBeforeTransitions.pathname.includes('saves');
  const defaultFeed =
    state.routing.locationBeforeTransitions.query.to || (!isDirects && user.username) || undefined;
  const invitation = formatInvitation(state.routing.locationBeforeTransitions.query.invite);
  const sendTo = { defaultFeed, invitation };

  return {
    user,
    authenticated,
    timelines,
    boxHeader,
    sendTo,
    isDirects,
    isSaves,
  };
}

function selectActions(dispatch) {
  return {
    ...postActions(dispatch),
    createPost: (feeds, postText, attachmentIds, more) =>
      dispatch(createPost(feeds, postText, attachmentIds, more)),
    resetPostCreateForm: (...args) => dispatch(resetPostCreateForm(...args)),
  };
}

export default connect(selectState, selectActions)(FeedHandler);
