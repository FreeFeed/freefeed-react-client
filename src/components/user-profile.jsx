import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { pluralForm } from '../utils';
import CreatePost from './create-post';
import ErrorBoundary from './error-boundary';
import { UserProfileHead } from './user-profile-head';
import { SubscriptionRequestsAlert } from './susbscription-requests-alert';

export default function UserProfile(props) {
  const authenticated = useSelector((state) => state.authenticated);
  const groupRequestsCount =
    props.type === 'group' && props.authenticated
      ? (props.managedGroups.find((g) => g.id === props.id) || { requests: [] }).requests.length
      : 0;

  return (
    <div>
      <ErrorBoundary>
        {props.isItMe && !props.isLoading ? <SubscriptionRequestsAlert /> : false}

        {groupRequestsCount > 0 && (
          <p className="subscriptions-request-alert">
            <span className="message">
              You have{' '}
              <Link to="/groups">{pluralForm(groupRequestsCount, 'subscription request')}</Link> to
              this group
            </span>
          </p>
        )}

        <UserProfileHead />

        {props.canIPostHere && (
          <CreatePost
            createPostViewState={props.createPostViewState}
            sendTo={props.sendTo}
            user={props.user}
            createPost={props.createPost}
            resetPostCreateForm={props.resetPostCreateForm}
            expandSendTo={props.expandSendTo}
            addAttachmentResponse={props.addAttachmentResponse}
            showMedia={props.showMedia}
          />
        )}

        {authenticated && !props.canIPostHere && props.isRestricted === '1' && (
          <div className="create-post create-post-restricted">
            Only administrators can post to this group.
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
