import { Entry, Rect, Injector } from '../shared/typings';
import { dePinv, dePron } from './coder';
import Dict from './dict';


export default function (injector: Injector) {
  let _entry: Entry = null;
  let _rect: Rect = null;
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

  window.addEventListener('resize', () => {
    hideDict();
  });

  Hide.addEventListener('mouseup', event => {
    event.stopPropagation();
    hideDict();
  }, true);

  Word.addEventListener('click', event => {
    event.stopPropagation();
    if (_entry.family && _entry.family.length > 1) {
      const qword = _entry.family[(++_entry.index) % _entry.family.length];
      injector.find({ word: qword, lang: _entry.cleng ? 'zh' : 'en' }, (entry: Entry) => {
        if (entry) {
          entry.family = _entry.family;
          entry.index = _entry.index;
          showDict(entry, _rect);
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
    if (pinpoint(_rect)) Area.focus();
    else {
      Edit.classList.add('lanx-none');
      View.classList.remove('lanx-none');
    }
  });

  Back.addEventListener('click', event => {
    Edit.classList.add('lanx-none');
    View.classList.remove('lanx-none');
    event.stopPropagation();
    pinpoint(_rect);
    (Area as HTMLTextAreaElement).value = _entry.trans;
  });
  // on audio playing failed:
  injector.onplayerror = (id: string) => {
    const target = List.querySelector(`[data-code="${id}"]`) as HTMLElement;
    if (target) target.setAttribute('disabled', 'disabled');
  };
  const listener = (event: Event) => {
    Edit.classList.add('lanx-none');
    View.classList.remove('lanx-none');
    event.stopPropagation();
    const newVal = ((Area as HTMLTextAreaElement).value || '').trim().replace(/\s\s+|[\n\r\t]/g, ' ');
    if (newVal && newVal !== _entry.trans) {
      if (newVal.charAt(0) !== '@' || _entry.qword.toLowerCase() === newVal.substr(1).toLowerCase()) {
        _entry.trans = newVal.charAt(0) !== '@' ? newVal : '[Ref Error]';
        updateContent(_entry);
        pinpoint(_rect);
        injector.post({ query: _entry.qword, newVal });
      } else {
        injector.post({ query: _entry.qword, newVal }, (trans: string) => {
          _entry.trans = trans;
          updateContent(_entry);
          pinpoint(_rect);
        });
      }
    } else pinpoint(_rect);
  };
  Done.addEventListener('click', listener);

  Area.addEventListener('keydown', (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      listener(event);
    }
  }, true);

  function playAudio(event: Event) {
    event.stopPropagation();
    const el = event.target as HTMLElement;
    const play = el.getAttribute('data-code') as string;
    injector.play({ play });
  }




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
      hideDict();
      return false;
    }
    if (rRect.left < 0 || rRect.right > document.documentElement.clientWidth) {
      hideDict();
      return false;
    }
    const margin = 14;
    let above = rRect.top >= Main.offsetHeight + margin;
    let below = above || document.documentElement.clientHeight - rRect.bottom >= Main.offsetHeight + margin;
    above = above || !below && rRect.top + y >= Main.offsetHeight + margin;
    below = (above || below) || Math.max(document.documentElement.offsetHeight, document.documentElement.clientHeight) - rRect.bottom >= Main.offsetHeight + margin;
    if (!(above || below)) {
      hideDict();
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
    updateContent(_entry = entry);
    return pinpoint(_rect = rect);
  }

  function hideDict() {
    Dict.classList.add('lanx-none');
    _entry = null;
    _rect = null;
  }

  function tryToShowDict(text: string, rect: Rect) {
    if (_rect && ['left', 'right', 'top', 'bottom'].every(key => _rect[key] === rect[key])) {
      return;
    }
    if (!document.querySelector('.lanx-root')) {
      document.body.appendChild(Dict);
    }
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