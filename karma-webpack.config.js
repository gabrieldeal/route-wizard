const path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  mode: 'development',
  entry: './src/lib/index.js',
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
