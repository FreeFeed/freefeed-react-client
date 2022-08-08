import { faExclamationTriangle, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartO } from '@fortawesome/free-regular-svg-icons';

import { Icon } from '../fontawesome-icons';
import { Throbber } from '../throbber';
import { ButtonLink } from '../button-link';

const PostLikeLink = (props) => {
  const { didILikePost, likeError, onLikePost, onUnlikePost, isLiking, likes, isEditable } = props;

  return (
    <div className="post-footer-like">
      {likeError ? (
        <Icon icon={faExclamationTriangle} className="post-like-fail larger" title={likeError} />
      ) : null}
      {!isEditable ? (
        <ButtonLink className="post-action" onClick={didILikePost ? onUnlikePost : onLikePost}>
          {didILikePost ? (
            <Icon icon={faHeart} className="icon red larger" />
          ) : (
            <Icon icon={faHeartO} className="icon larger" />
          )}
        </ButtonLink>
      ) : (
        <ButtonLink className="post-action">
          {didILikePost ? (
            <Icon icon={faHeart} className="icon red larger" />
          ) : (
            <Icon icon={faHeartO} className="icon larger" />
          )}
        </ButtonLink>
      )}
      {isLiking ? (
        <div className="post-like-throbber">
          <Throbber />
        </div>
      ) : null}
      <div className="post-footer-counter">{likes}</div>
    </div>
  );
};

export default PostLikeLink;
