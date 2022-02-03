import React, { memo } from 'react';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';

import { pluralForm } from '../utils';

export const SubscriptionRequestsAlert = memo(function SubscriptionRequestsAlert({ className }) {
  const userRequestsCount = useSelector((state) => state.userRequestsCount);
  const groupRequestsCount = useSelector((state) => state.groupRequestsCount);

  const uLink = userRequestsCount && (
    <Link key="uLink" to="/friends?show=requests">
      {pluralForm(userRequestsCount, 'subscription request')}
    </Link>
  );

  const gLink = groupRequestsCount && (
    <Link key="gLink" to="/friends?show=requests">
      {pluralForm(groupRequestsCount, 'group subscription request')}
    </Link>
  );

  const links = [uLink, gLink].filter(Boolean);
  if (links.length === 0) {
    return null;
  }

  return (
    <div className={classNames(className, 'subscriptions-request-alert')}>
      <span className="message">
        You have{' '}
        {links.map((link, i) => (
          <React.Fragment key={link.key}>
            {i > 0 && ' and '}
            {link}
          </React.Fragment>
        ))}
      </span>
    </div>
  );
});
