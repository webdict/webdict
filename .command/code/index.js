const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

const base = process.env.INIT_CWD;

const program = process.argv.slice(2);

if (['component', 'components', 'view', 'views'].includes(path.basename(base))) {
  require('./view')(base, program[0], program.slice(1));
} else if (path.basename(base) === 'page') {
  require('./page')(base, program[0], program.slice(1));
} else {
  console.log(chalk.green('1. 在 view，新建组件'));
  console.log(chalk.green('2. 在 page，新建页面'));
}
