const path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: './src/lib/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'spec-lib.js',
    globalObject: "typeof window === 'undefined' ? {} : window",
    library: 'routeWizardLib',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!jsts)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [['@babel/plugin-proposal-class-properties']],
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    browsers: ['last 2 versions', 'safari >= 7'],
                  },
                },
              ],
            ],
          },
        },
      },
    ],
  },
};
