import webpackNodeExternals from 'webpack-node-externals';
import { baseConfig, rules } from './webpack/base';

const config = {
  ...baseConfig,
  target: 'node',
  module: {
    rules: [rules.babelForNode, rules.otherAssets],
  },
  externals: [webpackNodeExternals()],
};

config.output.filename = '[name].js';

export default config;
