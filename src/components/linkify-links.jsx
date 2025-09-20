import { Link as RLink } from '../services/nouter';

export function Anchor({ href, title, children }) {
  return (
    <a href={href} target="_blank" dir="ltr" title={title} rel="noreferrer">
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
