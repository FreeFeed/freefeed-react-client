/* global CONFIG */
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

export default function Footer() {
  const authenticated = useSelector((state) => state.authenticated);
  return (
    <footer className="footer">
      <p>
        &copy; FreeFeed 1.89.0 (Dec 13, 2020)
        <br />
        <Link to="/about">About</Link>
        {' | '}
        <a href="https://github.com/FreeFeed/freefeed-server/wiki/FAQ" target="_blank">
          FAQ
        </a>
        {' | '}
        <Link to="/about/terms">Terms</Link>
        {' | '}
        <Link to="/about/privacy">Privacy</Link>
        {' | '}
        <Link to="/about/stats">Stats</Link>
        {' | '}
        <a href="https://status.freefeed.net/" target="_blank">
          Status
        </a>
        {' | '}
        <a href="https://github.com/FreeFeed" target="_blank">
          GitHub
        </a>
      </p>
      {!authenticated && (
        <>
          <hr />
          <p>
            <Link to="/">{CONFIG.siteTitle}</Link> is a small nonprofit social network. It does not
            sell your data, nor does it show ads to you. <Link to="/signup">Join us</Link> and meet
            our community.
          </p>
        </>
      )}
    </footer>
  );
}
