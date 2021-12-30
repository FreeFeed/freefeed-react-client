import { useMemo } from 'react';

import { handleLeftClick, pluralForm } from '../../../utils';
import { Throbber } from '../../throbber';
import ErrorBoundary from '../../error-boundary';
import { ButtonLink } from '../../button-link';

export default function ExpandComments({
  onExpand,
  entryUrl,
  omittedComments,
  omittedCommentLikes,
  isLoading = false,
}) {
  const text = useMemo(() => {
    let text = pluralForm(omittedComments, 'more comment');
    if (omittedCommentLikes > 0) {
      text += ` with ${pluralForm(omittedCommentLikes, 'like')}`;
    }
    return text;
  }, [omittedComments, omittedCommentLikes]);

  const onClick = useMemo(() => handleLeftClick(onExpand), [onExpand]);

  return (
    <div className="comment more-comments-wrapper">
      <ErrorBoundary>
        <span
          className="more-comments-throbber"
          aria-label={isLoading ? 'Loading comments...' : undefined}
        >
          {isLoading && <Throbber />}
        </span>
        <ButtonLink className="more-comments-link" href={entryUrl} onClick={onClick}>
          {text}
        </ButtonLink>
      </ErrorBoundary>
    </div>
  );
}
