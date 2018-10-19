const path = require('path');
const base = process.env.INIT_CWD;
const chalk = require('chalk');
const fs = require('fs');
function multiply(paths, join = (one, two) => one + two) {
  return paths.reduce((prevArr, nextArr) => prevArr.reduce((array, prevStr) =>
    array.concat(nextArr.map(nextStr => join(prevStr, nextStr))), []));
}

function parents(base) {
  const result = [];
  while (true) {
    const parsed = path.parse(base);
    if (!parsed.base) return result;
    result.push(base);
    base = parsed.dir;
  }
  return result
}

module.exports = function (action) {
  const files = multiply([
    parents(base), ['', 'src', 'view'],
    multiply([
      ['index', 'home', 'test'],
      ['.jsx', '.tsx', '.js', '.ts']
    ])
  ], path.join
  );

  if (!files.some(file => {
    if (fs.existsSync(file)) {
      console.log(chalk.green(`Entry: ${file}\n`));
      require('./webpack')({
        filename: path.basename(file).split('.')[0] + '.js',
        basename: path.resolve(file, '../../'),
        entry: file,
        action
      });
      return true;
    }
  })) {
    console.log(chalk.red('Entry file not found...'));
  }
}
