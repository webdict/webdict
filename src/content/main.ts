import { Injector, Entry } from './../shared/typings';

import inject from './ctrler';

import { insertStorage } from '../shared/storage';


const injector: Injector = {
  play(data) {
    chrome.runtime.sendMessage(data);
  },
  query(data: { query: string, lang: 'en' | 'zh' }, cb: (entry: Entry) => void) {
    chrome.runtime.sendMessage(data, cb);
  },
  post(data, cb?) {
    if (cb) chrome.runtime.sendMessage(data, cb);
    else chrome.runtime.sendMessage(data);
  }
};

const setEnable = inject(injector, () => { });


chrome.runtime.onMessage.addListener(({ action, data }) => {
  if (action === 'ADD_NOTE') {
    try {
      const noteText = window.getSelection().toString().trim();
      if (noteText) {
        chrome.runtime.sendMessage({
          text: noteText,
          time: Date.now(),
          url: data
        });
      }
    } catch{ }
  } else if (action === 'STOP_FIND') {
    setEnable(false);
  } else if (action === 'PLAY_ERROR') {
    if (injector.onplayerror) injector.onplayerror(data);
  }
});
