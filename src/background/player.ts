import gtag from './gtag';
const ZH_URL = '__DOMAIN_HOLDER__/static/pron/zh/';
const UK_URL = '__DOMAIN_HOLDER__/static/pron/uk/';
const US_URL = '__DOMAIN_HOLDER__/static/pron/us/';


const map: { [id: string]: HTMLAudioElement | undefined } = Object.create(null);
/**
 * `id` formats:
 * 
 * 1. `zh:pin1.ogg`
 * 2. `uk:C7IZLO-RJ.mp3`
 * 3. `us:F7I-NLO-KJ.mp3`
 * 
 * `onerror` when playing failed.
 */
export default function play(id: string, onerror: (id: string) => void) {
  const oldAudio = map[id];
  if (oldAudio) {
    if (oldAudio.getAttribute('disabled')) {
      if (onerror) onerror(id);
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
      if (onerror) onerror(id);
      gtag('play_error', { id });
    };
  }
}
