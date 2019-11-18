import webpack from 'webpack';

export function strToBool(val, def) {
  if (val === undefined) {
    return def;
  }

  val = val.toLowerCase();
  return val === '1' || val === 'true' || val === 'yes' || val === 'y';
}

export function skipFalsy(array) {
  return array.filter((item) => !!item);
}

/**
 * The https://github.com/arthanzel/node-config-webpack
 * rewritten to support the array values. Arrays are fully
 * included in the code!
 */
export class ConfigWebpackPlugin {
  constructor(ns = 'CONFIG', configObject = require('config')) {
    const config = ConfigWebpackPlugin.stringify(configObject);
    return new webpack.DefinePlugin(ns ? { [ns]: config } : config);
  }

  /**
   * Deep copy val and stringify all object values for use in webpack.DefinePlugin
   *
   * @param {any} val
   */
  static stringify(val) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const clone = {};
      for (const key of Object.keys(val)) {
        clone[key] = ConfigWebpackPlugin.stringify(val[key]);
      }
      return clone;
    }
    // JSON-stringify primitive types AND arrays because
    // webpack.DefinePlugin cannot into arrays.
    return JSON.stringify(val);
  }
}
