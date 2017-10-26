document.addEventListener('DOMContentLoaded', () => {

  const clickEls = document.querySelectorAll('[data-url]') as NodeListOf<HTMLElement>;

  for (let i = 0; i < clickEls.length; i++) {
    const el = clickEls[i];
    el.onclick = (event) => {
      let path = el.getAttribute('data-url') as string;
      if (path.indexOf(':') < 0) {
        path = chrome.runtime.getURL(path);
      }
      chrome.tabs.create({ url: path });
      event.preventDefault();
      window.close();
    };
  }
});
