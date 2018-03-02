import webpack from 'webpack';
import PathRewriter from "webpack-path-rewriter";

import { baseConfig, opts, rules } from "./webpack/base";
import { skipFalsy } from './webpack/utils';


const config = {
  ...baseConfig,
  entry: {
    app: skipFalsy([
      'babel-polyfill',
      './src'
    ])
  },
  target: 'web',
  devtool: opts.dev ? 'cheap-module-eval-source-map' : 'source-map',
  devServer: {
    historyApiFallback: true
  },
  module: {
    rules: [
      rules.eslint,
      rules.babel,
      rules.commonCss,
      rules.appCss,
      rules.template,
      rules.fonts,
      rules.photoswipe,
      rules.otherAssets
    ]
  },
  plugins: skipFalsy([
    ...baseConfig.plugins,
    new PathRewriter(),
    rules.commonCssExtractor,
    rules.appCssExtractor,
    opts.uglify && new webpack.optimize.UglifyJsPlugin()
  ])
};

export default config;
