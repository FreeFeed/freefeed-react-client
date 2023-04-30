import { Fragment, Children } from 'react';

/**
 * Inserts separator between the renderable children
 */
export function Separated({ separator, lastSeparator = separator, children }) {
  return (
    <>
      {Children.toArray(children)
        .filter(isRenderable)
        .map((child, i, arr) => (
          <Fragment key={child.key || `sep${i}`}>
            {i > 0 && (i === arr.length - 1 ? lastSeparator : separator)}
            {child}
          </Fragment>
        ))}
    </>
  );
}

export function CommaAndSeparated({ children }) {
  return (
    <Separated separator=", " lastSeparator=" and ">
      {children}
    </Separated>
  );
}

function isRenderable(child) {
  return typeof child !== 'boolean' && typeof child !== 'undefined' && child !== null;
}
