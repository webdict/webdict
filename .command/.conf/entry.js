const chalk = require('chalk');
const path = require('path');
const fs = require('fs');


function srcpath(basedir) {
  const srcdir = path.join(basedir, 'src');
  if (fs.existsSync(srcdir)) {
    return {
      basedir,
      srcdir
    };
  }
  const { base, dir } = path.parse(basedir);
  if (!base) {
    console.log(chalk.red('src directory not found.'));
    process.exit();
  }
  return srcpath(dir);
}

const {
  srcdir, basedir
} = srcpath(process.env.INIT_CWD);


const entries = fs.readdirSync(srcdir)
  .map(file => path.join(srcdir, file))
  .filter(file => {
    if (fs.statSync(file).isDirectory()) {
      return false;
    }
    const ext = path.extname(file);
    return ext && '.js.jsx.ts.tsx'.includes(ext);
  });

const entry = {};
const htmls = [];
const includes = process.argv.slice(2);
for (const entryfile of entries) {
  const {
    ext, name
  } = path.parse(entryfile);
  if (includes.length && !includes.includes(name)) {
    continue;
  }
  const html = path.join(srcdir, 'conf', `${name}.html`);
  if (fs.existsSync(html)) {
    console.log(chalk.green(`Page ${name}:`));
    console.log(chalk.green(`    ${html}`));
    htmls.push({ name, html });
    entry[name] = [
      path.join(srcdir, 'conf', `${name}.reset.scss`),
      path.join(srcdir, 'conf', `reset.scss`),
      entryfile,
      path.join(srcdir, 'conf', `${name}.cover.scss`),
      path.join(srcdir, 'conf', `cover.scss`)
    ].filter(file => {
      if (fs.existsSync(file)) {
        console.log(chalk.green(`    ${file}`));
        return true;
      } else {
        console.log(chalk.yellow(`    ${file}`));
        return false;
      }
    });

  } else {
    console.log(chalk.red(`Page ${name}:`));
    console.log(chalk.red(`    ${html}`));
  }
}
console.log('\n');
if (htmls.length) {
  module.exports = {
    basedir,
    entry,
    htmls
  };
} else {
  console.log(chalk.red('Entry file not found...'));
  process.exit();
}
