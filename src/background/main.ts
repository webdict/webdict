import webdictDisabled from './action';
import Fetch from '../fetch';
import notify from './notify';
import play from './player';
import './request';
import './menus';
import './life';
chrome.runtime.onMessage.addListener(({ action, data }, sender, sendRes) => {
  if (webdictDisabled()) {
    return false;
  }
  switch (action) {
    case 'ADD_NOTE':
      Fetch.mynote(data);
      return false;
    case 'PLAY_SOUND':
      play(data.code, data => {
        chrome.tabs.sendMessage(sender.tab!.id!, {
          action: 'PLAY_ERROR', data
        });
      });
      return false;
    case 'SEARCH_TEXT':
      Fetch.search(data).then(worddata => {
        sendRes(worddata);
      });
      return true;
    case 'DEFINE_WORD':
      Fetch.define(data).then(state => {
        if (state === -2) {
          notify('权限不足', '请注册登录');
          chrome.tabs.create({
            url: chrome.runtime.getURL('console.html#/join')
          });
        }
      })
      return false;
    case 'WORD_VIEWED':
      console.log(action, data);

      return false;
    default:
      throw `Unknown action: ${action}`;
  }
});
