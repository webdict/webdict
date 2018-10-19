const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
    template: path.resolve(__dirname, './Delivery/desktop/src/conf/home.html'),
    filename: 'home.html',
    chunks: ['home'],
    minify: true
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './Delivery/desktop/src/conf/login.html'),
    filename: 'login.html',
    chunks: ['login'],
    minify: true
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, './Delivery/desktop/src/conf/ems.html'),
    filename: 'ems.html',
    chunks: ['ems'],
    minify: true
  }),
  new CleanWebpackPlugin(['dist'], {
    root: path.resolve(__dirname, './Delivery/desktop')
  }),
  new MiniCssExtractPlugin({
    filename: "[name].css?[hash]"
  })
];

if (fs.existsSync(path.resolve(__dirname, './Delivery/desktop/src/copy'))) {
  plugins.push(new CopyWebpackPlugin([{
    to: path.resolve(__dirname, './Delivery/desktop/dist'),
    from: './Delivery/desktop/src/copy',
    toType: 'dir'
  }]));
}


module.exports = {
  entry: {
    home: [
      './Delivery/desktop/src/conf/reset.scss',
      './Delivery/desktop/src/home.jsx',
      './Delivery/desktop/src/conf/cover.scss'
    ],
    login: [
      './Delivery/desktop/src/conf/reset.scss',
      './Delivery/desktop/src/login.jsx',
      './Delivery/desktop/src/conf/cover.scss'
    ],
    ems: [
      './Delivery/desktop/src/conf/reset.scss',
      './Delivery/desktop/src/ems.jsx',
      './Delivery/desktop/src/conf/cover.scss'
    ]
  },
  output: {
    path: path.resolve(__dirname, './Delivery/desktop/dist'),
    filename: '[name].js?[hash]'
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  },
  module: {
    rules
  },
  mode: 'production',
  devtool: 'none',
  plugins
};
