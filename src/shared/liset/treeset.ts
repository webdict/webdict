import TreeMap from './treemap';

export default class TreeSet<Key> {
  map: TreeMap<Key, boolean>;
  constructor(comptor: (k1: Key, k2: Key) => number) {
    this.map = new TreeMap(comptor);
  }

  put(key: Key) {
    this.map.put(key, true);
  }
  get(index: number) {
    return this.map.of(index).key;
  }
  of(index: number) {
    return this.map.of(index).key;
  }
  forEach(consume: (key: Key, index: number) => void) {
    this.map.forEach((element, index) => {
      consume(element.key, index);
    });
  }
}
