const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = [{
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
}];;
