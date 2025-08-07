import { Fragment, isValidElement } from 'react';
import { matchPattern } from '../match-pattern';
import { useNouter } from '../hooks';

export function Switch({ children }) {
  const { path } = useNouter();
  for (const child of flattenChildren(children)) {
    if (isValidElement(child) && child.props.path) {
      if (matchPattern(child.props.path, path, !!child.props.nest)) {
        // Just render the first matching child
        return child;
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
