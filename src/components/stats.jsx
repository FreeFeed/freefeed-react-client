/* global CONFIG */
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

import format from 'date-fns/format';
import startOfYesterday from 'date-fns/startOfYesterday';
import subYears from 'date-fns/subYears';

function StatsChart({ type, title }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    async function fetchData() {
      const to_date = format(startOfYesterday(), `yyyy-MM-dd`); // Yesterday
      const from_date = format(subYears(new Date(), 1), `yyyy-MM-dd`); // Stats for 1 year

      const url = `${CONFIG.api.root}/v2/stats?data=${type}&start_date=${from_date}&end_date=${to_date}`;

      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result.stats.map((x) => ({ ...x, [type]: parseInt(x[type]) })));
      } catch {
        // metrics.push(e);
      }
    }
    fetchData();
  }, [type]);

  return (
    <>
      <h4>{title}</h4>
      {data === null && <p>Loading...</p>}
      {typeof data === 'string' && <p className="alert alert-danger">{data}</p>}
      {Array.isArray(data) && (
        <ResponsiveContainer aspect={2}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#006699" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#006699" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={type}
              stroke="#006699"
              fill="url(#grad)"
              dot={false}
              isAnimationActive={false}
            />
            <XAxis dataKey="date" tickFormatter={tickFormatter} minTickGap={20} />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </>
  );
}
const Stats = () => (
  <div className="box">
    <div className="box-header-timeline" />
    <div className="box-body">
      <h3>{CONFIG.siteTitle} Stats</h3>
      <StatsChart type={`active_users`} title="Daily Active Users" />
      <StatsChart type={`registrations`} title="Daily Registrations" />
      <StatsChart type={`posts_creates`} title="Daily Posts" />
      <StatsChart type={`comments_creates`} title="Daily Comments" />
      <StatsChart type={`likes_creates`} title="Daily Likes" />
      <StatsChart type={`comment_likes_creates`} title="Daily Comment Likes" />
    </div>
  </div>
);

export default Stats;

function tickFormatter(dateString) {
  const date = new Date(dateString);
  return isFinite(date) ? format(date, 'MMM d') : '';
}
