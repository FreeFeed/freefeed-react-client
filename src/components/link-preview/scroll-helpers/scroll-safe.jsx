import ResizeTracker from './resize-tracker';
import FoldableContent from './foldable-content';
import ScrollCompensator from './scroll-compensator';

/**
 * ScrollSafe is a decorator for react components that provides:
 *   1) automatic scroll compensation for the nested component and
 *   2) Fold/Expand UI for the tall content.
 *
 * Usage:
 *   ScrollSafe(Foo) or ScrollSafe(Foo, options)
 *
 * Options is a plain object with the following fields:
 *   * trackResize (true by default) - auto-track resize of the nested content
 *   * foldable (true by default) - apply Fold/Expand UI for the tall content
 *
 * When you set 'trackResize' to false you still can manually signal to the
 * ScrollSafe wrapper about your component resize - see contentResized() function in 'events.jsx'.
 */
export default function ScrollSafe(Child, { foldable = true, trackResize = true } = {}) {
  return function ScrollSafe(props) {
    let content = <Child {...props} />;
    if (trackResize) {
      content = <ResizeTracker>{content}</ResizeTracker>;
    }
    if (foldable) {
      content = <FoldableContent>{content}</FoldableContent>;
    }
    return <ScrollCompensator>{content}</ScrollCompensator>;
  };
}
