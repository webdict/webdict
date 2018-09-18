import { Injector, Entry } from '../shared/typings';

import inject from './ctrler';
import './index.scss';
// import { insertStorage } from '../shared/storage';

const injector: Injector = {
  play(data) {
    chrome.runtime.sendMessage({ action: 'PLAY_SOUND', data });
  },
  find(data: { word: string, lang: 'en' | 'zh' }, cb: (entry: Entry) => void) {
    chrome.runtime.sendMessage({ action: 'FIND_WORD', data }, cb);
  },
  post(data, cb?) {
    if (cb) chrome.runtime.sendMessage({ action: 'POST_WORD', data }, cb);
    else chrome.runtime.sendMessage({ action: 'POST_WORD', data });
  }
};

const setEnable = inject(injector);


chrome.runtime.onMessage.addListener(({ action, data }) => {
  if (action === 'PLAY_ERROR') {
    if (injector.onplayerror) injector.onplayerror(data);
  } else if (action === 'STOP_FIND') {
    setEnable(false);
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
