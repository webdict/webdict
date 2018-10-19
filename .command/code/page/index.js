const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const hicode = require('../hicode');
module.exports = function (base, name, args) {
  if (!/^([A-Z][a-z0-9]*)+$/.test(name)) {
    console.log(chalk.red('Incorrect name convention...'));
    process.exit();
  }

  const file = path.join(base, name + '.jsx');
  if (fs.existsSync(file)) {
    console.log(chalk.red(`${file} existed...`));
    process.exit();
  }

  fs.createWriteStream(file).write(
    [
      hicode(args),
      `import React from 'react';`,
      `// import { Modal } from 'antd-mobile';`,
      `// import { Icon } from 'antd';`,
      ``,
      `// import Component from '../../shared/view/Component';`,
      `import Component from '../view/Component';`,
      ``,
      `import Fetch from '../fetch';`,
      ``,
      `export default class ${name} extends React.Component {`,
      `  constructor(props) {`,
      `    super(props);`,
      `    this.state = {`,
      `      data: null`,
      `    };`,
      `  }`,
      ``,
      `  componentDidMount() {`,
      `    document.title = 'Title';`,
      `    // const { id } = this.props.match.params;`,
      `  }`,
      ``,
      `  render() {`,
      `    return (`,
      `      <div className="app-page">`,
      `        ${name}`,
      `      </div>`,
      `    );`,
      `  }`,
      ``,
      `}`,
      ``
    ].join('\n')
  );

  console.log(chalk.green('Created: ' + file));
}



