import HtmlWebpackPlugin from 'html-webpack-plugin';
import OptiCSS from "optimize-css-assets-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import Uglify from "terser-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import webpack from 'webpack';

import { baseConfig, opts, rules } from "./webpack/base";
import { skipFalsy } from './webpack/utils';
import appConfig from "./src/config";


const config = {
  ...baseConfig,
  entry: {
    app: skipFalsy([
      'core-js/stable',
      'regenerator-runtime/runtime',
      './src'
    ])
  },
  target:    'web',
  devServer: { historyApiFallback: true },
  module:    {
    rules: skipFalsy([
      opts.dev && rules.eslint,
      rules.babel,
      rules.css,
      rules.cssModule,
      rules.assetsCss,
      rules.template,
      rules.fonts,
      rules.photoswipe,
      rules.otherAssets
    ]),
  },
  plugins: skipFalsy([
    ...baseConfig.plugins,
    new HtmlWebpackPlugin({
      inject:   false,
      template: './index.jade',
      file:     'index.html',
      opts,
      appConfig,
    }),
    new MiniCssExtractPlugin({ filename: opts.hash ? '[name]-[contenthash].css' : '[name]-dev.css', }),
    new CopyPlugin([
      { from: 'assets/images/favicon.ico', to: 'assets/images/' },
      { from: 'assets/images/ios/*.png', to: '' },
    ]),
    new webpack.DefinePlugin({ WEBPACK_SAYS_USE_CANDY: Boolean(process.env.CANDY) })
  ]),
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          name:    'common',
          test:    /[\\/]styles[\\/]common[\\/].*[.]scss$/,
          chunks:  'all',
          enforce: true
        },
      },
    },
    minimizer: [
      new Uglify({
        cache:     true,
        parallel:  true,
        sourceMap: true,
      }),
      new OptiCSS({}),
    ],
  },
};

export default config;
