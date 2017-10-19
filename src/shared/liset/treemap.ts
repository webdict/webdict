// tslint:disable
class Item<Key, Val> {

  right: Item<Key, Val> = null;
  left: Item<Key, Val> = null;
  red = true;
  size = 1;
  constructor(public key: Key, public val: Val) { }

}

/**
 * Use for wrapping (key, val) pair(s) retrieved by min, max, forEach, get ect. for the purpose of:
 * 1. hiding right, left, red, size members
 * 2. and making the key member readonly.
 * 
 * `val` isn't marked as readonly to be mutable and therefore to implement map functionality.
 */
interface Entry<Key, Val> {
  readonly key: Key;
  val: Val;
}

export default class RedBlackBinarySearchMap<Key, Val> {

  private root: Item<Key, Val> = null;

  constructor(private comptor: (k1: Key, k2: Key) => number) { }

  size() {
    return this.root && this.root.size || 0;
  }

  clear() {
    this.root = null;
  }

  get(key: Key) {
    // if (key === null) throw 'argument to get() is null';
    return this.GET(this.root, key);
  }
  private GET(head: Item<Key, Val>, key: Key) {
    while (head !== null) {
      const cmp = this.comptor(key, head.key);
      if (cmp < 0) head = head.left;
      else if (cmp > 0) head = head.right;
      else return head.val;
    }
    return null;
  }

  has(key: Key) {
    return this.GET(this.root, key) !== null;
  }

  /**
   * 1. if the `key` has already existed in the map,
   * it swaps the old value with the new one, 
   * and finally return the old one.
   * 2. otherwise it puts the new (`key`, `val`) pair 
   * into the map and return null.
   */
  put(key: Key, val: Val): Val | null {
    // if (key === null) throw 'first argument to put() is null';
    // if (val === null) throw 'second argument to put() is null';
    let oldVal = null;
    const PUT = (head: Item<Key, Val>, key: Key, val: Val): Item<Key, Val> => {
      if (head === null) return new Item<Key, Val>(key, val);
      const cmp = this.comptor(key, head.key);
      if (cmp < 0) head.left = PUT(head.left, key, val);
      else if (cmp > 0) head.right = PUT(head.right, key, val);
      else[oldVal, head.val] = [head.val, val];

      if (isRed(head.right) && !isRed(head.left)) head = rotateLeft(head);
      if (isRed(head.left) && isRed(head.left.left)) head = rotateRight(head);
      if (isRed(head.left) && isRed(head.right)) flipColor(head);
      head.size = size(head.left) + size(head.right) + 1;
      return head;
    }
    this.root = PUT(this.root, key, val);
    this.root.red = false;
    return oldVal;

  }



  del(key: Key) {
    // if (key === null) throw 'argument to delete() is null';
    if (this.GET(this.root, key) === null) return null;

    if (!isRed(this.root.left) && !isRed(this.root.right)) {
      this.root.red = true;
    }
    let oldVal = null;
    const DEL = (hole: Item<Key, Val>, key: Key): Item<Key, Val> => {
      if (this.comptor(key, hole.key) < 0) {
        if (!isRed(hole.left) && !isRed(hole.left.left)) {
          hole = moveRedLeft(hole);
        }
        hole.left = DEL(hole.left, key);
      } else {
        if (isRed(hole.left)) hole = rotateRight(hole);
        if (this.comptor(key, hole.key) === 0 && (hole.right === null)) return null;
        if (!isRed(hole.right) && !isRed(hole.right.left)) hole = moveRedRight(hole);
        if (this.comptor(key, hole.key) === 0) {
          const shim = this.MIN(hole.right);
          hole.key = shim.key;
          [oldVal, hole.val] = [hole.val, shim.val];
          hole.right = deleteMin(hole.right);
        } else hole.right = DEL(hole.right, key);
      }
      return balance(hole);
    }
    this.root = DEL(this.root, key);
    if (this.root !== null) this.root.red = false;
    return oldVal;

  }


  min(): Entry<Key, Val> | null {
    return this.root && this.MIN(this.root) || null;
  }
  private MIN(head: Item<Key, Val>): Item<Key, Val> {
    return head.left && this.MIN(head.left) || head;
  }
  max(): Entry<Key, Val> | null {
    return this.root && this.MAX(this.root) || null;
  }
  private MAX(head: Item<Key, Val>) {
    return head.right && this.MAX(head.right) || head;
  }
  of(index: number): Entry<Key, Val> | null {
    if (index < 0 || index >= size(this.root)) return null;
    function OF(head: Item<Key, Val>, inx: number): Item<Key, Val> {
      const pos = size(head.left);
      if (pos > inx) return OF(head.left, inx);
      else if (pos < inx) return OF(head.right, inx - pos - 1);
      else return head;
    }
    const item = OF(this.root, index);
    return item;
  }


  forEach(consume: (entry: Entry<Key, Val>, index: number) => void) {
    if (this.root === null) return;
    let index = 0;
    const minK = this.min().key, maxK = this.max().key;
    const FOR_EACH = (item: Item<Key, Val>) => {
      if (item === null) return;
      const loCmp = this.comptor(minK, item.key);
      const hiCmp = this.comptor(maxK, item.key);
      if (loCmp < 0) FOR_EACH(item.left);
      if (loCmp <= 0 && hiCmp >= 0) consume(item, index++);
      if (hiCmp > 0) FOR_EACH(item.right);
    };
    FOR_EACH(this.root);
  }

  toArray<Aim>(map: (entry: Entry<Key, Val>, index: number) => Aim | undefined): Array<Aim> {
    if (this.root === null) return [];
    const array = new Array<Aim>(size(this.root));
    let index = 0;
    const minK = this.min().key, maxK = this.max().key;
    const FOR_EACH = (item: Item<Key, Val>) => {
      if (item === null) return;
      const loCmp = this.comptor(minK, item.key);
      const hiCmp = this.comptor(maxK, item.key);
      if (loCmp < 0) FOR_EACH(item.left);
      if (loCmp <= 0 && hiCmp >= 0) {
        const aim = map(item, index++);
        if (aim !== undefined) array.push(aim);
      }
      if (hiCmp > 0) FOR_EACH(item.right);
    };
    FOR_EACH(this.root);
    return array;
  }
}

function isRed<K, V>(item: Item<K, V>): boolean {
  return item && item.red;
}

function size<K, V>(item: Item<K, V>) {
  return item && item.size || 0;
}

function deleteMin<Key, Val>(head: Item<Key, Val>): Item<Key, Val> {
  if (head.left === null) return null;
  if (!isRed(head.left) && !isRed(head.left.left)) {
    head = moveRedLeft(head);
  }
  head.left = deleteMin(head.left);
  return balance(head);
}

function rotateRight<Key, Val>(head: Item<Key, Val>): Item<Key, Val> {
  const item = head.left;
  head.left = item.right;
  item.right = head;
  item.red = item.right.red;
  item.right.red = true;
  item.size = head.size;
  head.size = size(head.left) + size(head.right) + 1;
  return item;
}

function rotateLeft<Key, Val>(head: Item<Key, Val>): Item<Key, Val> {
  const item = head.right;
  head.right = item.left;
  item.left = head;
  item.red = item.left.red;
  item.left.red = true;
  item.size = head.size;
  head.size = size(head.left) + size(head.right) + 1;
  return item;
}

function flipColor<Key, Val>(head: Item<Key, Val>): void {
  head.red = !head.red;
  head.left.red = !head.left.red;
  head.right.red = !head.right.red;
}



function moveRedLeft<Key, Val>(head: Item<Key, Val>): Item<Key, Val> {
  flipColor(head);
  if (isRed(head.right.left)) {
    head.right = rotateRight(head.right);
    head = rotateLeft(head);
    flipColor(head);
  }
  return head;
}

function moveRedRight<Key, Val>(head: Item<Key, Val>): Item<Key, Val> {
  flipColor(head);
  if (isRed(head.left.left)) {
    head = rotateRight(head);
    flipColor(head);
  }
  return head;
}


function balance<Key, Val>(head: Item<Key, Val>): Item<Key, Val> {
  if (isRed(head.right)) head = rotateLeft(head);
  if (isRed(head.left) && isRed(head.left.left)) head = rotateRight(head);
  if (isRed(head.left) && isRed(head.right)) flipColor(head);
  head.size = size(head.left) + size(head.right) + 1;
  return head;
}
