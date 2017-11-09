export interface BaseEntry {
  trans?: string; // when: 1. not exist => [Not Found]
  poses: string[]; // must directly return from server.
  count: number; // must directly return from server

  next?: string;
  link?: { href: string, title: string, html: string, color?: string };
}

export interface ServerEntry extends BaseEntry {
  // from server:
  family?: Array<number | string>; // when: 1. length===1, not exist; 2. cleng, number[]; 3. !cleng, string[];
  qword?: string; // when cleng: not exist
  cleng?: number; // when English: not exist
}

export interface Entry extends ServerEntry {
  family?: string[];
  index?: number;
  trans: string;
  qword: string;
}

export const enum Action {
  defClicked,
  applyDef,
  applyAtDef,

  userClosed,
  resizeClosed,

  playAudioZH,
  playAudioUK,
  playAudioUS,
  playAudioFailed,

  familyQueried,
  zhQueried,
  enQueried
};

export interface Rect { left: number; right: number; top: number; bottom: number; }

export interface Injector {
  onplayerror?: (id: string) => void;
  query(data: { query: string, lang: 'zh' | 'en' }, cb: (entry: Entry) => void): void;
  play(data: { play: string }): void;
  post(data: { query: string, newVal: string }, cb?: (trans: string) => void): void;
}