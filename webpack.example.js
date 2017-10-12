const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './example/app.jsx',
  output: {
    path: path.resolve('docs'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      SOURCE_PATH: JSON.stringify('.')
    })
  ]

}