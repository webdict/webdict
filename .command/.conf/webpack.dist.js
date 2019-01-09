const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const rules = [
  {
    test: /\.(js|jsx)$/i,
    loader: 'babel-loader'
  },
  {
    test: /\.css$/i,
    use: [MiniCssExtractPlugin.loader, 'css-loader']
  },
  {
    test: /\.s[ac]ss$/i,
    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
  },
  {
    test: /\.(svg|png|jpg|gif)$/i,
    loader: 'file-loader',
    options: {
      name: '[name].[ext]?[hash]',
      outputPath: 'static/'
    }
  }
];

const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin({
    template: './src/conf/index.html',
    minify: true
  }),
  new CleanWebpackPlugin(['dist']),
  new MiniCssExtractPlugin({
    filename: 'index.css?[hash]'
  })
];

if (fs.existsSync(path.resolve(__dirname, './src/copy'))) {
  plugins.push(
    new CopyWebpackPlugin([
      {
        to: path.resolve(__dirname, './dist'),
        from: './src/copy',
        toType: 'dir'
      }
    ])
  );
}

module.exports = {
  entry: ['./src/conf/reset.scss', './src/index.jsx', './src/conf/cover.scss'],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js?[hash]'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules
  },
  mode: 'production',
  devtool: 'none',
  plugins
};
