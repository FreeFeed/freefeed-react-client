import { Fragment, isValidElement } from 'react';
import { matchPattern } from '../match-pattern';
import { useNouter } from '../hooks';

export function Switch({ children }) {
  const { path } = useNouter();
  for (const child of flattenChildren(children)) {
    if (isValidElement(child) && child.props.path) {
      if (matchPattern(child.props.path, path, !!child.props.nest)) {
        // Render the first matching child. We use keys here to force React not
        // to reuse previously rendered routes. It is necessary for the proper
        // beforeEnter/beforeChange hooks behavior.
        return <Fragment key={keyOf(child)}>{child}</Fragment>; //child;
      }
    }
  }
  return null;
}

function flattenChildren(children) {
  return Array.isArray(children)
    ? children.flatMap((c) => flattenChildren(c && c.type === Fragment ? c.props.children : c))
    : [children];
}

const childKeys = new WeakMap();
let nextAutoKey = 0;
function keyOf(child) {
  if (!childKeys.has(child)) {
    childKeys.set(child, `switch-${nextAutoKey++}`);
  }
  return childKeys.get(child);
}
