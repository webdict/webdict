export type OptionProps = {
  on: boolean;
  zh: boolean;
  en: boolean;
  jp: boolean;
};

export interface BGWindow extends Window {
  setOptions<K extends keyof OptionProps>(key: K, val: OptionProps[K]): void;
  getOptions(): OptionProps;
}
