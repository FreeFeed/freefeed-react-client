import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { darkTheme } from './select-utils';


class ColorSchemeSetterBase extends Component {
  componentDidMount() {
    document.body.classList.toggle('dark-theme', this.props.darkTheme);
  }

  componentDidUpdate() {
    document.body.classList.toggle('dark-theme', this.props.darkTheme);
  }

  render() {
    return (
      <Helmet>
        <meta name="theme-color" content={this.props.darkTheme ? "#353535" : "#fff"} />
      </Helmet>
    );
  }
}

export const ColorSchemeSetter = connect(
  (state) => ({ darkTheme: darkTheme(state) })
)(ColorSchemeSetterBase);
