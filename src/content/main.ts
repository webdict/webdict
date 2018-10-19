import { Injector, Entry } from '../shared/typings';

import inject from './ctrler';
import './index.scss';

const injector: Injector = {
  playme(data) {
    chrome.runtime.sendMessage({ action: 'PLAY_SOUND', data });
  },
  search(data: { text: string, lang: 'en' | 'zh' }, cb: (entries: Entry[]) => void) {
    chrome.runtime.sendMessage({ action: 'SEARCH_TEXT', data }, cb);
  },
  define(data: { word: string, mean: any }) {
    chrome.runtime.sendMessage({ action: 'DEFINE_WORD', data });
  }
};

const { setDictStatus, onPlayError } = inject(injector);


chrome.runtime.onMessage.addListener(({ action, data }, _, send) => {
  if (action === 'PLAY_ERROR') {
    onPlayError(data);
  } else if (action === 'STOP_FIND') {
    send(setDictStatus(true, false) ? '禁用查词功能' : '启用查词功能');
  } else if (action === 'NEED_KEYS') {
    send(setDictStatus(false, true) ? '有修饰键查词' : '无修饰键查词');
  } else if (action === 'ADD_NOTE') {
    const noteText = window.getSelection().toString().trim();
    if (noteText) {
      chrome.runtime.sendMessage({
        action,
        data: {
          text: noteText,
          time: Date.now(),
          url: data.url
        }
      });
    }
  }
});
