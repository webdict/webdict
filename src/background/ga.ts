declare const _gaq: { push: (param: ['_trackEvent', 'lookup' | 'play' | string, string]) => void };

export default function(action: string, data: string) {
  if (_gaq) _gaq.push(['_trackEvent', action, data]);
}
