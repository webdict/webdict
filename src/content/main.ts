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
  define(data: { word: string, lang: 'en' | 'zh' }) {
    chrome.runtime.sendMessage({ action: 'DEFINE_WORD', data });
  }
};

const { setDictStatus, onPlayError } = inject(injector);


chrome.runtime.onMessage.addListener(({ action, data }) => {
  if (action === 'PLAY_ERROR') {
    onPlayError(data);
  } else if (action === 'STOP_FIND') {
    setDictStatus(false);
  } else if (action === 'ADD_NOTE') {
    const noteText = window.getSelection().toString().trim();
    if (noteText) {
      chrome.runtime.sendMessage({
        action,
        data: {
          text: noteText,
          time: Date.now(),
          url: data
        }
      });
    }
  }
});
