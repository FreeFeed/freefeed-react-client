import { faShare } from '@fortawesome/free-solid-svg-icons';

import { Link } from 'react-router';
import { Icon } from '../fontawesome-icons';

const PostRepostLink = (props) => {
  const { backlinksCount, id } = props;
  return (
    <div className="post-footer">
      <div className="post-footer-icon">
        <Icon icon={faShare} className="post-footer-backlink-icon" />
      </div>
      <div className="post-footer-repost">
        <Link href={`/search?q=${encodeURIComponent(id)}`}>{backlinksCount}</Link>
      </div>
    </div>
  );
};

export default PostRepostLink;
