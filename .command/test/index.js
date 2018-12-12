const {
  basedir, entry, htmls
} = require('../.conf/entry');


const chalk = require('chalk');
const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const path = require('path');


if (!process.env.IMEXT) {
  console.log(chalk.red('Environment variable IMEXT not set\n\n'));
}


const config = require('../.conf/config')({
  target: 'server',
  entry,
  basedir,
  htmls
});

const options = {
  contentBase: path.join(basedir, 'server'),
  hotOnly: true,
  host: '0.0.0.0',
  port: 8081,
  hot: true
};


webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);
server.listen(8081, '0.0.0.0', () => {
  console.log(chalk.yellow('\nDev server listening on port 8081\n'));
  Object.keys(entry)
    .map(name => `http://localhost:8081/${name}.html`)
    .forEach(page => {
      console.log(chalk.green(page))
      require('opn')(page);
    });
  console.log();
});