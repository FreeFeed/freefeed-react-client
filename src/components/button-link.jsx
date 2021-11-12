import { useCallback, memo, forwardRef, useMemo } from 'react';

// Inspired by https://www.w3.org/TR/wai-aria-practices/examples/button/button.html
export const ButtonLink = memo(
  forwardRef(function ButtonLink({ onClick: click, disabled = false, ...props }, ref) {
    const kbdHandlers = useKeyboardEvents(
      useCallback((event) => disabled || click(event), [click, disabled]),
    );

    return (
      <a
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

export function useKeyboardEvents(onClick) {
  return useMemo(
    () => ({
      onClick: (event) => {
        event.target.blur();
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
