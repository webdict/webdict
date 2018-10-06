
export interface Entry {
  word: string;
  data: {
    lang: 'en' | 'zh-han' | 'zh-yue' | string,
    pron: [string, string, string],
    mean: string
  }[];
}

export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Injector {
  search(data: { text: string, lang: 'zh' | 'en' }, callback: (entries: Entry[]) => void): void;
  define(data: { word: string, lang: 'zh' | 'en' }): void;
  playme(data: { code: string }): void;
}
