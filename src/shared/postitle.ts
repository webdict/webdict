export default (pos: string) => {
  if (pos.startsWith('zh-han-CN')) {
    return '简体中国';
  }
  if (pos.startsWith('zh-han-TW')) {
    return '繁体台湾';
  }
  if (pos.startsWith('zh-han-HK')) {
    return '繁体香港';
  }
  if (pos.startsWith('zh-han-MO')) {
    return '繁体澳门';
  }
  if (pos.startsWith('zh-han')) {
    return '汉语';
  }
  if (pos.startsWith('zh-yue')) {
    return '粤语';
  }
  switch (pos.toLowerCase()) {
    case 'noun':
      return '名词';
    case 'verb':
      return '动词';
    case 'adj':
      return '形容词';
    case 'adv':
      return '副词';
    default:
      return '';
  }
}