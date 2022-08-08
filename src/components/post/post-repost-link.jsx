import { faShareSquare } from '@fortawesome/free-regular-svg-icons';

import { Link } from 'react-router';
import { Icon } from '../fontawesome-icons';
import { ButtonLink } from '../button-link';

const PostRepostLink = (props) => {
  const { backlinksCount, id } = props;
  return (
    <div className="post-footer">
      <div className="post-footer-icon">
        <ButtonLink className="post-action">
          <Icon icon={faShareSquare} className="post-footer-backlink-icon larger" />
        </ButtonLink>
      </div>
      <div className="post-footer-repost">
        <Link href={`/search?q=${encodeURIComponent(id)}`}>{backlinksCount}</Link>
      </div>
    </div>
  );
};

export default PostRepostLink;
