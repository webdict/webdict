const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const rules = [{
  test: /\.(js|jsx)$/i,
  loader: 'babel-loader'
}, {
  test: /\.css$/i,
  use: [MiniCssExtractPlugin.loader, 'css-loader']
}, {
  test: /\.s[ac]ss$/i,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
}, {
  test: /\.less$/i,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
}, {
  test: /\.(svg|png|jpg|gif)$/i,
  loader: 'file-loader',
  options: {
    name: '[name].[ext]?[hash]',
    outputPath: 'static/'
  }
}];



const plugins = [
  new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin({
    template: './src/conf/index.html',
    minify: true
  }),
  new MiniCssExtractPlugin({
    filename: "index.css?[hash]"
  })
];

if (fs.existsSync(path.resolve(__dirname, './src/copy'))) {
  plugins.push(new CopyWebpackPlugin([{
    to: path.resolve(__dirname, './dist-debug'),
    from: './src/copy',
    toType: 'dir'
  }]));
}


module.exports = {
  entry: [
    './src/conf/reset.scss',
    './src/index.jsx',
    './src/conf/cover.scss'
  ],
  output: {
    path: path.resolve(__dirname, './dist-debug'),
    filename: 'index.js?[hash]'
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  },
  module: {
    rules
  },
  devServer: {
    contentBase: './dist-debug',
    hot: true
  },
  mode: 'development',
  devtool: 'inline-source-map',
  plugins
};
