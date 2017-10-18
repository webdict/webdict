
import setEnable from './ctrler';

import { insertStorage } from '../shared/storage';

function tryToGetTextFromSelection() {
  try {
    return window.getSelection().toString().trim();
  } catch {
    return null;
  }
}

chrome.runtime.onMessage.addListener(
  (request) => {
    if (request.message === 'ADD_NOTE') {
      const noteText = tryToGetTextFromSelection();
      if (noteText) insertStorage(':ngl@notebook', noteText, { moment: Date.now(), url: request.url });
    } else if (request.message === 'STOP_FIND') {
      setEnable(false);
    }
  });
