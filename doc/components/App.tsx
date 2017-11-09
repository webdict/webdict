import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Header from './Header';
import Banner from './Banner';
const header = {
  head: 'Web Dictionary',
  disc: '不经意间让你读得更好 · 更快 · 更多',
  buttons: [{
    text: 'GitHub 主页',
    href: 'https://github.com/ngolin/webdict'
  }, {
    text: '下载最新版',
    href: 'https://github.com/ngolin/webdict/blob/master/webdict-latest.crx?raw=true'
  }, {
    text: '在网上商店',
    href: 'https://chrome.google.com/webstore/detail/webdict/kbiinngndpkahmlokpocicmmcoihhocg'
  }]
};
const features = [{
  head: '双击或选择查英文生词，并播放发音',
  text: 'We want to make the world a better, fairer place. We want to keep the powerful honest. And we believe that doing so means keeping society informed by producing quality, independent journalism, which discovers and tells readers the truth.'
}, {
  head: '双击或选择查中文汉字，并播放拼音',
  text: '楼下一个男人病得要死，那间壁的一家唱着留声机；对面是弄孩子。楼上有两人狂笑；还有打牌声。河中的船上有女人哭着她死去的母亲。人类的悲欢并不相通，我只觉得他们吵闹。 —— 鲁迅'
}];

export default function (store) {

  ReactDOM.render((<div>
    <Header {...header} />
    {features.map((feature) =>
      <Banner head={feature.head} text={feature.text} done={false} />
    )}
  </div>), document.getElementById('root'));
}