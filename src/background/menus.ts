chrome.contextMenus.onClicked.addListener((info, tab) => {
  try {
    const { menuItemId: action } = info;
    const { id, url: data } = tab;
    if (action === 'REPORT_BUG') {
      console.log('Reporting bugs to server...');
    } else {
      chrome.tabs.sendMessage(id, { action, data });
    }
  } catch { }
});


chrome.contextMenus.create({
  contexts: ['selection'],
  id: 'ADD_NOTE',
  title: 'Add Note',
});


chrome.contextMenus.create({
  contexts: ['page'],
  id: 'STOP_FIND',
  title: 'Disable Dict',
});
