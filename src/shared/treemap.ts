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
  readonly val: Val;
}

export default class RedBlackSearchTree<Key, Val> {

  private root: Item<Key, Val> = null;

  constructor(private comptor: (k1: Key, k2: Key) => number) { }

  size() {
    return size(this.root);
  }
  clear() {
    this.root = null;
  }
  get(key: Key): Val {
    if (key == null) throw 'argument to get() is null';
    return this._get(this.root, key);
  }
  private _get(root: Item<Key, Val>, key: Key): Val {
    while (root != null) {
      const cmp = this.comptor(key, root.key);
      if (cmp < 0) root = root.left;
      else if (cmp > 0) root = root.right;
      else return root.val;
    }
    return null;
  }

  has(key: Key) {
    return this.get(key) !== null;
  }

  set(key: Key, val: Val) {
    // if (key == null) throw 'first argument to put() is null';
    // if (val == null) throw 'second argument to put() is null';
    this.root = this.put(this.root, key, val);
    this.root.red = false;
  }

  private put(head: Item<Key, Val>, key: Key, val: Val): Item<Key, Val> {
    if (head == null) return new Item<Key, Val>(key, val);

    const cmp = this.comptor(key, head.key);
    if (cmp < 0) head.left = this.put(head.left, key, val);
    else if (cmp > 0) head.right = this.put(head.right, key, val);
    else head.val = val;

    if (isRed(head.right) && !isRed(head.left)) head = rotateLeft(head);
    if (isRed(head.left) && isRed(head.left.left)) head = rotateRight(head);
    if (isRed(head.left) && isRed(head.right)) flipColor(head);
    head.size = size(head.left) + size(head.right) + 1;
    return head;
  }



  delete(key: Key): void {
    if (key == null) throw 'argument to delete() is null';
    if (this.get(key) == null) return;

    if (!isRed(this.root.left) && !isRed(this.root.right)) {
      this.root.red = true;
    }
    this.root = this._delete(this.root, key);
    if (this.root != null) this.root.red = false;
  }

  private _delete(head: Item<Key, Val>, key: Key): Item<Key, Val> {

    if (this.comptor(key, head.key) < 0) {
      if (!isRed(head.left) && !isRed(head.left.left)) {
        head = moveRedLeft(head);
      }
      head.left = this._delete(head.left, key);
    } else {
      if (isRed(head.left)) { head = rotateRight(head); }
      if (this.comptor(key, head.key) === 0 && (head.right == null)) { return null; }
      if (!isRed(head.right) && !isRed(head.right.left)) { head = moveRedRight(head); }
      if (this.comptor(key, head.key) === 0) {
        const x = this._min(head.right);
        head.key = x.key;
        head.val = x.val;
        head.right = deleteMin(head.right);
      } else head.right = this._delete(head.right, key);
    }
    return balance(head);
  }
  min(): Entry<Key, Val> {
    if (this.root == null) throw 'called min() with empty symbol table';
    return this._min(this.root);
  }
  private _min(root: Item<Key, Val>): Item<Key, Val> {
    return root.left == null ? root : this._min(root.left);
  }
  max(): Entry<Key, Val> {
    if (this.root == null) throw 'called max() with empty symbol table';
    return this._max(this.root);
  }
  private _max(x: Item<Key, Val>) {
    if (x.right == null) return x;
    else return this._max(x.right);
  }
  of(position: number): Entry<Key, Val> {
    if (position < 0 || position >= size(this.root)) {
      throw 'called index() with invalid argument: ' + position;
    }
    function index(root: Item<Key, Val>, pos: number): Item<Key, Val> {
      const k = size(root.left);
      if (k > pos) return index(root.left, pos);
      else if (k < pos) return index(root.right, pos - k - 1);
      else return root;
    }
    const item = index(this.root, position);
    return item;
  }


  forEach(consume: (entry: Entry<Key, Val>, index: number) => void) {
    if (this.root == null) return;
    let index = 0;
    const loKey = this.min().key, hiKey = this.max().key;
    const forEach = (item: Item<Key, Val>) => {
      if (item == null) return;
      const loCmp = this.comptor(loKey, item.key);
      const hiCmp = this.comptor(hiKey, item.key);
      if (loCmp < 0) forEach(item.left);
      if (loCmp <= 0 && hiCmp >= 0) consume(item, index++);
      if (hiCmp > 0) forEach(item.right);
    };
    forEach(this.root);
  }
}

function isRed<K, V>(item: Item<K, V>): boolean {
  return item && item.red;
}

function size<K, V>(item: Item<K, V>) {
  return item && item.size || 0;
}

function deleteMin<Key, Val>(head: Item<Key, Val>): Item<Key, Val> {
  if (head.left == null) return null;
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
