import { faExclamationTriangle, faHeart } from '@fortawesome/free-solid-svg-icons';

import { Icon } from '../fontawesome-icons';
import { Throbber } from '../throbber';
import { ButtonLink } from '../button-link';

const PostLikeLink = (props) => {
  const { didILikePost, likeError, onLikePost, onUnlikePost, isLiking, likes, isEditable } = props;

  return (
    <div className="post-footer-like">
      {likeError ? (
        <Icon icon={faExclamationTriangle} className="post-like-fail" title={likeError} />
      ) : null}
      {isEditable ? (
        <ButtonLink className="post-action" onClick={didILikePost ? onUnlikePost : onLikePost}>
          {didILikePost ? (
            <Icon icon={faHeart} className="icon red" />
          ) : (
            <Icon icon={faHeart} className="icon" />
          )}
        </ButtonLink>
      ) : (
        <ButtonLink className="post-action">
          {didILikePost ? (
            <Icon icon={faHeart} className="icon red" />
          ) : (
            <Icon icon={faHeart} className="icon" />
          )}
        </ButtonLink>
      )}
      {isLiking ? (
        <div className="post-like-throbber">
          <Throbber />
        </div>
      ) : null}
      {likes}
    </div>
  );
};

export default PostLikeLink;
