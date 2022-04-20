import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { skipFalsy } from './utils';

class RuleGenerator {
  opts;

  constructor(opts) {
    this.opts = opts;
  }

  get babel() {
    return {
      test: /\.m?jsx?$/,
      exclude: (modulePath) => {
        return /node_modules\/(?!([^/]+\/)*(autotrack|debug|dom-utils|filesize|lru-cache|social-text-tokenizer))/.test(
          modulePath,
        );
      },
      use: [
        {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            compact: false,
            targets: {
              browsers: ['>1%', 'last 3 versions', 'safari >= 9', 'ie >= 10'],
            },
            presets: skipFalsy([
              [
                '@babel/react',
                {
                  runtime: 'automatic',
                },
              ],
              [
                '@babel/env',
                {
                  modules: false,
                  useBuiltIns: 'entry',
                  corejs: '3.22',
                },
              ],
            ]),
            plugins: skipFalsy([
              ['lodash', { id: ['lodash'] }],
              '@babel/syntax-class-properties',
              '@babel/syntax-do-expressions',
              '@babel/proposal-class-properties',
              '@babel/proposal-do-expressions',
              // this.opts.dev && '@babel/transform-runtime',
              // ['@babel/plugin-transform-modules-commonjs', {
              //   "noInterop": true,
              // }],
              this.opts.hot && 'react-hot-loader/babel',
              !this.opts.dev && [
                'transform-react-remove-prop-types',
                {
                  mode: 'remove',
                  removeImport: true,
                  additionalLibraries: ['react-style-proptype'],
                },
              ],
              !this.opts.dev && ['@babel/transform-react-constant-elements'],
              !this.opts.dev && ['@babel/transform-react-inline-elements'],
            ]),
          },
        },
      ],
    };
  }

  get babelForNode() {
    return {
      test: /\.jsx?$/,
      exclude: /(node_modules[\\/])/,
      loader: 'babel-loader',
      options: {
        babelrc: false,
        targets: { node: '12' },
        presets: [
          [
            '@babel/react',
            {
              runtime: 'automatic',
            },
          ],
          [
            '@babel/env',
            {
              modules: false,
            },
          ],
        ],
        plugins: [
          '@babel/transform-runtime',
          '@babel/syntax-class-properties',
          '@babel/syntax-do-expressions',
          '@babel/proposal-class-properties',
          '@babel/proposal-do-expressions',
          // 'lodash',
        ],
      },
    };
  }

  get template() {
    return {
      test: /\.jade$/,
      use: [{ loader: 'pug-loader' }],
    };
  }

  get css() {
    return {
      test: /[\\/]styles[\\/].*[\\/].*\.scss$/,
      exclude: /\.module\.scss$/,
      use: [
        this.opts.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
        'css-loader',
        'sass-loader',
      ],
    };
  }

  get cssModule() {
    return {
      test: /\.module\.scss$/,
      use: [
        this.opts.dev ? 'style-loader' : MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[name]-[local]-[hash:base64:5]',
            },
          },
        },
        'sass-loader',
      ],
    };
  }

  get cssModuleForTests() {
    return {
      test: /\.module\.scss$/,
      use: 'null-loader',
    };
  }

  get assetsCss() {
    // import '../assets/vendor-css/font-awesome.min.css';
    return {
      test: /[\\/]assets[\\/].*[\\/].*\.css$/,
      use: [this.opts.dev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader'],
    };
  }

  get fonts() {
    return [
      {
        test: /[\\/]as{2}e(?:ts[\\/]fon){2}tawesome[^/]*$/i,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]',
        },
      },
      {
        test: /vazir-font[\\/]dist.*/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[name].[ext]',
        },
      },
    ];
  }

  get photoswipe() {
    const fileName = this.opts.dev ? '[name]-dev.[ext]' : '[name]-[hash].[ext]';

    return {
      test: /photoswipe.+\.(png|svg|gif)$/,
      loader: `file-loader`,
      options: {
        name: `assets/images/photoswipe/${fileName}`,
      },
    };
  }

  get markdown() {
    return {
      test: /\.md$/,
      use: [...this.babel.use, { loader: 'react-markdown-loader' }],
    };
  }

  get otherAssets() {
    const fileName = this.opts.dev ? '[path][name]-dev.[ext]' : '[path][name]-[hash].[ext]';

    return {
      test: /[\\/]assets[\\/]/,
      exclude: [/[\\/]fonts[\\/]fontawesome[^/]*$/i, /[\\/]assets[\\/].*[\\/].*\.css$/],
      loader: `file-loader`,
      options: {
        name: fileName,
      },
    };
  }
}

export default RuleGenerator;
