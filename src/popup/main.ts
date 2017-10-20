document.addEventListener('DOMContentLoaded', () => {

  const clickEls = document.querySelectorAll('[data-url]') as NodeListOf<HTMLElement>;

  for (let i = 0; clickEls.length; i++) {
    const el = clickEls[i];
    // if (el && el.onclick) {
    el.onclick = (event) => {
      let path = (event.target as HTMLElement).getAttribute('data-url') as string;
      if (path.indexOf(':') < 0) path = chrome.runtime.getURL(path);
      chrome.tabs.create({ url: path });
      event.preventDefault();
      window.close();
    };
    // }
  }
});
