import { useCallback, useRef, useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { intersection } from 'lodash';
import { faTimes, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import { faFlag } from '@fortawesome/free-regular-svg-icons';
import { unhidePost, hideByName, removeRecentlyHiddenPost } from '../../redux/action-creators';
import { initialAsyncState } from '../../redux/async-helpers';
import { safeScrollBy } from '../../services/unscroll';
import { Icon } from '../fontawesome-icons';
import { Throbber } from '../throbber';

export function PostRecentlyHidden({ id, initialTopOffset, isHidden, recipientNames }) {
  const dispatch = useDispatch();
  const hiddenUserNames = useSelector((state) => state.hiddenUserNames);
  const hideStatus = useSelector((state) => state.postHideStatuses[id] || initialAsyncState);
  const doUnhidePost = useCallback(() => dispatch(unhidePost(id)), [dispatch, id]);
  const doHideByName = useCallback(
    (name, hide) => () => dispatch(hideByName(name, id, hide)),
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

  const oneHiddenName = intersection(recipientNames, hiddenUserNames).length === 1;

  return (
    <div className="post recently-hidden-post">
      <div className="post-body">
        <a className="recently-hidden-post__close" onClick={doRemove} title="Remove this block">
          <Icon icon={faTimes} />
        </a>
        <p ref={firstLine}>
          {isHidden ? (
            <>
              Post hidden from your Home feed - <a onClick={doUnhidePost}>Un-hide</a>
            </>
          ) : (
            <>
              Post still not visible because{' '}
              {oneHiddenName ? 'its source is hidden' : 'of some hidden sources'}:
            </>
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

        {recipientNames.map((name) => {
          const hidden = hiddenUserNames.includes(name);
          return (
            <p key={name}>
              <a onClick={doHideByName(name, !hidden)}>
                {hidden ? 'Show' : 'Hide all'} posts from @{name}
              </a>
            </p>
          );
        })}
      </div>
    </div>
  );
}

export function HideLink({
  isHidden,
  hiddenByNames,
  unHideOpened,
  toggleUnHide,
  handleHideClick,
  handleFullUnhide,
}) {
  let text = '';
  let handler = null;
  if (!isHidden && !hiddenByNames) {
    // Post is not hidden
    text = <Icon icon={faFlag} className="post-footer-backlink-icon larger" />;
    handler = handleHideClick;
  } else if (unHideOpened) {
    // Unhide options are opened
    text = 'Un-hide (collapse)';
    handler = toggleUnHide;
  } else if (hiddenByNames && hiddenByNames.length === 1) {
    // Post is hidden by one (!) username
    text = `Show posts from @${hiddenByNames[0]}`;
    handler = handleFullUnhide;
  } else if (isHidden && !hiddenByNames) {
    // Post is only hidden individually
    text = 'Un-hide';
    handler = handleHideClick;
  } else {
    // Complex Un-hide
    text = 'Un-hide…';
    handler = toggleUnHide;
  }

  return (
    <a className="post-action" onClick={handler} role="button">
      {text}
    </a>
  );
}

export function UnhideOptions({ isHidden, hiddenByNames, handleUnhideByName, handleFullUnhide }) {
  const lines = [];
  if (isHidden) {
    let title = 'Un-hide this post';
    if (hiddenByNames) {
      if (hiddenByNames.length === 1) {
        title += ' and show its source';
      } else {
        title += ' and show all its sources';
      }
    }
    // eslint-disable-next-line react/jsx-key
    lines.push(['_post', <a onClick={handleFullUnhide}>{title}</a>]);
  }

  if (hiddenByNames) {
    lines.push(
      ...hiddenByNames.map((name) => [
        `@${name}`,
        // eslint-disable-next-line react/jsx-key
        <a onClick={handleUnhideByName(name)}>Show posts from @{name}</a>,
      ]),
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
