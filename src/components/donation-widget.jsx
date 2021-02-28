/* global CONFIG */
import { Link } from 'react-router';
import cn from 'classnames';

import styles from './donation-widget.module.scss';
import { useDonationStatus } from './hooks/donation-status';

export function DonationWidget({ accountName = CONFIG.donationStatusAccount }) {
  const statusText = useDonationStatus(accountName);

  if (!statusText) {
    return null;
  }

  return (
    <div className="box" role="navigation">
      <div className="box-header-groups" role="heading">
        Donate
      </div>
      <div className={cn('box-body', styles.body)}>
        <p className={styles.statusPara}>
          Current funding status:{' '}
          <Link
            to="/about/donate"
            className={cn(styles.statusLink, styles.statusLinkInSidebar)}
            data-status={statusText}
          >
            {statusText}
          </Link>
        </p>
        <p>
          <Link to="/about/donate" className={styles.donateLink}>
            Donate to {CONFIG.siteTitle}
          </Link>
        </p>
        <p>Your regular donations pay for hosting and keep FreeFeed running.</p>
      </div>
    </div>
  );
}
