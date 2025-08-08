import { Link } from '../services/nouter';

export function SignInLink({ children, back, ...params }) {
  const { pathname, search, hash } = window.location;
  const qs =
    pathname === '/signin'
      ? search + hash
      : `?back=${encodeURIComponent(back || pathname + search + hash)}`;
  return (
    <Link to={`/signin${qs}`} {...params}>
      {children}
    </Link>
  );
}
