import path from 'path';

import webpack from 'webpack';

import '../config/lib/loader-node';
import { skipFalsy, strToBool } from './utils';
import RulesGenerator from './rules';

const { env } = process;
const opts = {
  dstDir: env.DST_DIR || path.join(__dirname, '..', '_dist'),
  dev: strToBool(env.DEV, true),
  livereload: strToBool(env.LIVERELOAD, false),
  hot: process.argv.indexOf('--hot') !== -1,
  hash: strToBool(env.HASH, false),
  port: env.PORT || '8080',
};

const rules = new RulesGenerator(opts);

const filename = opts.hash ? '[name]-[chunkhash]' : '[name]-dev';

const baseConfig = {
  mode: opts.dev ? 'development' : 'production',
  devtool: opts.dev ? 'inline-source-map' : 'source-map',
  output: {
    path: opts.dstDir,
    chunkFilename: `${filename}.js`, // used by non-entry chunks
    filename: (chunkData) => {
      if (chunkData.chunk.name === 'bookmarklet') {
        return 'assets/js/bookmarklet-popup.js';
      }
      return `${filename}.js`;
    },
    sourceMapFilename: `[file].map`,
    devtoolModuleFilenameTemplate: '/[absolute-resource-path]',
    // Set correct globalObject for web workers:
    // see https://github.com/webpack-contrib/worker-loader/issues/166
    globalObject: 'this',
  },
  resolve: { extensions: ['.js', '.json', '.jsx'] },
  plugins: skipFalsy([
    new webpack.LoaderOptionsPlugin({ debug: opts.dev }),
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"',
    }),
  ]),
};

export { baseConfig, opts, rules };
