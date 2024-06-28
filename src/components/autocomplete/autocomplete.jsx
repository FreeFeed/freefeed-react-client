import { useEffect, useMemo, useState } from 'react';
import { useEvent } from 'react-use-event-hook';
import { EventEmitter } from '../../services/drafts-events';
import { setReactInputValue } from '../../utils/set-react-input-value';
import style from './autocomplete.module.scss';
import { Selector } from './selector';

// There should be no alphanumeric characters right before the "@" (to exclude
// email-like strings)
const defaultAnchor = /(?<![a-z\d])@/gi;

export function Autocomplete({ inputRef, context, anchor = defaultAnchor }) {
  const [query, setQuery] = useState(/** @type {string|null}*/ null);

  const events = useMemo(() => new EventEmitter(), []);

  const keyHandler = useEvent((/** @type {KeyboardEvent}*/ e) => {
    if (
      query !== null &&
      (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === 'Tab')
    ) {
      e.preventDefault();
      e.stopPropagation();
      events.emit(e.key);
    } else if (e.key === 'Escape') {
      setQuery(null);
    }
  });

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    const inputHandler = (/** @type {Event} */ e) => {
      if (e.type === 'selectionchange' && document.activeElement !== input) {
        return;
      }
      const matchPos = getQueryPosition(input, anchor);
      setQuery(matchPos ? input.value.slice(matchPos[0], matchPos[1]) : null);
    };

    // Clears the query after 100ms of no focus. This delay allows to click on
    // the selector by mouse.
    const timer = 0;
    const focusHandler = () => clearTimeout(timer);
    const blurHandler = () => setTimeout(() => setQuery(null), 100);

    input.addEventListener('blur', blurHandler);
    input.addEventListener('focus', focusHandler);
    input.addEventListener('input', inputHandler);
    document.addEventListener('selectionchange', inputHandler); // For the caret movements

    // Use capture for early "Enter" interception
    input.addEventListener('keydown', keyHandler, { capture: true });

    return () => {
      clearTimeout(timer);
      input.removeEventListener('blur', blurHandler);
      input.removeEventListener('focus', focusHandler);
      input.removeEventListener('input', inputHandler);
      document.removeEventListener('selectionchange', inputHandler);
      input.removeEventListener('keydown', keyHandler, { capture: true });
    };
  }, [anchor, inputRef, keyHandler]);

  const onSelectHandler = useEvent((text) => replaceQuery(inputRef.current, text, anchor));

  if (query) {
    return (
      <div className={style.wrapper}>
        <Selector query={query} events={events} onSelect={onSelectHandler} context={context} />
      </div>
    );
  }

  return null;
}

/**
 * Extract the potential username from the closest "@" symbol before the caret.
 * Returns null if the caret is not in the right place and the query position
 * (start, end offsets) if it is.
 *
 * The algorithm is the following ("|" symbol means the caret position):
 *
 * - "|@foo bar" => null
 * - "@|foo bar" => "foo" ([1,4])
 * - "@f|oo bar" => "foo"
 * - "@foo| bar" => "foo"
 * - "@foo |bar" => null
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} input
 * @returns {[number, number]|null}
 */
function getQueryPosition({ value, selectionStart }, anchor) {
  if (!selectionStart) {
    return null;
  }

  anchor.lastIndex = 0;

  let found = -1;
  while (anchor.exec(value) !== null) {
    if (anchor.lastIndex > selectionStart) {
      break;
    }
    found = anchor.lastIndex;
  }

  if (found === -1) {
    return null;
  }

  const match = value.slice(found).match(/^[a-z\d-]+/i)?.[0];
  // Check that the caret is inside the match or is at its edge
  if (!match || match.length <= selectionStart - found - 1) {
    return null;
  }

  return [found, found + match.length];
}

/**
 *
 * @param {HTMLInputElement|HTMLTextAreaElement} input
 * @param {string} replacement
 * @returns {void}
 */
function replaceQuery(input, replacement, anchor) {
  const matchPos = getQueryPosition(input, anchor);
  if (!matchPos) {
    return;
  }

  const before = input.value.slice(0, matchPos[0]);
  const after = input.value.slice(matchPos[1]);
  const newValue = before + replacement + (after || ' ');
  const newCaretPos = matchPos[0] + replacement.length + 1;
  setReactInputValue(input, newValue);
  input.setSelectionRange(newCaretPos, newCaretPos);
}
