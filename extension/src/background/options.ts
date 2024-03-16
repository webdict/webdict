import { BGWindow, OptionProps } from '.';

declare const window: BGWindow;

let options: OptionProps = {
  on: true,
  zh: true,
  en: true,
  jp: false,
};

const dIcons = {
  '16': 'disabled/icon16.png',
  '32': 'disabled/icon32.png',
  '48': 'disabled/icon48.png',
  '128': 'disabled/icon128.png',
};

const { icons: eIcons } = chrome.runtime.getManifest();

function setIcon(enabled: boolean) {
  chrome.browserAction.setIcon({
    path: enabled ? eIcons : dIcons,
  });
}

chrome.browserAction.onClicked.addListener(() => {
  window.setOptions('on', !options.on);
});

export default function getOptions() {
  return options;
}

window.getOptions = getOptions;

window.setOptions = (key, val) => {
  if (key === 'on') {
    setIcon(val);
  }
  options = { ...options, [key]: val };
};
