const { kebabCase } = require('lodash');
const hicode = require('../hicode');
function indexJsx(view, args) {
  return [
    hicode(args),
    `import React from 'react';`,
    `// import { Link } from 'react-router-dom';`,
    `// import { Modal } from 'antd-mobile';`,
    `// import { Icon } from 'antd';`,
    `// import chunk from 'lodash/chunk';`,
    `// import tree from 'hife/tree';`,
    ``,
    `import './style.scss';`,
    ``,
    `export default function ${view}({ loading }) {`,
    `  return (`,
    `    <div className="${kebabCase(view)}-main">`,
    `      ${view}`,
    `    </div>`,
    `  );`,
    ``,
    `}`,
    ``,
    `// export default class ${view} extends React.Component {`,
    `//   constructor(props) {`,
    `//     super(props);`,
    `//     this.state = {`,
    `//       value: ''`,
    `//     };`,
    `//   }`,
    ``,
    `//   render() {`,
    `//     return (`,
    `//       <div className="${kebabCase(view)}-main">`,
    `//         ${view}`,
    `//       </div>`,
    `//     );`,
    `//   }`,
    ``,
    `// }`,
    ``
  ].join('\n');

}

function indexSass(view, args) {
  return [
    hicode(args),
    `@import '../../conf/vars';`,
    ``,
    `.${kebabCase(view)} {`,
    `  &-main {`,
    `    padding: 8px;`,
    `  }`,
    ``,
    `}`,
    ``
  ].join('\n');
}

module.exports = function (file, view, args) {
  switch (file) {
    case 'index.jsx':
      return indexJsx(view, args);
    case 'style.scss':
      return indexSass(view, args);
    default:
      throw new Error(`Unknown file: ${file}...`);
  }
}