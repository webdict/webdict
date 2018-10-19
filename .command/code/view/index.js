const content = require('./content');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
module.exports = function (base, name, args) {
  if (!/^([A-Z][a-z0-9]*){2,}$/.test(name)) {
    console.log(chalk.red(`${name}: Incorrect name convention...`));
    process.exit();
  }
  const files = ['index.jsx', 'style.scss'];
  if (fs.existsSync(path.join(base, name))) {
    console.log(chalk.red(`${path.join(base, name)} exists...`));
    process.exit();
  } else {
    fs.mkdirSync(path.join(base, name));
  }
  files.forEach(file => {
    fs.createWriteStream(path.join(base, name, file)).write(
      content(file, name, args)
    );
    console.log(chalk.green('Created: ' + path.join(base, name, file)));
  });

}