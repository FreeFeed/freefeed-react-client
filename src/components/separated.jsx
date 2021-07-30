import { Fragment, Children } from 'react';

/**
 * Inserts separator between the renderable children
 */
export function Separated({ separator, children }) {
  return (
    <>
      {Children.toArray(children)
        .filter(isRenderable)
        .map((child, i) => (
          <Fragment key={`sep${i}`}>
            {i > 0 && separator}
            {child}
          </Fragment>
        ))}
    </>
  );
}

function isRenderable(child) {
  return typeof child !== 'boolean' && typeof child !== 'undefined' && child !== null;
}
