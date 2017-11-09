const UglifyJSPlugin = require('uglifyjs-webpack-plugin')


module.exports = {
  entry: './doc/index.tsx',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/docs'
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'awesome-typescript-loader'
    }, {
      enforce: 'pre',
      test: /\.js$/,
      loader: 'source-map-loader'
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader'
      ]
    }]
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM'
  },
  plugins: [
    new UglifyJSPlugin()
  ]
};
