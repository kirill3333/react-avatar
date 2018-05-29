const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './example/app.jsx',
  mode: 'development',
  output: {
    path: path.resolve('dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      }, {
        loader: 'babel-loader',
        test: /\.jsx$/,
        exclude: /node_modules/
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      SOURCE_PATH: JSON.stringify('.')
    })
  ],
};
