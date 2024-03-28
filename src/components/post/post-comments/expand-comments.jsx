/* global CONFIG */
import { useMemo } from 'react';

import { handleLeftClick, pluralForm } from '../../../utils';
import { Throbber } from '../../throbber';
import ErrorBoundary from '../../error-boundary';
import { ButtonLink } from '../../button-link';

const foldConf = CONFIG.commentsFolding;

export default function ExpandComments({
  onExpand,
  entryUrl,
  omittedComments,
  omittedCommentLikes,
  minToSteppedFold = foldConf.minToSteppedFold,
  foldStep = foldConf.foldStep,
  isLoading = false,
}) {
  const stepped = omittedComments >= minToSteppedFold;
  const text = useMemo(() => {
    let text = pluralForm(omittedComments, 'more comment');
    if (omittedCommentLikes > 0) {
      text += ` with ${pluralForm(omittedCommentLikes, 'like')}`;
    }
    return text;
  }, [omittedCommentLikes, omittedComments]);

  const showAll = useMemo(() => handleLeftClick(() => onExpand(0)), [onExpand]);
  const showStep = useMemo(() => handleLeftClick(() => onExpand(foldStep)), [foldStep, onExpand]);

  return (
    <div className="comment more-comments-wrapper">
      <ErrorBoundary>
        <span
          className="more-comments-throbber"
          aria-label={isLoading ? 'Loading comments...' : undefined}
        >
          {isLoading && <Throbber />}
        </span>
        <ButtonLink className="more-comments-link" href={entryUrl} onClick={showAll}>
          {text}
        </ButtonLink>
        {stepped && (
          <>
            {' '}
            (
            <ButtonLink className="more-comments-link" href={entryUrl} onClick={showStep}>
              show last {foldStep}
            </ButtonLink>
            )
          </>
        )}
      </ErrorBoundary>
    </div>
  );
}
