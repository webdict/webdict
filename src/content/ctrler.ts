// import { updateStorage } from '../shared/storage';
import { Rect, Injector } from '../shared/typings';
import inject from './popup';
// import { dePinv, dePron } from './coder';
import { shorten, staticText } from './utility';


export default function (injector: Injector) {

  const Dict = inject(injector);

  let mouseupEnabled = true;
  let dictEnabled = true;
  let mousedownTargetIsInput = false;
  
  function capture(): [string | null, Rect | null] {
    try {
      const sele = window.getSelection();
      const text = shorten(sele.toString().trim());
      const rect = sele.getRangeAt(0).getBoundingClientRect();
      if (
        text && rect.left >= 0
        && rect.right <= document.documentElement.clientWidth
        && rect.right > rect.left && staticText(sele.anchorNode)
      ) {
        const x = window.pageXOffset, y = window.pageYOffset;
        return [
          text, {
            left: rect.left + x,
            right: rect.right + x,
            bottom: rect.bottom + y,
            top: rect.top + y
          }];
      }
    } catch { }
    return [null, null];
  }
  const input = Dict.input;

  document.addEventListener('mousedown', ({ target }) => {
    mouseupEnabled = dictEnabled && staticText(target);
    mousedownTargetIsInput = target === input;
  }, true);

  document.addEventListener('mouseup', ({ target }) => {
    if (mousedownTargetIsInput) return;
    if (mouseupEnabled && staticText(target)) {
      if (target !== document) {
        const [text, rect] = capture();
        if (text) {
          Dict.tryToShowDict(text, rect as Rect);
        } else Dict.hideDict();
      }
    } else Dict.hideDict();
  });

  return function (enable: boolean) {
    dictEnabled = enable;
  };

}

