const path = require('path');

module.exports = function ({
  target,
  entry,
  htmls,
  basedir
}) {
  const resolve = {
    extensions: [".js", ".jsx", ".ts", ".tsx"]
  };
  const output = {
    path: path.join(basedir, target),
    filename: '[name].js?[hash]'
  };
  const module = {
    rules: require('./rules')
  };
  const plugins = require('./plugins')(target, basedir, htmls);
  const config = {
    entry,
    output,
    module,
    resolve,
    plugins
  };
  if (target === 'dist') {
    config.mode = 'production';
    config.devtool = 'none';
  } else {
    config.mode = 'development';
    config.devtool = 'inline-source-map';
  }
  return config;
};