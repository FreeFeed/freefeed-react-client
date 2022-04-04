import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Link, withRouter } from 'react-router';

const userRouteNames = new Set([
  'userFeed',
  'userMemories',
  'userSummary',
  'userComments',
  'userLikes',
  'post',
]);

export const SideBarMemories = withRouter(function SideBarMemories({ router }) {
  const username = router.routes.find((r) => userRouteNames.has(r.name)) && router.params.userName;

  // Periodically update the current date value for the long-lived tab case
  const [today, setToday] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setToday(new Date()), 300000);
    return () => clearInterval(t);
  }, []);

  const todayString = format(today, 'MMdd');
  const lastYear = today.getFullYear() - 1;

  const yearLinks = [];
  for (let year = lastYear; year >= 2005; year--) {
    yearLinks.push(
      <Link key={year} to={`${username ? `/${username}` : ''}/memories/${year}${todayString}`}>
        {year}
      </Link>,
    );
  }

  return (
    <div className="box" role="navigation">
      <div className="box-header-memories" role="heading">
        Memories
      </div>
      <div className="box-body">
        <p>
          {username ? <>@{username}&#x2019;s</> : 'All'} records for {format(today, 'MMMM\u00A0d')}
        </p>
        <div className="year-links-row">{yearLinks}</div>
      </div>
    </div>
  );
});
