import React from 'react';
import {Link} from 'react-router';

import throbber16 from '../../assets/images/throbber-16.gif';
import {preventDefault, pluralForm} from '../utils';
import CreatePost from './create-post';
import PieceOfText from './piece-of-text';

export default class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isUnsubWarningDisplayed: false };
  }

  componentWillReceiveProps = () => {
    this.setState({ isUnsubWarningDisplayed: false });
  }

  render() {
    const props = this.props;

    const unsubscribe = () => {
      if (props.amIGroupAdmin) {
        this.setState({ isUnsubWarningDisplayed: true });
      } else {
        props.unsubscribe({ username: props.username, id: props.id });
      }
    };

    return (
      <div>
        {!props.isLoading && !props.isUserFound ? (
          <h2>404 Not Found</h2>
        ) : (
          <div className="profile">
            <div className="row">
              <div className="col-sm-9 col-xs-12">
                <div className="avatar">
                  <img src={props.profilePictureLargeUrl} width="75" height="75"/>
                </div>
                <div className="description">
                  <div className="name" dir="auto">{props.screenName}</div>
                  <PieceOfText text={props.description} isExpanded={true}/>
                </div>
              </div>
              {props.statistics && !props.blocked ? (
                <div className="col-sm-3 col-xs-12">
                  <div className="profile-stats">
                    {props.type !== 'group' && props.statistics.subscriptions >= 0 ? (
                      <div className="profile-stats-item">
                        {props.canISeeSubsList ? (
                          <Link to={`/${props.username}/subscriptions`}>{pluralForm(props.statistics.subscriptions, 'subscription')}</Link>
                        ) : (
                          pluralForm(props.statistics.subscriptions, 'subscription')
                        )}
                      </div>
                    ) : false}
                    {' '}
                    {props.statistics.subscribers >= 0 ? (
                      <div className="profile-stats-item">
                        {props.canISeeSubsList ? (
                          <Link to={`/${props.username}/subscribers`}>{pluralForm(props.statistics.subscribers, 'subscriber')}</Link>
                        ) : (
                          pluralForm(props.statistics.subscribers, 'subscriber')
                        )}
                      </div>
                    ) : false}
                    {' '}
                    {props.type !== 'group' && props.statistics.comments >= 0 ? (
                      <div className="profile-stats-item">
                        <Link to={`/${props.username}/comments`}>{pluralForm(props.statistics.comments, 'comment')}</Link>
                      </div>
                    ) : false}
                    {' '}
                    {props.type !== 'group' && props.statistics.likes >= 0 ? (
                      <div className="profile-stats-item">
                        <Link to={`/${props.username}/likes`}>{pluralForm(props.statistics.likes, 'like')}</Link>
                      </div>
                    ) : false}
                  </div>
                </div>
              ) : false}
            </div>
          </div>
        )}

        {props.authenticated && props.isUserFound && !props.isItMe && !props.blocked ? (
          <div className="profile-controls">
            <div className="row">
              <div className="col-xs-7 col-sm-9 subscribe-controls">
                {props.isPrivate === '1' && !props.subscribed ? (
                  props.hasRequestBeenSent ? (
                    <span><b>{props.screenName}</b> has been sent your subscription request.</span>
                  ) : (
                    <a onClick={()=>props.sendSubscriptionRequest({username: props.username, id: props.id})}>Request a subscription</a>
                  )
                ) : (
                  props.subscribed ? (
                    <a onClick={() => unsubscribe()}>Unsubscribe</a>
                  ) : (
                    <a onClick={() => props.subscribe({username: props.username, id: props.id})}>Subscribe</a>
                  )
                )}

                {props.userView.isSubscribing ? (
                  <span className="profile-controls-throbber">
                  <img width="16" height="16" src={throbber16}/>
                </span>
                ) : false}
              </div>
              <div className="col-xs-5 col-sm-3 text-right">
                {props.type !== 'group' && !props.subscribed ? (
                  <a onClick={preventDefault(()=>props.ban({username: props.username, id: props.id}))}>Block this user</a>
                ) : props.amIGroupAdmin ? (
                  <Link to={`/${props.username}/settings`}>Settings</Link>
                ) : false}
              </div>
            </div>
            {this.state.isUnsubWarningDisplayed ? (
              <div className="row">
                <div className="col-xs-12">
                  <p className="group-warning">
                    You are the Admin for this group. If you want to unsubscribe please drop administrative privileges first
                    at <Link to={`/${props.username}/manage-subscribers`}>manage subscribers</Link> page
                  </p>
                </div>
              </div>
            ) : false}
          </div>
        ) : false}

        {props.canIPostHere ? (
          <CreatePost
            createPostViewState={props.createPostViewState}
            sendTo={props.sendTo}
            user={props.user}
            createPost={props.createPost}
            resetPostCreateForm={props.resetPostCreateForm}
            expandSendTo={props.expandSendTo}
            createPostForm={props.createPostForm}
            addAttachmentResponse={props.addAttachmentResponse}
            removeAttachment={props.removeAttachment}/>
        ) : false}

        {!props.canIPostHere && props.isRestricted === '1' ? (
          <div className="create-post create-post-restricted">
            Only administrators can post to this group.
          </div>
          ) : false}
      </div>
    );
  }
}
