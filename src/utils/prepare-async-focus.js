/**
 * iOS doesn't allow to properly .focus() text inputs outside of event handler.
 * Input is focusing, but the mobile keyboard doesn't pop up. Proper focusing
 * only occurs if .focus() is called synchronously in the handler of an event
 * triggered by the user. Asynchronous nature of React does not always allow
 * this.
 *
 * But there is a workaround. iOS allows you to _move_ the focus if it's already
 * set on some text input (see https://stackoverflow.com/a/45703019).
 *
 * So this function is for such cases. It creates invisible input and sets focus
 * on it. It also positions this at the center of screen to prevent scrolling
 * due the focus change.
 *
 * Call this function in the event handler, and then you can asynchronously call
 * .focus() on any text element. The invisible input will be auto-removed after
 * 1 sec.
 */
export function prepareAsyncFocus() {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'sr-only';
  input.style.position = 'fixed';
  input.style.left = '50%';
  input.style.top = '50%';
  document.body.appendChild(input);
  input.focus();
  // Clean up
  setTimeout(() => input.remove(), 1000);
}
