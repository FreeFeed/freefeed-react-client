import React, { useCallback, memo } from 'react';

// Inspired by https://www.w3.org/TR/wai-aria-practices/examples/button/button.html
export const ButtonLink = memo(function ButtonLink({ onClick: click, disabled = false, ...props }) {
  const onClick = useCallback((event) => disabled || click(event), [click, disabled]);

  const onFocus = useCallback((event) => disabled && event.target.blur(), [disabled]);

  const onKeyDown = useCallback(
    (event) => {
      if (event.keyCode === 32) {
        event.preventDefault();
      } else if (event.keyCode === 13) {
        event.preventDefault();
        onClick(event);
      }
    },
    [onClick],
  );

  const onKeyUp = useCallback(
    (event) => {
      if (event.keyCode === 32) {
        event.preventDefault();
        onClick(event);
      }
    },
    [onClick],
  );

  return (
    <a
      role="button"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onFocus={onFocus}
      {...props}
    />
  );
});
