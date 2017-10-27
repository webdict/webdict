import timeAgo from './timeago';
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
  const timeAgoEl = document.getElementById('time-ago');
  if (timeAgoEl) {
    let intervalId: any;
    let xhr: any;
    function update() {
      if (xhr) return;
      xhr = new XMLHttpRequest();
      xhr.open("GET", '__DOMAIN_HOLDER__/s/json');
      xhr.onload = () => {
        timeAgoEl!.className = '';
        const data = JSON.parse(xhr.responseText);
        timeAgoEl!.innerText = data.count + ' @' + timeAgo(data.stamp);
        timeAgoEl!.style.display = 'block';
        if (intervalId !== undefined) {
          clearInterval(intervalId);
        }
        intervalId = setInterval(() => {
          if (!timeAgoEl!.className) timeAgoEl!.className = 'fadeout';
          timeAgoEl!.innerText = data.count + ' @' + timeAgo(data.stamp);
        }, 1000);
        xhr = null;
      };
      xhr.onerror = () => {
        xhr = null;
      };
      xhr.send();
    }
    update();
    timeAgoEl.onclick = update;
  }
});
