import { Link } from 'react-router';
import UserName from '../user-name';
import TimeDisplay from '../time-display';
import { canonicalURI } from '../../utils/canonical-uri';
import PostVia from './post-via';
import PostMoreLink from './post-more-link';

const PostHeader = (props) => {
  const {
    recipients,
    createdBy,
    comments,
    usersLikedPost,
    isDirect,
    user,
    isInHomeFeed,
    post,
    toggleEditingPost,
    toggleModeratingComments,
    disableComments,
    enableComments,
    deletePost,
    toggleSave,
    isPrivate,
    isProtected,
    siteTitle,
    forceAbsTimestamps,
  } = props;

  const recipientCustomDisplay = function (recipient) {
    if (recipient.id !== createdBy.id) {
      return false;
    }

    const lastCharacter = recipient.username[recipient.username.length - 1];
    const suffix = lastCharacter === 's' ? '\u2019 feed' : '\u2019s feed';

    return `${recipient.username}${suffix}`;
  };

  let omitRecipients = false;

  // Check if the post has been only submitted to one recipient
  // and if we can omit it
  if (recipients.length === 1) {
    // If the post is in user/group feed (one-source list), we should omit
    // the only recipient, since it would be that feed.
    if (recipients[0].id === createdBy.id) {
      // When in a many-sources list (Home, Direct messages, My discussions),
      // we should omit the only recipient if it's the author's feed.
      omitRecipients = true;
    }
  }
  const canonicalPostURI = canonicalURI(post);
  const recipientsToRender = omitRecipients
    ? false
    : recipients.map((recipient, index) => (
        <div className="post-recipient" key={index}>
          <UserName className="post-recipient" user={recipient}>
            {recipientCustomDisplay(recipient)}
          </UserName>
          {index < recipients.length - 2 ? ', ' : false}
          {index === recipients.length - 2 ? ' and ' : false}
        </div>
      ));

  return (
    <div className="post-header">
      <div className="left-username">
        {isInHomeFeed ? (
          <PostVia post={{ createdBy, recipients, comments, usersLikedPost }} me={user} />
        ) : (
          false
        )}
        <div className="username-time">
          <UserName
            className="post-author"
            user={createdBy}
            isPrivate={isPrivate}
            isProtected={isProtected}
            siteTitle={siteTitle}
          />
          <Link to={canonicalPostURI} className="post-timestamp">
            <TimeDisplay timeStamp={+post.createdAt} absolute={forceAbsTimestamps} />
          </Link>
        </div>
        <div className="recipients">
          {recipientsToRender.length > 0 ? ' ' : isDirect ? ' ' : false}
          {recipientsToRender}
        </div>
      </div>

      <div className="more">
        <PostMoreLink
          user={user}
          post={post}
          toggleEditingPost={toggleEditingPost}
          toggleModeratingComments={toggleModeratingComments}
          disableComments={disableComments}
          enableComments={enableComments}
          deletePost={deletePost}
          toggleSave={toggleSave}
        />
      </div>
    </div>
  );
};

export default PostHeader;
