import { Link as RLink } from 'react-router';

export function Anchor({ href, title, children }) {
  return (
    <a href={href} target="_blank" dir="ltr" title={title}>
      {children}
    </a>
  );
}

export function Link({ to, title, children }) {
  return (
    <RLink to={to} dir="ltr" title={title}>
      {children}
    </RLink>
  );
}
