import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sortBy } from 'lodash';
import { Link } from 'react-router';
import Helmet from 'react-helmet';

import { faCaretDown, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { getAllGroups } from '../redux/action-creators';
import { Icon } from './fontawesome-icons';

import UserName from './user-name';
import TimeDisplay from './time-display';

import styles from './all-groups.module.scss';

export default function AllGroups() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.allGroupsStatus);

  useEffect(() => void (status.success || status.loading || dispatch(getAllGroups())), [
    dispatch,
    status,
  ]);

  return (
    <div className="content">
      <Helmet title={`All Groups - FreeFeed`} />
      <div className="box">
        <div className="box-header-timeline">All Groups</div>
        <div className="box-body">
          {status.loading && <p>Loading...</p>}
          {status.error && (
            <p className="alert alert-danger">Can not load scopes: {status.errorText}</p>
          )}
          {status.success && <GroupsList />}
        </div>
      </div>
    </div>
  );
}

const SORT_BY_POSTS = 'postsByMonth';
const SORT_BY_SUBSCRIBERS = 'subscribers';
const SORT_BY_VARIETY = 'authorsVariety';
const SORT_BY_DATE = 'createdAt';

function GroupsList() {
  const { groups, withProtected } = useSelector((state) => {
    const { groups, withProtected } = state.allGroups;
    for (const g of groups) {
      g.createdAt = state.users[g.id].createdAt;
    }
    return { groups, withProtected };
  });
  const [sort, setSort] = useState(SORT_BY_SUBSCRIBERS);
  const setSorting = useCallback((order) => () => setSort(order), []);

  const sortedGroups = useMemo(() => sortBy(groups, sort).reverse(), [groups, sort]);

  return (
    <>
      {withProtected ? (
        <p>
          There are {groups.length} public and protected groups in FreeFeed. Protected groups can be
          seen only by the authenticated users.
        </p>
      ) : (
        <p>There are {groups.length} public groups in FreeFeed.</p>
      )}
      <p>Click on the column headers to change the table sorting.</p>
      <table>
        <thead>
          <tr className={styles.headersRow}>
            <th>Group</th>
            <SortHeader mode={SORT_BY_SUBSCRIBERS} currentMode={sort} setMode={setSorting}>
              Subscribers
            </SortHeader>
            <SortHeader mode={SORT_BY_POSTS} currentMode={sort} setMode={setSorting}>
              Posts per month
            </SortHeader>
            <SortHeader mode={SORT_BY_VARIETY} currentMode={sort} setMode={setSorting}>
              Authors variety
            </SortHeader>
            <SortHeader mode={SORT_BY_DATE} currentMode={sort} setMode={setSorting}>
              Creation date
            </SortHeader>
          </tr>
        </thead>
        <tbody>
          {sortedGroups.map((g) => (
            <GroupRow key={g.id} g={g} />
          ))}
        </tbody>
      </table>
    </>
  );
}

function SortHeader({ children, mode, currentMode, setMode }) {
  return (
    <th
      onClick={setMode(mode)}
      className={styles.sortableHeader + (mode === currentMode ? '' : ` ${styles.inactive}`)}
    >
      {children}
      <Icon icon={faCaretDown} className={styles.caret} />
    </th>
  );
}

const GroupRow = React.memo(function GroupRow({ g }) {
  const u = useSelector((state) => state.users[g.id]);
  return (
    <tr className={styles.groupRow}>
      <td>
        <Link to={`/${u.username}`}>
          <img src={u.profilePictureMediumUrl} width="50" height="50" className={styles.userpic} />
        </Link>
        <UserName user={u}>{u.username}</UserName>
        {u.username !== u.screenName && <div className="small">{u.screenName}</div>}
        {u.isProtected === '1' && (
          <Icon icon={faUserFriends} title="Protected group" className="muted-text small" />
        )}
      </td>
      <td>{g.subscribers}</td>
      <td>{g.postsByMonth === 0 ? '< 1' : Math.ceil(g.postsByMonth)}</td>
      <td>{Math.round(g.authorsVariety * 100)}%</td>
      <td>
        <TimeDisplay timeStamp={+u.createdAt} showAbsTime showDateOnly />
      </td>
    </tr>
  );
});
