// import webpack from 'webpack';
import CSSMinimizer from 'css-minimizer-webpack-plugin';
import Terser from 'terser-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import { gzip } from '@gfx/zopfli';

import { baseConfig, opts, rules } from './webpack/base';
import { skipFalsy } from './webpack/utils';
import { BOOKMARKLET_POPUP_PATH } from './src/bookmarklet/loader';

const config = {
  ...baseConfig,
  entry: {
    bookmarklet: skipFalsy(['./src/bookmarklet/popup.js']),
  },
  output: {
    ...baseConfig.output,
    filename: BOOKMARKLET_POPUP_PATH,
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
    !opts.dev &&
      new CompressionPlugin({
        compressionOptions: {
          numiterations: 5,
        },
        algorithm(input, compressionOptions, callback) {
          return gzip(input, compressionOptions, callback);
        },
      }),
  ]),
  optimization: {
    moduleIds: 'deterministic',
    minimizer: [new Terser(), new CSSMinimizer()],
  },
};

export default config;
