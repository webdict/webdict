import gtag from './gtag';
const ZH_URL = '__DOMAIN_HOLDER__/static/pron/zh/';
const UK_URL = '__DOMAIN_HOLDER__/static/pron/uk/';
const US_URL = '__DOMAIN_HOLDER__/static/pron/us/';


const map: { [id: string]: HTMLAudioElement | undefined } = Object.create(null);

export function play(id: string, tabId: number | undefined) {
  const oldAudio = map[id];
  if (oldAudio) {
    if (oldAudio.getAttribute('disabled')) {
      if (tabId !== undefined) chrome.tabs.sendMessage(tabId, id);
    } else {
      oldAudio.play();
    }
  } else {
    const newAudio = map[id] = document.createElement('audio');
    newAudio.preload = 'auto';
    newAudio.autoplay = true;
    const [lang, url] = id.split(':');
    if (lang === 'zh') {
      newAudio.src = ZH_URL + url + '.ogg';
    } else if (lang === 'uk') {
      newAudio.src = UK_URL + url + '.mp3';
    } else if (lang === 'us') {
      newAudio.src = US_URL + url + '.mp3';
    }
    newAudio.onerror = (event: ErrorEvent) => {
      event.stopPropagation();
      newAudio.setAttribute('disabled', 'disabled');
      if (tabId !== undefined) chrome.tabs.sendMessage(tabId, id);
      gtag('play_error', { id });
    };
  }
}
