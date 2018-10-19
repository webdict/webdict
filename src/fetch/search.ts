import { Entry } from '../shared/typings';
import SECRET from '../shared/SECRET';
import fetch from './_';


export default ({ text, lang }: { text: string, lang: 'en' | 'zh' }): Promise<Entry[]> =>
  fetch(`/dict/api/v1/search/${lang}/${encodeURIComponent(text)}`)
    .then(data => data.map(({ word, pron, mean }) => ({ word, data: _data(pron, lang, mean) })))
    .then(data => {
      console.log(data);
      return data;
    });


function _data(pron, lang: 'en' | 'zh', mean) {
  if (lang === 'en') {
    return Array.from(Object.keys(pron).reduce((map, pos) => {
      const [pronuk, pronus] = pron[pos];
      const key = [pronuk, pronus, mean].join(SECRET);
      if (map.has(key)) {
        map.get(key).push(pos);
      } else {
        map.set(key, [pos]);
      }
      return map;
    }, new Map<string, string[]>())).map(([key, poses]) => {
      const pos = poses.sort().join(SECRET);
      const [pronuk, pronus, mean] = key.split(SECRET);
      return { lang, pron: [pronuk, pos, pronus], mean };
    }).sort(({ pron: [uk, os, us], pron: [_uk, _os, _us] }) => ((_uk + _us + _os).length - (uk + us + os).length) || (_os.length - os.length) || (os > _os ? 1 : -1)
    );
  } else if (lang === 'zh') {
    return Object.keys(pron).map(lang => {
      const pinv = pron[lang];
      return { lang: 'zh-' + lang, pron: ['»', pinv, '«'], mean };
    }).sort(({ lang, pron }, { lang: _lang, pron: _pron }) => lang === _lang
      ? _pron[1].length - pron[1].length
      : lang > _lang
        ? 1
        : -1
    );
  }
  return [];
}