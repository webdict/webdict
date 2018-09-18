// const Q_URL = '__DOMAIN_HOLDER__/q/';
// const M_URL = '__DOMAIN_HOLDER__/m/';
// const F_URL = '__DOMAIN_HOLDER__/f/';
const D_URL = 'http://120.78.146.219/d/';
const P_URL = 'http://120.78.146.219/definition';


const trans: { [key: string]: string } = Object.create(null);

const older: { [key: string]: string } = Object.create(null);

export function add(key: string, value: string) {
  return trans[key = key.toLowerCase()] ? get(key) : trans[key] = value;
}

export function get(key: string, value?: string): string | undefined {
  return (value = trans[key.toLowerCase()] || value) && (value.charAt(0) !== '@' ? value : get(value.substr(1)));
}

export function set(key: string, value: string, consume: (newVal: string) => void, async = false): void {
  key = key.toLowerCase();
  if (!older[key]) older[key] = trans[key];
  if (value.charAt(0) !== '@') {
    trans[key] = value;
    if (consume) {
      consume(value);
    }
  } else {
    const val = get(value.substr(1));
    if (val) {
      trans[key] = value;
      consume(val);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', D_URL + encodeURIComponent(value), async);
      xhr.onload = () => {
        if (xhr.responseText) {
          trans[key] = value;
          consume(trans[value.substr(1).toLowerCase()] = xhr.responseText);
        } else {
          consume('[Ref Error]');
        }
      };
      xhr.onerror = xhr.ontimeout = () => {
        consume('[Net Error]');
      };
      xhr.send();
    }
  }
}

if (chrome && chrome.windows && chrome.tabs) {
  try {
    chrome.windows.onRemoved.addListener(post);
    chrome.tabs.onRemoved.addListener(post);
  } catch(e){ }
}



function post() {

  const formData = new FormData();
  const keys = new Array<string>();
  // tslint:disable-next-line forin
  for (const key in older) {
    const value = trans[key];
    if (older[key] !== value && key.indexOf('&') < 0 && value.indexOf('&&') < 0) {
      formData.append(key, value);
      keys.push(key);
    }
  }

  if (keys.length > 0) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', P_URL);
    xhr.onload = () => {
      for (const key of keys) {
        delete older[key];
      }
    };
    xhr.send(formData);
  }

}
