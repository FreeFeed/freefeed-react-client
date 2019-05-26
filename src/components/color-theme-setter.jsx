import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';

import { SCHEME_DARK, SCHEME_SYSTEM } from '../services/appearance';


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
  ({ systemColorScheme, userColorScheme }) => ({
    darkTheme: userColorScheme === SCHEME_DARK
           || (userColorScheme === SCHEME_SYSTEM && systemColorScheme === SCHEME_DARK)
  })
)(ColorSchemeSetterBase);
