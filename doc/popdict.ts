import inject from '../src/content/ctrler';

import play from '../src/background/player';

import { Injector, Action } from '../src/shared/typings';

import { post } from '../src/background/entry';

const ch = {
  "trans": "Chinese",
  "count": 1024,
  "poses": ["zhong1 wen2"],
  "family": ["中文", "中"],
  "cleng": 2,
  "qword": "中文",
  "index": 0
};
const zh = {
  "trans": "within, among, in, middle, center, while (doing sth), during; to hit (the mark)",
  "count": 1082,
  "poses": ["zhong1, zhong4"],
  "cleng": 1,
  "qword": "中"
};

const en = {
  "trans": "英语，英语的，英格兰的",
  "count": 1084,
  "poses": ["[72X1J23]$$adj$$[72X1J23]", "[72X1J23]$$noun$$[72X1J23]"],
  "qword": "English"
};
export default function (handler: (action: { action: Action }) => void) {
  const injector: Injector = {
    query(data, cb) {
      // query(data.query, data.lang, cb, true);
      if (data.query === '中') cb(zh);
      else if (data.lang === 'zh') cb(ch);
      else cb(en);
    },
    play(data) {
      play(data.play, (id) => {
        if (injector.onplayerror) injector.onplayerror(id);
      });
    },
    post(data, cb) {
      post(data.query, data.newVal, cb!, true);
    }
  };
  return inject(injector, handler);
}
