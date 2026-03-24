import { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';

import { parsePostLink } from '../../utils/post-link-utils';
import { getPostForPreview } from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
import UserName from '../user-name';
import { UserPicture } from '../user-picture';
import Linkify from '../linkify';
import { Link } from '../linkify-links';
import FoldableContent from './helpers/foldable-content';
import styles from './freefeed-post.module.scss';

const MAX_TEXT_LENGTH = 600;

export function canShowURL(url) {
  const parsed = parsePostLink(url);
  return parsed !== null;
}

// Shorten text without cutting words
function shortenText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  const suffix = '...';
  const maxTextLength = maxLength - suffix.length;
  const lastSpacePosition = text.lastIndexOf(' ', maxTextLength + 1);
  const cutIndex = lastSpacePosition > -1 ? lastSpacePosition : maxTextLength;

  return text.slice(0, Math.max(0, cutIndex)) + suffix;
}

export default memo(function FreeFeedPostPreview({ url }) {
  const dispatch = useDispatch();

  // Parse the URL to get postId
  const parsed = useMemo(() => parsePostLink(url), [url]);
  const { username, postId } = parsed || {};

  // Get preview status and data from Redux
  const previewStatus = useSelector(
    (state) => (postId && state.postPreviewStatuses?.[postId]) || initialAsyncState,
  );
  const postData = useSelector((state) => (postId && state.postPreviewsData?.[postId]) || null);
  const author = useSelector((state) =>
    postData?.createdBy && state.users ? state.users[postData.createdBy] : null,
  );

  // Load post data if not already loaded/loading
  useEffect(() => {
    if (postId && previewStatus.initial) {
      dispatch(getPostForPreview(postId));
    }
  }, [dispatch, postId, previewStatus.initial]);

  // Early return after all hooks
  if (!parsed) {
    return null;
  }

  // Show nothing while loading initially
  if (previewStatus.loading && !postData) {
    return (
      <div className="link-preview-content">
        <div className={cn(styles.preview, styles.loading)}>Loading post preview...</div>
      </div>
    );
  }

  // Show error message for inaccessible posts
  if (previewStatus.error || !postData) {
    return (
      <div className="link-preview-content">
        <div className={cn(styles.preview, styles.unavailable)}>
          Post /{username}/{postId} isn&apos;t available
        </div>
      </div>
    );
  }

  // Normalize text: remove line breaks and extra spaces
  const normalizedText = postData.body.trim().replace(/\s+/g, ' ');
  const displayText = shortenText(normalizedText, MAX_TEXT_LENGTH);

  // Construct post URL
  const postUrl = author ? `/${author.username}/${postId}` : `/${username}/${postId}`;

  return (
    <div className="link-preview-content">
      <FoldableContent maxUnfoldedHeight={250} foldedHeight={200}>
        <div className={styles.preview}>
          {author && (
            <div className={styles.header}>
              <UserPicture user={author} size={24} />
              <UserName user={author} />
            </div>
          )}
          <div className={styles.text}>
            <Linkify>{displayText}</Linkify>
          </div>
          <div className={styles.link}>
            <Link to={postUrl}>Go to the post →</Link>
          </div>
        </div>
      </FoldableContent>
    </div>
  );
});
