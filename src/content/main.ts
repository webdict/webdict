import { Injector, Entry } from './../shared/typings';

import inject from './ctrler';

import { insertStorage } from '../shared/storage';

function tryToGetTextFromSelection() {
  try {
    return window.getSelection().toString().trim();
  } catch {
    return null;
  }
}

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

chrome.runtime.onMessage.addListener((msg: { 'play': string }) => {
  if (injector.onplayerror) injector.onplayerror(msg.play);
});
const setEnable = inject(injector, () => { });


chrome.runtime.onMessage.addListener(
  (request) => {
    if (request.message === 'ADD_NOTE') {
      const noteText = tryToGetTextFromSelection();
      if (noteText) insertStorage(':ngl@notebook', noteText, { moment: Date.now(), url: request.url });
    } else if (request.message === 'STOP_FIND') {
      setEnable(false);
    }
  });
