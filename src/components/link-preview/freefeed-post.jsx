import { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';

import { parsePostLink, parseCommentLink } from '../../utils/post-link-utils';
import { getPostForPreview, getCommentForPreview } from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
import UserName from '../user-name';
import { UserPicture } from '../user-picture';
import Linkify from '../linkify';
import { Link } from '../linkify-links';
import FoldableContent from './helpers/foldable-content';
import styles from './freefeed-post.module.scss';
import TimeDisplay from '../time-display';
import { Link as RouterLink } from '../../services/nouter';

const MAX_TEXT_LENGTH = 600;

export function canShowURL(url) {
  const parsed = parsePostLink(url);
  return parsed !== null;
}

export function canShowCommentURL(url) {
  const parsed = parseCommentLink(url);
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

  // Try to parse as comment link first, then as post link
  const commentParsed = useMemo(() => parseCommentLink(url), [url]);
  const postParsed = useMemo(() => parsePostLink(url), [url]);

  // Determine if this is a comment or post preview
  const isComment = commentParsed !== null;
  const parsed = commentParsed || postParsed;
  const { username, postId } = parsed || {};
  const commentId = commentParsed?.commentId;

  // Build Redux key for comment previews
  const commentKey = postId && commentId ? `${postId}#${commentId}` : null;

  // Get preview status and data from Redux (different keys for comments vs posts)
  const postPreviewStatus = useSelector(
    (state) => (postId && !isComment && state.postPreviewStatuses?.[postId]) || initialAsyncState,
  );
  const postData = useSelector(
    (state) => (postId && !isComment && state.postPreviewsData?.[postId]) || null,
  );
  const commentPreviewStatus = useSelector(
    (state) => (commentKey && state.commentPreviewStatuses?.[commentKey]) || initialAsyncState,
  );
  const commentData = useSelector(
    (state) => (commentKey && state.commentPreviewsData?.[commentKey]) || null,
  );

  // Select the appropriate status and data based on type
  const previewStatus = isComment ? commentPreviewStatus : postPreviewStatus;
  const previewData = isComment ? commentData : postData;

  // Get author from users store
  const author = useSelector((state) =>
    previewData?.createdBy && state.users ? state.users[previewData.createdBy] : null,
  );

  // Load data if not already loaded/loading
  useEffect(() => {
    if (isComment && commentKey && commentPreviewStatus.initial) {
      dispatch(getCommentForPreview(postId, commentId));
    } else if (!isComment && postId && postPreviewStatus.initial) {
      dispatch(getPostForPreview(postId));
    }
  }, [
    dispatch,
    isComment,
    postId,
    commentId,
    commentKey,
    commentPreviewStatus.initial,
    postPreviewStatus.initial,
  ]);

  // Early return after all hooks
  if (!parsed) {
    return null;
  }

  // Determine loading/error messages based on type
  const loadingMessage = isComment ? 'Loading comment preview...' : 'Loading post preview...';
  const unavailableMessage = isComment
    ? `Comment isn't available`
    : `Post /${username}/${postId} isn't available`;

  // Show nothing while loading initially
  if (previewStatus.loading && !previewData) {
    return (
      <div className="link-preview-content">
        <div className={cn(styles.preview, styles.loading)}>{loadingMessage}</div>
      </div>
    );
  }

  // Show error message for inaccessible content
  if (previewStatus.error || !previewData) {
    return (
      <div className="link-preview-content">
        <div className={cn(styles.preview, styles.unavailable)}>{unavailableMessage}</div>
      </div>
    );
  }

  // Normalize text: remove line breaks and extra spaces
  const normalizedText = previewData.body.trim().replace(/\s+/g, ' ');
  const displayText = shortenText(normalizedText, MAX_TEXT_LENGTH);

  // Construct target URL (use original url for comments, construct post URL for posts)
  const targetUrl = isComment
    ? url
    : author
      ? `/${author.username}/${postId}`
      : `/${username}/${postId}`;
  const linkText = isComment ? 'Go to the comment' : 'Go to the post';

  return (
    <div className="link-preview-content">
      <FoldableContent maxUnfoldedHeight={250} foldedHeight={200}>
        <div className={styles.preview}>
          {author && (
            <div className={styles.header}>
              <UserPicture user={author} size={24} />
              <div>
                {isComment ? (
                  <>
                    Comment from <UserName user={author} className={styles.author} />
                    {', '}
                    <RouterLink to={targetUrl} className={styles.dateLink}>
                      <TimeDisplay timeStamp={+previewData.createdAt} inline />
                    </RouterLink>
                  </>
                ) : (
                  <>
                    <UserName user={author} className={styles.author} />
                    {', '}
                    <RouterLink to={targetUrl} className={styles.dateLink}>
                      <TimeDisplay timeStamp={+previewData.createdAt} inline />
                    </RouterLink>
                  </>
                )}
              </div>
            </div>
          )}
          <div className={styles.text}>
            <Linkify>{displayText}</Linkify>
          </div>
          <div className={styles.link}>
            <Link to={targetUrl}>{linkText}</Link>
          </div>
        </div>
      </FoldableContent>
    </div>
  );
});
