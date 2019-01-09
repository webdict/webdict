const strftime = require('hife/strftime').default;
module.exports = args =>
  [
    `/**\n`,
    ` * ${strip(process.env.AUTHORINFO)}\n`,
    ` * ${strftime(Date.now())}\n`,
    `${args.length > 0 ? ' *\n' : ''}`,
    `${args.map(arg => ` * ${arg}\n`)}`,
    ` *\n`,
    ` */\n\n`
  ].join('');

function strip(info) {
  if (info) {
    const short = /^[" `']*([^" `']+ ?<[-_.@:a-z0-9]+>)[" `']*$/i.exec(info);
    if (short) return short[1];
    return '姓名<example@email.com>';
  }
  return '请设置 AUTHORINFO 环境变量';
}
