
import './menus';
import play from './player';

import { post, query } from './entry';
// : { 'play': string, 'query': string, 'lang': 'zh' | 'en', 'newVal': string }
chrome.runtime.onMessage.addListener(({ action, data }, sender, sendRes) => {
  switch (action) {
    case 'ADD_NOTE':
      console.log(data);
      return true;
    case 'PLAY_SOUND':
      const tabId = sender.tab && sender.tab.id;
      play(data.play, data => {
        chrome.tabs.sendMessage(tabId as number, { action: 'PLAY_ERROR', data });
      });
      return false;
    case 'QUERY_WORD':
      query(data.query, data.lang, sendRes as (all: any) => void);
      return true;
    case 'POST_WORD':
      post(data.query, data.newVal, sendRes as (newVal: string) => void);
      return true;
    default:
      return true;
  }
});



