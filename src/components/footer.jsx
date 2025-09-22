/* global CONFIG */
import { useSelector } from 'react-redux';
import { Link } from '../services/nouter';

export default function Footer({ short }) {
  const authenticated = useSelector((state) => state.authenticated);
  return (
    <footer className="footer">
      <p role="navigation">
        &copy; FreeFeed 1.141.0-beta (Sep 22, 2025)
        <br />
        <Link to="/about">About</Link>
        {' | '}
        <a
          href="https://github.com/FreeFeed/freefeed-server/wiki/FAQ"
          target="_blank"
          rel="noreferrer"
        >
          FAQ
        </a>
        {' | '}
        <a href="/docs/terms">Terms</a>
        {' | '}
        <a href="/docs/privacy">Privacy</a>
        {' | '}
        <Link to="/about/stats">Stats</Link>
        {' | '}
        <a href="https://status.freefeed.net/" target="_blank" rel="noreferrer">
          Status
        </a>
        {' | '}
        <a href="https://github.com/FreeFeed" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </p>
      {!authenticated && !short ? (
        <>
          <hr />
          <p>
            <Link to="/">{CONFIG.siteTitle}</Link> is a small nonprofit social network. It does not
            sell your data, nor does it show ads to you. <Link to="/signup">Join us</Link> and meet
            our community.
          </p>
        </>
      ) : (
        false
      )}
    </footer>
  );
}
