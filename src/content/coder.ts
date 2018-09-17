const ipal = ' -(-(r)-)-aɪ-aʊ-b-d-dʒ-e-eə-eɪ-f-h-i-iː-j-juː-k-l-m-n-oʊ-p-r-s-t-tʃ-u-uː-v-w-x-z-æ-ð-ŋ-ɑ-ɑː-ɒ-ɔɪ-ɔː-ə-ər-əʊ-ɜː-ɡ-ɪ-ɪə-ʃ-ʊ-ʊə-ʌ-ʒ-ˈ-ˌ-θ'.split('-');

const secretKey = 'AabcdeBCfDghEFGiHjIJKLkMNOPlQmRSTUVWXYnZop0qrs12t34u56789';

const pron = (input: string): [string, string] => {
  let output = '', mark = '';
  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i);
    output += ipal[secretKey.indexOf(char)];
    mark += char >= 'a' ? '-' + char : char;
  }
  mark = secretKey.charAt((output.length - 1) % secretKey.length) + mark;
  return [output, mark.toUpperCase()];
};

export function dePron(input: string, lang: string) {
  const prons = input.split(', ');
  let output = '';
  for (let i = 0; i < prons.length; i++) {
    if (i > 0) output += ', ';
    let p = prons[i];
    if (p.charAt(0) === '[') {
      p = p.substr(1);
      output += '[';
    }
    const suffix = p.charAt(p.length - 1) === ']';
    if (suffix) p = p.substring(0, p.length - 1);
    const pronMark = pron(p);
    output += '<span class="lanx-pron-play" data-code="' + lang + pronMark[1] + '">' + pronMark[0] + '</span>';
    if (suffix) output += ']';
  }
  return output;
}

const mask = 'aāáǎàoōóǒòeēéěèiīíǐìuūúǔùüǖǘǚǜ';
function mark(input: string, lang: string) {
  const pv = input.replace('nue', 'nüe')
    .replace('lue', 'lüe')
    .replace('nv', 'nü')
    .replace('lv', 'lü')
    .replace('v', 'ü');
  for (let i = 0; i < pv.length; i++) {
    const pin = mask.indexOf(pv.charAt(i));
    if (pin >= 0) {
      const end = pv.length - 1;
      let tone = pv.charCodeAt(end) - 48;
      if (tone === 5) tone = 0;
      return '<span class="lanx-pron-play" data-code="' + lang + input + '">' + pv.substr(0, i) + mask.charAt(pin + tone) + pv.substring(i + 1, end) + '</span>';
    }
  }
  return input;
}

export function dePinv(input: string, lang: string): string {
  const res = input.match(/\b[a-z]{1,6}[1-5]\b/);
  if (res === null) return input;
  const rem = (res.index || 0) + res[0].length;
  if (rem === input.length) return input.substr(0, res.index) + mark(res[0], lang);
  return input.substr(0, res.index) + mark(res[0], lang) + dePinv(input.substr(rem), lang);
}
function find(ipa: string): [string, number] {
  let high = ipal.length - 1;
  let low = 0;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (ipal[mid] === ipa) {
      return [secretKey[mid], ipa.length];
    } else if (ipal[mid] < ipa) {
      low = mid + 1;
    } else high = mid - 1;
  }
  if (ipa.length === 1) {
    throw ipa;
  }
  return find(ipa.substr(0, ipa.length - 1));
}
export function encode(input: string): string {
  let i = 0;
  let output = '';
  while (i < input.length) {
    const [sub, len] = find(input.substr(i, i + 3));
    output += sub;
    i += len;
  }
  return output;
}
