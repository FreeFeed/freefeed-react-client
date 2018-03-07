import path from "path";

import ExtractTextPlugin from "extract-text-webpack-plugin";
import webpack from "webpack";

import { skipFalsy, strToBool } from "./utils";
import RulesGenerator from "./rules";


const { env } = process;
const opts = {
  dstDir: env.DST_DIR || path.join(__dirname, '..', '_dist'),
  dev: strToBool(env.DEV, true),
  livereload: strToBool(env.LIVERELOAD, false),
  hot: process.argv.indexOf('--hot') !== -1,
  hash: strToBool(env.HASH, false),
  uglify: strToBool(env.UGLIFY, false),
  port: env.PORT || '8080'
};

const cssCommonExtractor = new ExtractTextPlugin(
  opts.hash ? 'common-[contenthash].css' : 'common-dev.css',
  { allChunks: true }
);
const cssAppExtractor = new ExtractTextPlugin(
  opts.hash ? 'app-[contenthash].css' : 'app-dev.css',
  { allChunks: true }
);
const rules = new RulesGenerator(opts, cssCommonExtractor, cssAppExtractor);


const filename = opts.hash ? '[name]-[chunkhash]' : '[name]-dev';

const baseConfig = {
  output: {
    path: opts.dstDir,
    filename: `${filename}.js`,
    sourceMapFilename: `[file].map`,
    devtoolModuleFilenameTemplate: '/[absolute-resource-path]',
    pathinfo: opts.dev
  },
  resolve: {
    extensions: ['.js', '.json', '.jsx']
  },
  plugins: skipFalsy([
    new webpack.LoaderOptionsPlugin({ debug: opts.dev }),
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /(?:en|ru)[.]js/),
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': opts.dev ? '"development"' : '"production"'
    }),
  ]),
};

export { baseConfig, opts, rules };
