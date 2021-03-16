import { Link } from 'react-router';

export function SignInLink({ children, ...params }) {
  const { pathname, search, hash } = window.location;
  const qs =
    pathname === '/signin'
      ? search + hash
      : `?back=${encodeURIComponent(pathname + search + hash)}`;
  return (
    <Link to={`/signin${qs}`} {...params}>
      {children}
    </Link>
  );
}
