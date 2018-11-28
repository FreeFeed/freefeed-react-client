import React from 'react';
import _ from 'lodash';

import ResizeTracker from './resize-tracker';
import FoldableContent from './foldable-content';
import ScrollCompensator from './scroll-compensator';

/**
 * ScrollSafe is a decorator for react classes. It provides:
 *   1) automatic scroll compensation for the nested component and
 *   2) Fold/Expand UI for the tall content.
 *
 * ScrollSafe can be used as a decorator:
 *   @ScrollSafe
 *   class Foo extends React.Component {
 *
 * …as a decorator with options:
 *   @ScrollSafe(options)
 *   class Foo extends React.Component {
 *
 * …or as a regular function:
 *   ScrollSafe(Foo) or ScrollSafe(Foo, options)
 *
 * Options is a plain object with the following fields:
 *   * trackResize (true by default) - auto-track resize of the nested content
 *   * foldable (true by default) - apply Fold/Expand UI for the tall content
 *
 * When you set 'trackResize' to false you still can manually signal to the
 * ScrollSafe wrapper about your component resize - see contentResized() function in 'events.jsx'.
 */
export default function ScrollSafe(arg1, arg2) {
  const defaultOptions = {
    foldable:    true,
    trackResize: true,
  };

  if (_.isPlainObject(arg1)) {
    // Call as a decorator with parameters: @ScrollSafe(opts)
    return (Child) => ScrollSafe(Child, arg1);
  }

  const Child = arg1;
  const { foldable, trackResize } = { ...defaultOptions, ...(arg2 || {}) };

  const foo = function (props) {
    let content = <Child {...props} />;
    if (trackResize) {
      content = <ResizeTracker>{content}</ResizeTracker>;
    }
    if (foldable) {
      content = <FoldableContent>{content}</FoldableContent>;
    }
    return <ScrollCompensator>{content}</ScrollCompensator>;
  };
  foo.displayName = 'ScrollSafe';

  return foo;
}

