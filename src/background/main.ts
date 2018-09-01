
import './menus';
import play from './player';

import { post, query } from './entry';

chrome.runtime.onMessage.addListener((msg: { 'play': string, 'query': string, 'lang': 'zh' | 'en', 'newVal': string }, sender, sendRes) => {
  if (msg.play) {
    const tabId = sender.tab && sender.tab.id;
    play(msg.play, data => {
      chrome.tabs.sendMessage(tabId as number, { action: 'PLAY_ERROR', data });
    });
  } else if (msg.lang) {
    query(msg.query, msg.lang, sendRes as (all: any) => void);
    return true;
  } else if (msg.newVal) {
    post(msg.query, msg.newVal, sendRes as (newVal: string) => void);
    return true;
  }
  return false;
});



