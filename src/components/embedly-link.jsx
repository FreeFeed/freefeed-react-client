import React from 'react';

export default class EmbedlyLink extends React.Component {
  componentDidMount() {
    embedly('card', this.refs.root);
  }
  render() {
    return (
      <a  ref="root"
          href={this.props.link}
          data-card-controls="0"
          data-card-width="60%"
          data-card-recommend="0"
          data-card-align="left"/>
    );
  }
}