import { PageScriptAction, BackgroundAction } from '../shared/enums';
import trigger from './trigger';
type Message = { action: BackgroundAction; data: any };

const { onPlayError } = trigger({
  playme(data) {
    const action = PageScriptAction.PLAY_SOUND;
    chrome.runtime.sendMessage({ action, data });
  },
  search(data) {
    const action = PageScriptAction.SEARCH_TEXT;
    return new Promise(resolve =>
      chrome.runtime.sendMessage({ action, data }, resolve)
    );
  },
  define(data) {
    const action = PageScriptAction.DEFINE_WORD;
    chrome.runtime.sendMessage({ action, data });
  },
  viewed(data) {
    const action = PageScriptAction.WORD_VIEWED;
    chrome.runtime.sendMessage({ action, data });
  },
});

chrome.runtime.onMessage.addListener(({ action, data }: Message) => {
  if (action === BackgroundAction.PLAY_ERROR) {
    onPlayError(data);
  }
});
