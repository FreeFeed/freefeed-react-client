import HtmlWebpackPlugin from 'html-webpack-plugin';
import OptiCSS from 'optimize-css-assets-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Uglify from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import appConfig from 'config';

import { baseConfig, opts, rules } from './webpack/base';
import { skipFalsy } from './webpack/utils';

const config = {
  ...baseConfig,
  entry: {
    app: skipFalsy(['core-js/stable', 'regenerator-runtime/runtime', './src']),
    bookmarklet: skipFalsy(['./src/bookmarklet/popup.js']),
  },
  target: 'web',
  devServer: { historyApiFallback: true },
  module: {
    rules: skipFalsy([
      opts.dev && rules.eslint,
      rules.babel,
      rules.css,
      rules.cssModule,
      rules.assetsCss,
      rules.template,
      rules.fonts,
      rules.photoswipe,
      rules.otherAssets,
    ]),
  },
  plugins: skipFalsy([
    ...baseConfig.plugins,
    new HtmlWebpackPlugin({
      inject: false,
      template: './index.jade',
      file: 'index.html',
      opts,
      colorSchemeStorageKey: appConfig.get('appearance.colorSchemeStorageKey'),
      sentryDSN: appConfig.get('sentry.publicDSN'),
    }),
    new MiniCssExtractPlugin({
      filename: opts.hash ? '[name]-[contenthash].css' : '[name]-dev.css',
    }),
    new CopyPlugin([
      { from: 'assets/images/favicon.ico', to: 'assets/images/' },
      { from: 'assets/images/ios/*.png', to: '' },
      { from: 'assets/ext-auth/auth-return.html', to: '' },
    ]),
  ]),
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name: 'common',
          test: /[\\/]styles[\\/]common[\\/].*[.]scss$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
    minimizer: [
      new Uglify({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
      new OptiCSS({}),
    ],
  },
};

export default config;
