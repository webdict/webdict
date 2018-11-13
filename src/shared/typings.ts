export interface Pron {
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
  search(data: { text: string, lang: 'zh' | 'en' }, callback: (entries: WordData[]) => void);
  define(data: { word: string, data: any });
  playme(data: { code: string });
  viewed(data: Entry);
}

export interface WordData {
  word: string;
  data: {
    [mark: string]: string[]
  };
}