interface Pron {
  lang: 'en' | 'zh-han' | 'zh-han_*' | 'zh-yue' | 'zh-yue_*' | string;
  pron: [string, string, string];
  mean: string;
}

export interface Entry {
  word: string;
  data: Pron[];
}

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Injector {
  search(data: { text: string, lang: 'zh' | 'en' }, callback: (entries: Entry[]) => void): void;
  define(data: { word: string, mean: any }): void;
  playme(data: { code: string }): void;
}
