const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
module.exports = function (target, basepath, htmls) {

  const plugins = htmls.map(({ name, html }) => new HtmlWebpackPlugin({
    template: html,
    chunks: [name],
    filename: `${name}.html`,
    minify: true
  }))
  plugins.push(new MiniCssExtractPlugin({
    filename: "[name].css?[hash]"
  }))
  if (fs.existsSync(path.join(basepath, 'src', 'copy'))) {
    plugins.push(new CopyWebpackPlugin([{
      to: path.join(basepath, target),
      from: path.join(basepath, 'src', 'copy'),
      toType: 'dir'
    }]));
  }
  if (target === 'dist') {
    plugins.push(new CleanWebpackPlugin(['dist'], {
      root: basepath
    }));
  } else {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  return plugins;
};


