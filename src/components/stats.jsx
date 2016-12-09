import React from 'react';
import Highcharts from 'highcharts';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';
import config from '../config';

class StatsChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      metrics: []
    };
  }

  async componentDidMount() {
    const to_date = moment().subtract(1, 'd').format(`YYYY-MM-DD`);   // Yesterday
    const from_date = moment().subtract(1, 'y').format(`YYYY-MM-DD`); // Stats for 1 year

    const url = `${config.api.host}/v2/stats?data=${this.props.type}&start_date=${from_date}&end_date=${to_date}`;
    const metrics = [];

    try {
      const response = await fetch(url);
      const result = await response.json();

      for (const metric of result.stats) {
        const dt = moment(metric.date);
        metrics.push([
          Date.UTC(dt.get('year'), dt.get('month'), dt.get('date')),
          Number(metric[this.props.type])]);
      }
    } catch (e) {
      metrics.push(e);
    }
    this.setState({ metrics });
  }

  render() {
    const config = {
      chart: {
        zoomType: 'x'
      },
      exporting: {
        enabled: true
      },
      xAxis: {
        type: 'datetime'
      },
      yAxis: {
        title: {
          text: null
        }
      },
      title: {
        text: this.props.title
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
        }
      },
      series: [{
        type: 'area',
        name: this.props.title,
        data: []
      }]
    };

    config.series[0].data = this.state.metrics;

    return (
      <ReactHighcharts config={config}></ReactHighcharts>
    );
  }
}

const Stats = () => (
  <div className="box">
    <div className="box-header-timeline"></div>
    <div className="box-body">
      <h3>FreeFeed Stats</h3>
      <StatsChart type={`active_users`} title="Daily Active Users"></StatsChart>
      <StatsChart type={`posts_creates`} title="Daily Posts"></StatsChart>
      <StatsChart type={`comments_creates`} title="Daily Comments"></StatsChart>
    </div>
  </div>
);

export default Stats;
