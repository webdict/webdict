chrome.contextMenus.onClicked.addListener(({ menuItemId }, { id, url }: any) => {
  try {
    if (menuItemId === 'REPORT_BUG') {
      console.log('Reporting bugs to server...');
    } else {
      chrome.tabs.sendMessage(id, { action: menuItemId, data: { url } }, title => {
        chrome.contextMenus.update(menuItemId, { title });
      });
    }
  } catch (e) { }
});


chrome.contextMenus.create({
  contexts: ['selection'],
  id: 'ADD_NOTE',
  title: '添加到笔记本',
});

chrome.contextMenus.create({
  contexts: ['page'],
  id: 'NEED_KEYS',
  title: '有修饰键查词',
});

chrome.contextMenus.create({
  contexts: ['page'],
  id: 'STOP_FIND',
  title: '禁用查词功能',
});

chrome.contextMenus.create({
  contexts: ['page'],
  id: 'REPORT_BUG',
  title: '报告显示错误',
});
