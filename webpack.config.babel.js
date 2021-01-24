import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import OptiCSS from 'optimize-css-assets-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Uglify from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import { baseConfig, opts, rules } from './webpack/base';
import { skipFalsy } from './webpack/utils';

const config = {
  ...baseConfig,
  entry: {
    app: skipFalsy(['core-js/stable', 'regenerator-runtime/runtime', 'whatwg-fetch', './src']),
    bookmarklet: skipFalsy(['./src/bookmarklet/popup.js']),
    config: skipFalsy(['./config/lib/loader-browser.js']),
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
      ...rules.fonts,
      rules.photoswipe,
      rules.markdown,
      rules.otherAssets,
    ]),
  },
  plugins: skipFalsy([
    ...baseConfig.plugins,
    new ESLintPlugin({
      extensions: ['js', 'jsx'],
      files: ['src', 'test'],
      lintDirtyModulesOnly: true,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: './index.jade',
      file: 'index.html',
      chunks: ['config', 'common', 'app'],
      chunksSortMode: 'manual',
      templateParameters: {
        appConfig: global.CONFIG,
        opts,
      },
    }),
    new MiniCssExtractPlugin({
      filename: opts.dev ? '[name]-dev.css' : '[name]-[contenthash].css',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets/images/favicon.*', to: '' },
        { from: 'assets/images/ios/*.png', to: '' },
        { from: 'assets/ext-auth/auth-return.html', to: '' },
      ],
    }),
    !opts.dev && new webpack.HashedModuleIdsPlugin(),
    !opts.dev &&
      new BundleAnalyzerPlugin({
        analyzerMode: 'disabled', // will create 'stats.json' file
        generateStatsFile: true,
        openAnalyzer: false,
      }),
  ]),
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      maxSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
          priority: 9,
        },
        default: {
          minChunks: 1,
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
