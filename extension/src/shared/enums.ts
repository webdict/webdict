export const enum PageScriptAction {
  PLAY_SOUND,
  SEARCH_TEXT,
  DEFINE_WORD,
  WORD_VIEWED,
}

// Note: set `string` initializers using as `string` key as well.
export const enum BackgroundAction {
  PLAY_ERROR = 'PLAY_ERROR',
}

/** 语言代号，用于请求_查词接口_等 */
export const enum LanguageCode {
  /** 汉语代号 */
  ZH = 'zh',
  /** 英语代号 */
  EN = 'en',
  /** 粤语代号 */
  JP = 'jp',
}
