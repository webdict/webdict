document.addEventListener('DOMContentLoaded', () => {

  const urlels = document.querySelectorAll('[data-url]') as NodeListOf<HTMLElement>;

  for (let i = 0; urlels.length; i++) {
    urlels[i].onclick = (event) => {
      let path = (event.target as HTMLElement).getAttribute('data-url') as string;
      if (path.indexOf(':') < 0) path = chrome.runtime.getURL(path);
      chrome.tabs.create({ url: path });
      event.preventDefault();
      window.close();
    };
  }

});
