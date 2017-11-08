import * as trans from './trans';
import { Entry, ServerEntry } from '../shared/typings';
import gtag from './gtag';



const Q_URL = '__DOMAIN_HOLDER__/q/';
// const M_URL = '__DOMAIN_HOLDER__/m/';
const F_URL = '__DOMAIN_HOLDER__/f/';
// const D_URL = '__DOMAIN_HOLDER__/d/';


const VERSION = '__VERSION_HOLDER__';


function resolveFromServer(entry: ServerEntry, qword: string) {
  if (entry.cleng) {
    entry.qword = qword.substr(0, entry.cleng);
    if (entry.family) {
      const family = entry.family as number[];
      entry.family = new Array<string>(family.length);
      for (let i = 0; i < family.length; i++) {
        entry.family[i] = qword.substr(0, family[i]);
      }
      (entry as Entry).index = 0;
    }
  } else {
    entry.poses.sort((i1, i2) => i1.split('$$')[1].toLowerCase() > i2.split('$$')[1].toLowerCase() ? 1 : -1);
    if (entry.family) {
      if (entry.family[0] === entry.qword) {
        const family: string[] = [];
        const set: { [key: string]: boolean } = {};
        for (const form of entry.family as string[]) {
          if (set[form.toLowerCase()]) continue;
          set[form.toLowerCase()] = true;
          family.push(form);
        }
        if (family.length <= 1) delete entry.family;
        else {
          entry.family = family.sort((a, b) => b.length - a.length);
          (entry as Entry).index = entry.family.indexOf(entry.qword);
        }
      } else (entry as Entry).index = entry.family.length - 1;

    }

  }
  entry.trans = entry.trans && trans.add(entry.qword!, entry.trans) || '[Not Found]';
  if (qword !== entry.qword) map[qword] = entry as Entry;
  return entry as Entry;
}
const EMPTY = Object.create(null);

const map: { [qword: string]: Entry } = Object.create(null);

let mapSize = 0;


export function query(qword: string, lang: 'zh' | 'en', consume: (result: Entry | undefined) => void, async = false) {
  const entry = map[qword] as Entry;
  if (entry) {
    if (entry !== EMPTY) {
      entry.trans = trans.get(entry.qword) || '[Not Found]';
      consume(entry);
      gtag('lookup', { qword: entry.qword });
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', F_URL + encodeURIComponent(lang + qword), async);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.responseText) {
          const baseEntry = JSON.parse(xhr.responseText) as Entry;
          if (baseEntry.next) consume(baseEntry);
          else {
            baseEntry.qword = qword;
            baseEntry.trans = baseEntry.trans && trans.add(qword, baseEntry.trans) || '[Not Found]';
            if (lang === 'zh') baseEntry.cleng = qword.length;
            else baseEntry.poses.sort((i1, i2) => i1.split('$$')[1].toLowerCase() > i2.split('$$')[1].toLowerCase() ? 1 : -1);
            mapSize++;
            consume(map[qword] = baseEntry);
            gtag('lookup', { qword });
          }
        } else consume(undefined);
      };
      xhr.onerror = () => { consume(undefined); };
      xhr.send();
    }
  } else {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', Q_URL + encodeURIComponent(VERSION + lang + qword), async);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.responseText.trim()) {
        const response = JSON.parse(xhr.responseText) as ServerEntry;
        if (response.next) consume(response as Entry);
        else {
          const newEntry = resolveFromServer(response, qword);
          if (newEntry.family) {
            for (const form of newEntry.family) {
              map[form] = EMPTY;
            }
          }
          mapSize++;
          consume(map[newEntry.qword] = newEntry);
          gtag('lookup', { qword: newEntry.qword });
        }
      } else consume(undefined);
    };
    xhr.onerror = () => {
      consume(undefined);
      gtag('lookup_error', { qword });
    };
    xhr.send();
  }
}

export const post = trans.set;
