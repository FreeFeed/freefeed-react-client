import { useEvent } from 'react-use-event-hook';
import { forwardRef } from 'react';
import { createPath } from 'history';
import { useNouter } from '../hooks';
import { withoutQuery } from '../utils';

export const Link = forwardRef(function Link(
  { to: originalTo, as: As = 'a', onClick: passedOnClick, ...props },
  ref,
) {
  const { history } = useNouter();

  let to = originalTo;
  if (typeof originalTo === 'object' && originalTo !== null) {
    to = withoutQuery(originalTo);
  }

  const href = createHref(to);

  const onClick = useEvent((e) => {
    passedOnClick?.(e);

    if (
      isExternalLink(to) ||
      props.target ||
      props.download ||
      e.shiftKey ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.button !== 0 ||
      e.defaultPrevented
    ) {
      return;
    }

    e.preventDefault();
    const method = createHref(history.location) === href ? 'replace' : 'push';
    history[method](to);
  });
  return <As ref={ref} {...props} href={href} onClick={onClick} />;
});

function isExternalLink(to) {
  if (typeof to !== 'string') {
    return false;
  }
  try {
    const url = new URL(to);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function createHref(to) {
  return typeof to === 'string' ? to : createPath(to); // eslint-disable-line no-nested-ternary
}
