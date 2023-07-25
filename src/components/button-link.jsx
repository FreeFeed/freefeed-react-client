import { useCallback, memo, forwardRef, useMemo } from 'react';

// Inspired by https://www.w3.org/TR/wai-aria-practices/examples/button/button.html
export const ButtonLink = memo(
  forwardRef(function ButtonLink(
    { tag: Tag = 'a', onClick: click, disabled = false, ...props },
    ref,
  ) {
    const kbdHandlers = useKeyboardEvents(
      useCallback((event) => disabled || click(event), [click, disabled]),
    );

    return (
      <Tag
        role="button"
        aria-disabled={disabled}
        tabIndex={0}
        ref={ref}
        {...kbdHandlers}
        {...props}
      />
    );
  }),
);

ButtonLink.displayName = 'ButtonLink';

export function useKeyboardEvents(onClick) {
  return useMemo(
    () => ({
      onClick: (event) => {
        /**
         * This line is crashes in jsdom environment with message
         * [TypeError: Failed to execute 'contains' on 'Node': parameter 1 is not of type 'Node'.]
         */
        if (process.env.NODE_ENV !== 'test') {
          event.currentTarget.blur();
        }
        onClick(event);
      },
      onKeyDown: (event) => {
        if (event.keyCode === 32) {
          event.preventDefault();
        } else if (event.keyCode === 13) {
          event.preventDefault();
          onClick(event);
        }
      },
      onKeyUp: (event) => {
        if (event.keyCode === 32) {
          event.preventDefault();
          onClick(event);
        }
      },
    }),
    [onClick],
  );
}
