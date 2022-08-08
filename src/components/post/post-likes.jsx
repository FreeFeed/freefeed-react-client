import { faHeart } from '@fortawesome/free-solid-svg-icons';

import { preventDefault, pluralForm } from '../../utils';
import ErrorBoundary from '../error-boundary';
import { Icon } from '../fontawesome-icons';
import { UserPicture } from '../user-picture';

const renderLike = (item) => (
  <li key={item.id} className="post-like">
    {item.id !== 'more-likes' ? (
      <UserPicture user={item} className="more-post-likes-link" small="true" />
    ) : (
      <a className="more-post-likes-link" onClick={preventDefault(item.showMoreLikes)}>
        {item.omittedLikes}
      </a>
    )}
  </li>
);

export default ({ likes, showMoreLikes, post }) => {
  if (likes.length === 0) {
    return <div />;
  }

  // Make a copy to prevent props modification
  const likeList = [...likes];

  if (post.omittedLikes) {
    likeList.push({
      id: 'more-likes',
      omittedLikes: post.omittedLikes,
      showMoreLikes: () => showMoreLikes(post.id),
    });
  }

  const renderedLikes = likeList.map(renderLike);

  return (
    <div className="post-likes" aria-label={pluralForm(likes.length, 'like')}>
      <ErrorBoundary>
        <Icon icon={faHeart} className="icon" />
        <ul className="post-likes-list">{renderedLikes}</ul>
      </ErrorBoundary>
    </div>
  );
};
