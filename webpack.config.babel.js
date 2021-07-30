import child_process from 'child_process';
// import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CSSMinimizer from 'css-minimizer-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import Terser from 'terser-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CompressionPlugin from 'compression-webpack-plugin';
import VersionFile from 'webpack-version-file';
import { gzip } from '@gfx/zopfli';

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
      publicPath: '/',
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
    !opts.dev &&
      new BundleAnalyzerPlugin({
        analyzerMode: 'disabled', // will create 'stats.json' file
        generateStatsFile: true,
        openAnalyzer: false,
      }),
    !opts.dev &&
      new CompressionPlugin({
        compressionOptions: {
          numiterations: 5,
        },
        algorithm(input, compressionOptions, callback) {
          return gzip(input, compressionOptions, callback);
        },
      }),
    !opts.dev &&
      new VersionFile({
        output: `${opts.dstDir}/version.txt`,
        templateString: `<%= name %>@<%= version %> <%= commitHash%>\nBuild date: <%= date %>`,
        data: {
          date: new Date().toISOString(),
          commitHash: child_process.execSync('git rev-parse --short HEAD').toString().trim(),
        },
      }),
  ]),
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: {
      name: 'manifest',
    },
    splitChunks: {
      // maxSize: 0,
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
    minimizer: [new Terser(), new CSSMinimizer()],
  },
};

export default config;
