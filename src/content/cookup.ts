import { Pron } from '../shared/typings';
import SECRET from '../shared/SECRET';
export default function (data, lang: 'en' | 'zh'): Pron[] {
  if (lang === 'en') {
    return Array.from(Object.keys(data).reduce((map, mark) => {
      const [pronuk, pronus, mean] = data[mark];
      const key = [pronuk, pronus, mean].join(SECRET);
      if (map.has(key)) {
        map.get(key).push(mark);
      } else {
        map.set(key, [mark]);
      }
      return map;
    }, new Map<string, string[]>())).map(([key, marks]) => {
      const mark = marks.sort().join(SECRET);
      const [pronuk, pronus, mean] = key.split(SECRET);
      return { lang, pron: [pronuk, mark, pronus], mean };
    }).sort(({ pron: p, pron: _p }) => (_p.join('').length - p.join('').length) || (_p[1].length - p[1].length) || (p[1] > _p[1] ? 1 : -1)
    ) as Pron[];
  } else if (lang === 'zh') {
    return Array.from(Object.keys(data).map(mark => {
      const [pinv, mean] = data[mark];
      return { lang: mark, pinv, mean };
    }).sort(({ lang }, { lang: _lang }) => lang > _lang ? 1 : -1).reduce((map, { lang, pinv, mean }) => {
      const key = [lang.split('-')[0], mean].join(SECRET);
      if (map.has(key)) {
        map.get(key).push({ lang, pinv });
      } else {
        map.set(key, [{ lang, pinv }]);
      }
      return map;
    }, new Map<string, { lang, pinv }[]>())).map(([key, lps]) => {
      const mean = key.split(SECRET).slice(-1)[0];
      const lang = lps.map(({ lang }) => lang).join(SECRET);
      const pinv = lps.map(({ pinv }) => pinv).join('; ');
      console.log(lang, pinv, mean);
      return { lang, pron: ['»', pinv, '«'], mean };
    }) as Pron[];
  }
  return [] as Pron[];
}