import { Entry, Rect, Injector } from '../shared/typings';
import { dePinv, dePron } from './coder';

export default function (injector: Injector) {
  let rentry: Entry;
  let absoluteRect: Rect;

  const Dict = document.createElement('div');
  Dict.classList.add('lanx-root');
  Dict.classList.add('lanx-none');
  document.body.appendChild(Dict);
  Dict.innerHTML = [
    '<div class="lanx-main">',
    '  <div class="lanx-view">',
    '    <div class="lanx-head">',
    '      <div class="lanx-word"></div>',
    '      <div class="lanx-hide"></div>',
    '      <div class="lanx-mean"></div>',
    '    </div>',
    '    <div class="lanx-list"></div>',
    '  </div>',
    '  <div class="lanx-edit">',
    '    <div class="lanx-back" title="取消"></div>',
    '    <textarea class="lanx-area"></textarea>',
    '    <div class="lanx-done">完成</div>',
    '  </div>',
    '</div>',
    '<div class="lanx-foot"></div>'
  ].reduce((a, b) => a + b.trim());


  const [
    Main, View,
    Word, Hide,
    Mean, List,
    Edit, Back,
    Area, Done
  ] = [
    'main', 'view',
    'word', 'hide',
    'mean', 'list',
    'edit', 'back',
    'area', 'done'
  ].map(id => Dict.querySelector('.lanx-' + id) as HTMLElement);

  Dict.addEventListener('mouseup', event => {
    event.stopPropagation();
  });
  Hide.addEventListener('mouseup', event => {
    event.stopPropagation();
    Dict.classList.add('lanx-none');
  }, true);
  Word.addEventListener('click', event => {
    event.stopPropagation();
    if (rentry.family && rentry.family.length > 1) {
      const qword = rentry.family[(++rentry.index) % rentry.family.length];
      injector.find({ word: qword, lang: rentry.cleng ? 'zh' : 'en' }, (entry: Entry) => {
        if (entry) {
          entry.family = rentry.family;
          entry.index = rentry.index;
          showDict(entry, absoluteRect);
        }
      });
    }
  });
  Mean.addEventListener('click', event => {
    Edit.style.height = View.offsetHeight + 'px';
    Edit.style.width = View.offsetWidth + 'px';
    View.classList.add('lanx-none');
    Edit.classList.remove('lanx-none');
    event.stopPropagation();
    if (pinpoint(absoluteRect)) Area.focus();
    else {
      Edit.classList.add('lanx-none');
      View.classList.remove('lanx-none');
    }
  });

  Back.addEventListener('click', event => {
    Edit.classList.add('lanx-none');
    View.classList.remove('lanx-none');
    event.stopPropagation();
    pinpoint(absoluteRect);
    (Area as HTMLTextAreaElement).value = rentry.trans;
  });

  const listener = (event: Event) => {
    Edit.classList.add('lanx-none');
    View.classList.remove('lanx-none');
    event.stopPropagation();
    const newVal = ((Area as HTMLTextAreaElement).value || '').trim().replace(/\s\s+|[\n\r\t]/g, ' ');
    if (newVal && newVal !== rentry.trans) {
      if (newVal.charAt(0) !== '@' || rentry.qword.toLowerCase() === newVal.substr(1).toLowerCase()) {
        rentry.trans = newVal.charAt(0) !== '@' ? newVal : '[Ref Error]';
        updateContent(rentry);
        pinpoint(absoluteRect);
        injector.post({ query: rentry.qword, newVal });
      } else {

        /*chrome.runtime.sendMessage*/injector.post({ query: rentry.qword, newVal }, (trans: string) => {
          rentry.trans = trans;
          updateContent(rentry);
          pinpoint(absoluteRect);
        });
      }
    } else pinpoint(absoluteRect);
  };
  Done.addEventListener('click', listener);

  Area.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      listener(event);
    }
  }, true);


  window.addEventListener('resize', () => {
    Dict.classList.add('lanx-none');
  });


  function playAudio(event: Event) {
    event.stopPropagation();
    const el = event.target as HTMLElement;
    const play = el.getAttribute('data-code') as string;
    injector.play({ play });
  }

  // on audio playing failed:
  injector.onplayerror = (id: string) => {
    const target = List.querySelector(`[data-code="${id}"]`) as HTMLElement;
    if (target) target.setAttribute('disabled', 'disabled');
  };


  function ensurePronItem(pron: HTMLElement, count: number) {
    const childCount = pron.childElementCount;
    const divs = new Array<HTMLElement>();
    if (childCount >= count) {
      for (let i = 0; i < childCount; i++) {
        const el = pron.children[i] as HTMLElement;
        if (i < count) {
          el.classList.remove('lanx-none');
          divs.push(el);
        } else el.classList.add('lanx-none');
      }
    } else {
      for (let i = 0; i < childCount; i++) {
        const el = pron.children[i] as HTMLElement;
        el.classList.remove('lanx-none');
        divs.push(el);
      }
      while (count > childCount) {
        const div = document.createElement('div');
        div.classList.add('lanx-pron');
        pron.appendChild(div);
        for (const clazz of ['puk', 'pos', 'pus']) {
          const span = document.createElement('div');
          span.classList.add('lanx-pron-' + clazz);
          div.appendChild(span);
        }
        divs.push(div);
        count--;
      }
    }
    return divs;
  }
  const setButton = (button: HTMLSpanElement, mark: string) => {
    button.addEventListener('mouseup', playAudio, true);
    button.setAttribute('title', '播放' + mark + ' » [' + button.innerText + ']');
  };


  function updateContent(entry: Entry) {
    Dict.classList.remove('lanx-none');
    View.classList.remove('lanx-none');
    Edit.classList.add('lanx-none');
    Back.innerText = Word.innerText = entry.qword;
    if (entry.family && entry.family.length > 1) {
      Dict.classList.remove('lanx-root-less');
      Dict.classList.add('lanx-root-more');
    } else {
      Dict.classList.remove('lanx-root-more');
      Dict.classList.add('lanx-root-less');
    }
    if (entry.count) Word.setAttribute('title', '第' + entry.count + '次查询');
    else Word.removeAttribute('title');
    (Area as HTMLTextAreaElement).value = Mean.innerText = entry.trans;
    ensurePronItem(List, entry.poses.length).forEach((div, c) => {
      const parts = entry.cleng ? ['»', entry.poses[c], '«'] : entry.poses[c].split('$$');
      for (let p = 0; p < 3; p++) {
        const span = div.children[p];
        if (entry.cleng && p === 1) {
          span.innerHTML = dePinv(parts[p], 'zh:');
        } else if (!(entry.cleng || p === 1)) {
          span.innerHTML = dePron(parts[p], p === 0 ? 'uk:' : 'us:');
        } else {
          span.innerHTML = parts[p];
          continue;
        }
        const buttons = span.querySelectorAll('span[data-code]') as NodeListOf<HTMLSpanElement>;
        // tslint:disable-next-line: prefer-for-of
        for (let b = 0; b < buttons.length; b++) {
          setButton(buttons[b], entry.cleng ? '拼音' : (p === 0 ? '英式' : '美式'));
        }
      }
      if (div.offsetWidth > 320) {
        div.classList.remove('lanx-pron-row');
        div.classList.add('lanx-pron-col');
      } else {
        div.classList.remove('lanx-pron-col');
        div.classList.add('lanx-pron-row');
      }
    });

  }

  function pinpoint(aRect: Rect): boolean {
    const x = window.pageXOffset, y = window.pageYOffset;
    const rRect = {
      left: aRect.left - x,
      right: aRect.right - x,
      top: aRect.top - y,
      bottom: aRect.bottom - y
    };
    if (Math.max(document.documentElement.clientWidth, document.documentElement.offsetWidth) < Main.offsetWidth) {
      Dict.classList.add('lanx-none');
      return false;
    }
    if (rRect.left < 0 || rRect.right > document.documentElement.clientWidth) {
      Dict.classList.add('lanx-none');
      return false;
    }
    const margin = 14;
    let above = rRect.top >= Main.offsetHeight + margin;
    let below = above || document.documentElement.clientHeight - rRect.bottom >= Main.offsetHeight + margin;
    above = above || !below && rRect.top + y >= Main.offsetHeight + margin;
    below = (above || below) || Math.max(document.documentElement.offsetHeight, document.documentElement.clientHeight) - rRect.bottom >= Main.offsetHeight + margin;
    if (!(above || below)) {
      Dict.classList.add('lanx-none');
      return false;
    }

    let middle = rRect.left + rRect.right;
    let total = document.documentElement.clientWidth;
    if (total < Main.offsetWidth) {
      middle += x;
      total = Math.max(total, document.documentElement.offsetWidth);
    }
    if (middle >= Main.offsetWidth) {
      const offset = Main.offsetWidth + middle - 2 * total;
      if (offset <= 0) {
        Main.style.left = -Main.offsetWidth / 2 + 'px';
      } else {
        Main.style.left = (-offset - Main.offsetWidth) / 2 + 'px';
      }
    } else {
      Main.style.left = (-middle) / 2 + 'px';
    }
    Dict.style.left = (rRect.right + rRect.left) / 2 + x + 'px';
    if (above) {
      Dict.style.top = rRect.top + y + 'px';
      Dict.classList.remove('lanx-root-below');
      Dict.classList.add('lanx-root-above');
    } else {
      Dict.style.top = rRect.bottom + y + 'px';
      Dict.classList.remove('lanx-root-above');
      Dict.classList.add('lanx-root-below');
    }
    return true;
  }

  function showDict(entry: Entry, rect: Rect) {
    updateContent(rentry = entry);
    return pinpoint(absoluteRect = rect);
  }

  function hideDict() {
    Dict.classList.add('lanx-none');
  }

  function tryToShowDict(text: string, rect: Rect) {
    const qword = text.substr(2);
    const lang = text.substr(0, 2);

    injector.find({ word: qword, lang: lang as 'zh' | 'en' }, (entry: Entry) => {
      if (entry) {
        showDict(entry, rect);
      }
    });
  }

  return { input: Area, hideDict, tryToShowDict };
}