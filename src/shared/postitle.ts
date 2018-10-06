export default (pos: string) => {
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