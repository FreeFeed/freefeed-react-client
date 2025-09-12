import { useEffect, useState } from 'react';
import { Link, useResolvedRoutes } from '../services/nouter';
import { format } from '../utils/date-format';

const userRouteNames = new Set([
  'userFeed',
  'userMemories',
  'userSummary',
  'userComments',
  'userLikes',
  'post',
]);

export function SideBarMemories() {
  const resolvedRoutes = useResolvedRoutes();
  let username = null;
  for (const route of resolvedRoutes) {
    if (userRouteNames.has(route.name)) {
      username = route.params.userName;
      break;
    }
  }

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
}
