// tslint:disable
class Item<Key, Val> {

  right: Item<Key, Val> = null;
  left: Item<Key, Val> = null;
  red = true;
  size = 1;

  constructor(public key: Key, public val: Val) { }

}

interface Entry<Key, Val> {
  readonly key: Key;
  val: Val;
}

export default class RedBlackBinarySearchTree<Key, Val> {

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
  private GET(item: Item<Key, Val>, key: Key) {
    while (item !== null) {
      const cmp = this.comptor(key, item.key);
      if (cmp < 0) item = item.left;
      else if (cmp > 0) item = item.right;
      else return item.val;
    }
    return null;
  }

  has(key: Key) {
    return this.GET(this.root, key) !== null;
  }

  put(key: Key, val: Val) {
    // if (key === null) throw 'first argument to put() is null';
    // if (val === null) throw 'second argument to put() is null';
    this.root = this.PUT(this.root, key, val);
    this.root.red = false;
  }

  private PUT(head: Item<Key, Val>, key: Key, val: Val): Item<Key, Val> {
    if (head === null) return new Item<Key, Val>(key, val);

    const cmp = this.comptor(key, head.key);
    if (cmp < 0) head.left = this.PUT(head.left, key, val);
    else if (cmp > 0) head.right = this.PUT(head.right, key, val);
    else head.val = val;

    if (isRed(head.right) && !isRed(head.left)) head = rotateLeft(head);
    if (isRed(head.left) && isRed(head.left.left)) head = rotateRight(head);
    if (isRed(head.left) && isRed(head.right)) flipColor(head);
    head.size = size(head.left) + size(head.right) + 1;
    return head;
  }



  delete(key: Key): void {
    // if (key === null) throw 'argument to delete() is null';
    if (this.GET(this.root, key) === null) return;

    if (!isRed(this.root.left) && !isRed(this.root.right)) {
      this.root.red = true;
    }
    this.root = this.DELETE(this.root, key);
    if (this.root !== null) this.root.red = false;
  }

  private DELETE(head: Item<Key, Val>, key: Key): Item<Key, Val> {

    if (this.comptor(key, head.key) < 0) {
      if (!isRed(head.left) && !isRed(head.left.left)) {
        head = moveRedLeft(head);
      }
      head.left = this.DELETE(head.left, key);
    } else {
      if (isRed(head.left)) { head = rotateRight(head); }
      if (this.comptor(key, head.key) === 0 && (head.right === null)) { return null; }
      if (!isRed(head.right) && !isRed(head.right.left)) { head = moveRedRight(head); }
      if (this.comptor(key, head.key) === 0) {
        const x = this.MIN(head.right);
        head.key = x.key;
        head.val = x.val;
        head.right = deleteMin(head.right);
      } else head.right = this.DELETE(head.right, key);
    }
    return balance(head);
  }
  min(): Entry<Key, Val> | null {
    if (this.root === null) return null;
    return this.MIN(this.root);
  }
  private MIN(root: Item<Key, Val>): Item<Key, Val> {
    return root.left === null ? root : this.MIN(root.left);
  }
  max(): Entry<Key, Val> | null {
    if (this.root === null) return null;
    return this.MAX(this.root);
  }
  private MAX(x: Item<Key, Val>) {
    if (x.right === null) return x;
    else return this.MAX(x.right);
  }
  of(index: number): Entry<Key, Val> | null {
    if (index < 0 || index >= size(this.root)) {
      return null;
    }
    function OF(root: Item<Key, Val>, inx: number): Item<Key, Val> {
      const pos = size(root.left);
      if (pos > inx) return OF(root.left, inx);
      else if (pos < inx) return OF(root.right, inx - pos - 1);
      else return root;
    }
    const item = OF(this.root, index);
    return item;
  }


  forEach(consume: (entry: Entry<Key, Val>, index: number) => void) {
    if (this.root === null) return;
    let index = 0;
    const loKey = this.min().key, hiKey = this.max().key;
    const FOR_EACH = (item: Item<Key, Val>) => {
      if (item === null) return;
      const loCmp = this.comptor(loKey, item.key);
      const hiCmp = this.comptor(hiKey, item.key);
      if (loCmp < 0) FOR_EACH(item.left);
      if (loCmp <= 0 && hiCmp >= 0) consume(item, index++);
      if (hiCmp > 0) FOR_EACH(item.right);
    };
    FOR_EACH(this.root);
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
