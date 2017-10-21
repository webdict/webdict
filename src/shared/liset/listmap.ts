class Item<Key, Val> {
  constructor(public key: Key, public val: Val) { }
}


export default class ArrayListBinarySearchMap<Key, Val> {
  private list: Array<Item<Key, Val>>;

  constructor(private comptor: (k1: Key, k2: Key) => number, capacity: number = 128) {
    this.list = new Array<Item<Key, Val>>(capacity);
  }

  private BINARY_SEARCH(key: Key) {
    const list = this.list;
    let low = 0, high = list.length - 1;
    const comptor = this.comptor;
    while (low <= high) {
      const mid = (low + high) >>> 1;
      const cmp = comptor(key, list[mid].key);
      if (cmp < 0) high = mid - 1;
      else if (cmp > 0) low = mid + 1;
      else return mid;
    }
    return -(low + 1);
  }
}

