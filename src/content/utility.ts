
function detect(char: string) {
  const code = char.charCodeAt(0);
  if (code < 128) {
    if ('a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || char === '-') return 1;
    return 0;
  }
  if (code >= 0x2E80) {
    if (0x4E00 <= code && code <= 0x9FD5 ||
      0x3400 <= code && code <= 0x4DB5 ||
      0xF900 <= code && code <= 0xFAFF ||
      0x2F00 <= code && code <= 0x2FDF ||
      0x2E80 <= code && code <= 0x2EFF ||
      0x31C0 <= code && code <= 0x31EF ||
      0x2FF0 <= code && code <= 0x2FFF) {
      return 2;
    }
  }
  if (code <= 0x02FF) {
    if (char === 'ª' || char === 'º') return 1;
    if (char < 'À') return 0;
    if (char <= 'ʯ') {
      if (char === '×' || char === '÷') return 0;
      else return 1;
    }
    return 0;
  }
  if ('Ḁ' <= char && char <= 'ỿ') {
    return 1;
  }

  return 0;
}

export function legalWord(word: string) {
  for (let i = 0; i < word.length; i++) {
    const char = word.charAt(i);
    if ("，’' ".indexOf(char) < 0 && detect(char) === 0) return false;
  }
  return true;
}

export function shorten(text: string | null | undefined): string | null {
  if (!text || text.length > 99) return null;
  let max = 0;
  let len = 0;
  let count = 0;
  while (len < text.length) {
    const flag = detect(text.charAt(len));
    max = Math.max(max, flag);
    if (flag === 0) {
      if ("，’' ".indexOf(text.charAt(len)) >= 0) {
        if (count > 4) break;
        else if (max === 2 && count > 0) break;
        count++;
      } else {
        if (len === 0) return null;
        if (text.charAt(len) === '.') len++;
        break;
      }

    }
    len++;
  }
  if (max === 1 && len === 1) return null;
  return (max === 2 ? 'zh' : 'en') + text.substr(0, len).replace("'", '’');
}

export function staticText(element: any) {
  if (document.designMode && 'on' === document.designMode.toLowerCase().trim()) return false;
  while (element) {
    if (element.isContentEditable) return false;
    if (element.tagName) {
      const name = element.tagName.toLocaleLowerCase().trim();
      if ('input' === name || 'textarea' === name) return false;
    }
    element = element.parentNode as HTMLElement;
  }
  return true;
}
