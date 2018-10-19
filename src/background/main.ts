import Fetch from '../fetch';
import play from './player';
import './menus';
import './cnd';


chrome.runtime.onMessage.addListener(({ action, data }, sender, sendRes) => {
  switch (action) {
    case 'ADD_NOTE':
      console.log(data);
      return false;
    case 'PLAY_SOUND':
      play(data.code, data => {
        chrome.tabs.sendMessage(sender.tab!.id!, { action: 'PLAY_ERROR', data });
      });
      return false;
    case 'SEARCH_TEXT':
      Fetch.search(data as { text: string, lang: 'en' | 'zh' }).then(entries => {
        sendRes(entries);
      });
      return true;
    case 'DEFINE_WORD':
      const { mean, word } = data;
      console.log(word, mean);
      return false;
    default:
      return false;
  }
});


chrome.browserAction.onClicked.addListener(() => {
  const url = chrome.runtime.getURL('console.html');
  chrome.tabs.create({ url });
})
