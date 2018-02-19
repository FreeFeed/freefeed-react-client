import PathRewriter from "webpack-path-rewriter";

import appConfig from '../src/config';


class RuleGenerator {
  opts;

  commonCssExtractor;
  appCssExtractor;

  constructor(opts, commonCssExtractor, appCssExtractor) {
    this.opts = opts;
    this.commonCssExtractor = commonCssExtractor;
    this.appCssExtractor = appCssExtractor;
  }

  get eslint() {
    return {
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
      enforce: 'pre'
    };
  }

  get babel() {
    return {
      test: /\.jsx?$/,
      exclude: /(node_modules[\\/])/,
      loader: 'babel-loader',
      options: {
        babelrc: false,
        ignore: /(node_modules)/,
        presets: [
          "react",
          ["env", {
            modules: false,
            targets: {
              browsers: [
                '>1%',
                'last 3 versions',
                'last 3 iOS versions',
              ]
            }
          }],
          "stage-1"
        ],
      }
    };
  }

  get template() {
    const query = JSON.stringify({ pretty: true, opts: this.opts, appConfig });

    return {
      test: /[.]jade$/,
      loader: PathRewriter.rewriteAndEmit({
        name: '[path][name].html',
        loader: `jade-html-loader?${query}`,
      })
    };
  }

  get commonCss() {
    let loaders = [
      {
        loader: 'css-loader',
        options: {
          autoprefixer: false,
          calc: false,
          mergeIdents: false,
          mergeRules: false,
          sourceMap: true,
          uniqueSelectors: false,
        }
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        }
      }
    ];

    if (this.opts.hot) {
      loaders.unshift({
        loader: 'style-loader',
        options: { sourceMap: true }
      });
    } else {
      loaders = this.commonCssExtractor.extract({
        fallback: 'style-loader',
        use: loaders,
      });
    }

    return {
      test: /[\\/]styles[\\/]common[\\/].*[.]scss$/,
      use: loaders,
    };
  }

  get appCss() {
    let loaders = [
      {
        loader: 'css-loader',
        options: {
          autoprefixer: false,
          calc: false,
          mergeIdents: false,
          mergeRules: false,
          sourceMap: true,
          uniqueSelectors: false,
        }
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
        }
      }
    ];

    if (this.opts.hot) {
      loaders.unshift({
        loader: 'style-loader',
        options: { sourceMap: true }
      });
    } else {
      loaders = this.appCssExtractor.extract({
        fallback: 'style-loader',
        use: loaders,
      });
    }

    return {
      test: /[\\/]styles[\\/]helvetica[\\/].*[.]scss$/,
      use: loaders,
    };
  }

  get fonts() {
    return {
      test: /[\\/]assets[\\/]fonts[\\/]fontawesome[^/]*$/i,
      loader: 'file-loader?name=[path][name].[ext]'
    };
  }

  get photoswipe() {
    const fileName = this.opts.hash ? '[name]-[hash].[ext]' : '[name]-dev.[ext]';

    return {
      test: /photoswipe.+\.(png|svg|gif)$/,
      loader: `file-loader?name=assets/images/photoswipe/${fileName}`
    };
  }

  get otherAssets() {
    const fileName = this.opts.hash ? '[path][name]-[hash].[ext]' : '[path][name]-dev.[ext]';

    return {
      test: /[\\/]assets[\\/]/,
      exclude: /[\\/]fonts[\\/]fontawesome[^/]*$/i,
      loader: `file-loader?name=${fileName}`
    };
  }
}

export default RuleGenerator;
