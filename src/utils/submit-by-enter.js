import { KEY_RETURN } from 'keycode-js';

/**
 * Returns the keydown handler that handles submit by Enter/Ctrl+Enter in text
 * fields.
 *
 * @param {boolean} byEnter use Enter to submit
 * @param {Function} submitFn submit action function
 */
export function submitByKey(byEnter, submitFn) {
  return (byEnter ? submitByEnter : submitByCtrlEnter)(submitFn);
}

/**
 * The Enter press acts as submit unless the Shift key is pressed or the text
 * cursor is right after the space. The space+Enter pattern allows mobile users
 * (that cannot use Shift) to insert soft returns to text.
 *
 * @param {Function} submitFn submit action function
 */
function submitByEnter(submitFn) {
  return function (event) {
    if (event.keyCode !== KEY_RETURN || event.shiftKey) {
      return;
    }

    const { target } = event;
    if (target.selectionStart > 0 && target.value[target.selectionStart - 1] === ' ') {
      // Trim the extra spaces before new line
      while (target.selectionStart > 0 && /\s/.test(target.value[target.selectionStart - 1])) {
        target.selectionStart--;
      }
      return;
    }

    event.preventDefault();
    submitFn(event);
  };
}

/**
 * The Ctrl+Enter press acts as submit
 *
 * @param {Function} submitFn submit action function
 */
function submitByCtrlEnter(submitFn) {
  return function (event) {
    if (event.keyCode !== KEY_RETURN || !event.ctrlKey) {
      return;
    }
    event.preventDefault();
    submitFn(event);
  };
}
