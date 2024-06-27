/**
 * A hacky way to set the value of a React managed input element and trigger the
 * _onChange_ handler. Replaces the naive `input.value = value`.
 *
 * It works with React 16-18, but may stop working in the future (React 19?).
 *
 * @see https://github.com/facebook/react/issues/11488#issuecomment-347775628
 * @param {HTMLTextAreaElement|HTMLInputElement} input
 * @param {string} value
 */
export function setReactInputValue(input, value) {
  const prevValue = input.value;
  input.value = value;
  // Magic is here: Set the internal value to prevValue (!= value), to force an
  // actual change.
  input._valueTracker?.setValue(prevValue);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}
