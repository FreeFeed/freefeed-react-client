import TapWebpackPlugin from 'tap-webpack-plugin';

import { baseConfig, rules } from "./webpack/base";


const config = {
  ...baseConfig,
  entry: {
    test: './test',
  },
  target: 'node',
  node: {
    fs: 'empty',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      rules.babel,
      rules.otherAssets
    ]
  },
  plugins: [
    ...baseConfig.plugins,
    new TapWebpackPlugin(),
  ]
};

config.output.filename = '[name].js';

export default config;
