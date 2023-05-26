import { useCallback, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { uniqWith } from 'lodash-es';
import {
  unhidePost,
  removeRecentlyHiddenPost,
  hidePostsByCriterion,
} from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
import { safeScrollBy } from '../../services/unscroll';
import { Icon } from '../fontawesome-icons';
import { Throbber } from '../throbber';
import { hasCriterion, isEqual, USERNAME } from '../../utils/hide-criteria';
import { ButtonLink } from '../button-link';

export function PostRecentlyHidden({
  id,
  initialTopOffset,
  isHidden,
  availableHideCriteria,
  hiddenByCriteria,
}) {
  const dispatch = useDispatch();

  const hideStatus = useSelector((state) => state.postHideStatuses[id] || initialAsyncState);
  const doUnhidePost = useCallback(() => dispatch(unhidePost(id)), [dispatch, id]);
  const doHideByCriterion = useCallback(
    (criterion, hide) => () => dispatch(hidePostsByCriterion(criterion, id, hide)),
    [dispatch, id],
  );
  const doRemove = useCallback(() => dispatch(removeRecentlyHiddenPost(id)), [dispatch, id]);
  const firstLine = useRef();
  useLayoutEffect(() => {
    if (initialTopOffset === undefined || !firstLine.current) {
      return;
    }
    const firstLineOffset = firstLine.current.getBoundingClientRect().top;
    safeScrollBy(0, firstLineOffset - initialTopOffset);
  }, [initialTopOffset]);

  const oneCriterion = hiddenByCriteria?.length === 1;
  const hideReason = oneCriterion
    ? hiddenByCriteria[0].type === USERNAME
      ? 'its source is hidden'
      : 'it has a hidden hashtag'
    : 'of some hide criteria';

  return (
    <div className="post recently-hidden-post">
      <div className="post-body">
        <ButtonLink
          className="recently-hidden-post__close"
          onClick={doRemove}
          title="Remove this block"
        >
          <Icon icon={faTimes} />
        </ButtonLink>
        <p ref={firstLine}>
          {isHidden ? (
            <>
              Post hidden from your Home feed -{' '}
              <ButtonLink onClick={doUnhidePost}>Un-hide</ButtonLink>
            </>
          ) : (
            <>Post still not visible because {hideReason}:</>
          )}

          {hideStatus.loading && (
            <span className="post-hide-throbber">
              <Throbber />
            </span>
          )}
          {hideStatus.error && (
            <Icon
              icon={faExclamationTriangle}
              className="post-hide-fail"
              title={hideStatus.errorText}
            />
          )}
        </p>

        {uniqWith(availableHideCriteria, isEqual).map((crit) => {
          const hidden = hasCriterion(hiddenByCriteria || [], crit);
          return (
            <p key={`${crit.type}:${crit.value}`}>
              <ButtonLink onClick={doHideByCriterion(crit, !hidden)}>
                {hidden ? 'Show' : 'Hide all'} posts{' '}
                {crit.type === USERNAME ? `from @${crit.value}` : `with ${crit.value}`}
              </ButtonLink>
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function HideLink({
  isHidden,
  hiddenByCriteria,
  unHideOpened,
  toggleUnHide,
  handleHideClick,
  handleFullUnhide,
}) {
  let text = '';
  let handler = null;
  if (!isHidden && !hiddenByCriteria) {
    // Post is not hidden
    text = 'Hide';
    handler = handleHideClick;
  } else if (unHideOpened) {
    // Unhide options are opened
    text = 'Un-hide (collapse)';
    handler = toggleUnHide;
  } else if (hiddenByCriteria?.length === 1) {
    // Post is hidden by one (!) criterion
    const [crit] = hiddenByCriteria;
    text = `Show posts ${crit.type === USERNAME ? `from @${crit.value}` : `with ${crit.value}`}`;
    handler = handleFullUnhide;
  } else if (isHidden && !hiddenByCriteria) {
    // Post is only hidden individually
    text = 'Un-hide';
    handler = handleHideClick;
  } else {
    // Complex Un-hide
    text = 'Un-hide…';
    handler = toggleUnHide;
  }

  return (
    <ButtonLink className="post-action" onClick={handler}>
      {text}
    </ButtonLink>
  );
}

export function UnhideOptions({
  isHidden,
  hiddenByCriteria,
  handleUnhideByCriteria,
  handleFullUnhide,
}) {
  const lines = [];
  if (isHidden) {
    let title = 'Un-hide this post';
    if (hiddenByCriteria) {
      if (hiddenByCriteria.length === 1) {
        const [crit] = hiddenByCriteria;
        title += ` and show its ${crit.type === USERNAME ? 'source' : 'hashtag'}`;
      } else {
        title += ' and show all its sources/hashtags';
      }
    }
    // eslint-disable-next-line react/jsx-key
    lines.push(['_post', <ButtonLink onClick={handleFullUnhide}>{title}</ButtonLink>]);
  }

  if (hiddenByCriteria) {
    lines.push(
      ...hiddenByCriteria.map((crit) => {
        const text = `Show posts ${
          crit.type === USERNAME ? `from @${crit.value}` : `with ${crit.value}`
        }`;
        return [
          `${crit.type}:${crit.value}`,
          // eslint-disable-next-line react/jsx-key
          <ButtonLink onClick={handleUnhideByCriteria(crit)}>{text}</ButtonLink>,
        ];
      }),
    );
  }

  return (
    <div className="post-unhide-block">
      {lines.map(([key, line]) => (
        <p key={key}>{line}</p>
      ))}
    </div>
  );
}
