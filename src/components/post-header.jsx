import UserName from './user-name';
import PostVia from './post-via';

const PostHeader = (props) => {
  const { recipients, createdBy, comments, usersLikedPost, isDirect, user, isInHomeFeed } = props;

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

  const recipientsToRender = omitRecipients
    ? false
    : recipients.map((recipient, index) => (
        <span key={index}>
          <UserName className="post-recipient" user={recipient}>
            {recipientCustomDisplay(recipient)}
          </UserName>
          {index < recipients.length - 2 ? ', ' : false}
          {index === recipients.length - 2 ? ' and ' : false}
        </span>
      ));

  return (
    <div className="post-header">
      <UserName className="post-author" user={createdBy} />
      {recipientsToRender.length > 0 ? ' to ' : isDirect ? ' to nobody ' : false}
      {recipientsToRender}
      {isInHomeFeed ? (
        <PostVia post={{ createdBy, recipients, comments, usersLikedPost }} me={user} />
      ) : (
        false
      )}
    </div>
  );
};

export default PostHeader;
