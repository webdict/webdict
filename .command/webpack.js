const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const webpack = require('webpack');
const chalk = require('chalk');
const path = require('path');

module.exports = function (config) {
  const compiler = webpack(config);
  compiler.apply(
    new ProgressPlugin((percentage, msg, current, active, modulepath) => {
      if (process.stdout.isTTY && percentage < 1) {
        process.stdout.cursorTo(0);
        modulepath = modulepath ? ' .../' + path.basename(modulepath) : '';
        current = current ? ' ' + current : '';
        active = active ? ' ' + active : '';
        process.stdout.write(`${(percentage * 100).toFixed(0)}% ${msg + current + active + modulepath}`);
        process.stdout.clearLine(1);
      } else if (percentage === 1) {
        process.stdout.clearLine(1);
        process.stdout.write('\n\n');
        console.log(chalk.yellow(`webpack: done @${new Date().toLocaleString()}`));
        process.stdout.write('\n');
      }
    }));
  const watching = compiler.watch({
    ignored: /node_modules/,
    aggregateTimeout: 0
  }, (err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
    }

    // if (stats.hasWarnings()) {
    //   console.warn(info.warnings);
    // }

    console.log(stats.toString({
      children: false,
      warnings: false,
      version: false,
      maxModules: 4,
      cached: false,
      assets: false,
      chunks: false,
      colors: true,
    }));
  });
  return compiler;
};