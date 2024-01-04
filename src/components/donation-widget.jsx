/* global CONFIG */
import { Link } from 'react-router';
import cn from 'classnames';

import styles from './donate.module.scss';
import { useDonationStatus } from './hooks/donation-status';

export function DonationWidget({ accountName = CONFIG.donations.statusAccount }) {
  const statusText = useDonationStatus(accountName);

  if (!statusText) {
    return null;
  }

  return (
    <div className="box" role="navigation">
      <div className="box-header-groups" role="heading">
        Donate
      </div>
      <div className={cn('box-body', styles.widgetBody)}>
        <p>
          Current funding status:{' '}
          <Link
            to="/about/donate"
            className={cn(styles.widgetStatusLink, styles.widgetStatusLinkInSidebar)}
            data-status={statusText}
          >
            {statusText}
          </Link>
        </p>
        <p>
          <Link to="/about/donate" className={styles.widgetDonateLink}>
            Donate to {CONFIG.siteTitle}
          </Link>
        </p>
        <p>Your regular donations pay for hosting and keep {CONFIG.siteTitle} running.</p>
      </div>
    </div>
  );
}
