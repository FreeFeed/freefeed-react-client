import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '../fontawesome-icons';
import { Throbber } from '../throbber';
import { ButtonLink } from '../button-link';

const PostLikeLink = (props) => {
  const { didILikePost, likeError, onLikePost, onUnlikePost, isLiking } = props;

  return (
    <>
      {likeError ? (
        <Icon icon={faExclamationTriangle} className="post-like-fail" title={likeError} />
      ) : null}
      <ButtonLink className="post-action" onClick={didILikePost ? onUnlikePost : onLikePost}>
        {didILikePost ? 'Un-like' : 'Like'}
      </ButtonLink>
      {isLiking ? (
        <span className="post-like-throbber">
          <Throbber />
        </span>
      ) : null}
    </>
  );
};

export default PostLikeLink;
