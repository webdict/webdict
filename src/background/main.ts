

import { play } from './player';

import { applyDefine, query } from './entry';

chrome.runtime.onMessage.addListener((msg: { 'play': string, 'query': string, 'lang': 'zh' | 'en', 'newVal': string }, sender, sendRes) => {
  if (msg.play) play(msg.play, sender.tab && sender.tab.id);
  else if (msg.lang) {
    query(msg.query, msg.lang, sendRes as (all: any) => void);
    return true;
  } else if (msg.newVal) {
    applyDefine(msg.query, msg.newVal, sendRes as (newVal: string) => void);
    return true;
  }
  return false;
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (tab && tab.id) {
    try {
      chrome.tabs.sendMessage(tab.id, { message: info.menuItemId, url: tab.url });
    } catch { }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    contexts: ['selection'],
    id: 'ADD_NOTE',
    title: 'Add to Note Book',
  });
  chrome.contextMenus.create({
    contexts: ['page'],
    id: 'STOP_FIND',
    title: 'Stop Auto Pop-up',
  });
});
