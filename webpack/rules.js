import MiniCssExtractPlugin from "mini-css-extract-plugin";

import { skipFalsy } from './utils';


class RuleGenerator {
  opts;

  constructor(opts) {
    this.opts = opts;
  }

  get eslint() {
    return {
      test:    /\.jsx?$/,
      exclude: /node_modules/,
      loader:  'eslint-loader',
      enforce: 'pre'
    };
  }

  get babel() {
    return {
      test:    /\.jsx?$/,
      exclude: (modulePath) => {
        return /node_modules/.test(modulePath)
      },
      use: [
        {
          loader:  'babel-loader',
          options: {
            babelrc: false,
            presets: skipFalsy([
              "@babel/react",
              ["@babel/env", {
                modules: false,
                targets: {
                  browsers: [
                    '>1%',
                    'last 3 versions',
                    'last 3 iOS versions',
                    'ie >= 10',
                  ]
                }
              }],
            ]),
            plugins: skipFalsy([
              // ["lodash", { "id": ["lodash", "recompose"] }],
              "@babel/syntax-class-properties",
              "@babel/syntax-do-expressions",
              "@babel/syntax-dynamic-import",
              "@babel/syntax-object-rest-spread",
              "@babel/proposal-class-properties",
              "@babel/proposal-do-expressions",
              "@babel/proposal-object-rest-spread",
              this.opts.dev && '@babel/transform-runtime',
              // ['@babel/plugin-transform-modules-commonjs', {
              //   "noInterop": true,
              // }],
              this.opts.hot && "react-hot-loader/babel",
              !this.opts.dev && ['transform-react-remove-prop-types', { mode: 'remove', removeImport: true, additionalLibraries: ["react-style-proptype"] }],
              !this.opts.dev && ["@babel/transform-react-constant-elements"],
              !this.opts.dev && ["@babel/transform-react-inline-elements"],
            ]),
          },
        }
      ],
    };
  }

  get babelForNode() {
    return {
      test:    /\.jsx?$/,
      exclude: /(node_modules[\\/])/,
      loader:  'babel-loader',
      options: {
        babelrc: false,
        presets: [
          "@babel/react",
          ["@babel/env", {
            modules: false,
            targets: { node: "8.9", }
          }],
        ],
        plugins: [
          '@babel/transform-runtime',
          "@babel/syntax-class-properties",
          "@babel/syntax-do-expressions",
          "@babel/syntax-object-rest-spread",
          "@babel/proposal-class-properties",
          "@babel/proposal-object-rest-spread",
          // 'lodash',
        ],
      }
    };
  }

  get template() {
    return {
      test: /[.]jade$/,
      use:  [
        { loader: 'pug-loader' }
      ],
    };
  }

  get css() {
    return {
      test: /[\\/]styles[\\/].*[\\/].*[.]scss$/,
      use:  [
        this.opts.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader',
      ],
    };
  }

  get assetsCss() {
    // import '../assets/vendor-css/font-awesome.min.css';
    return {
      test: /[\\/]assets[\\/].*[\\/].*[.]css$/,
      use:  [
        this.opts.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
      ],
    };
  }

  get fonts() {
    return {
      test:   /[\\/]assets[\\/]fonts[\\/]fontawesome[^/]*$/i,
      loader: 'file-loader?name=[path][name].[ext]'
    };
  }

  get photoswipe() {
    const fileName = this.opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]';

    return {
      test:   /photoswipe.+\.(png|svg|gif)$/,
      loader: `file-loader?name=assets/images/photoswipe/${fileName}`
    };
  }

  get otherAssets() {
    const fileName = this.opts.hash ? '[path][name]-[hash].[ext]' : '[path][name]-dev.[ext]';

    return {
      test:    /[\\/]assets[\\/]/,
      exclude: [
        /[\\/]fonts[\\/]fontawesome[^/]*$/i,
        /[\\/]assets[\\/].*[\\/].*[.]css$/,
      ],
      loader: `file-loader?name=${fileName}`
    };
  }
}

export default RuleGenerator;
