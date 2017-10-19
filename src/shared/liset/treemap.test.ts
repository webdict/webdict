
// tslint:disable
import Tree from './treemap';

import { shuffle } from '../utility';


class Item<Key, Val> {
  constructor(public key: Key, public val: Val) { }
}



const size = 1000;

function double(n: number) {
  return 2 * n;
}

const ARRAY = new Array<number>(size);
for (let i = 0; i < size; i++) {
  ARRAY[i] = i;
}


let initAndSortingTimeOfList = 0;
let initAndSortingTimeOfTree = 0;

let forEachTraversingTimeOfList = 0;
let forEachTraversingTimeOfTree = 0;

let randomIndexingTimeOfList = 0;
let randomIndexingTimeOfTree = 0;

let randomSearchingTimeOfList = 0;
let randomSearchingTimeOfTree = 0;

function listTest() {
  let start = Date.now();
  const list = new Array<Item<number, number>>();
  for (const key of ARRAY) {
    list.push(new Item(key, double(key)));
  }
  list.sort((i1, i2) => i1.key - i2.key);
  initAndSortingTimeOfList += Date.now() - start;
  start = Date.now();

  list.forEach((e, i) => {
    console.log(e.key, e.val, ARRAY[i]);
  });

  forEachTraversingTimeOfList += Date.now() - start;
  start = Date.now();

  for (const randomIndex of ARRAY) {
    const item = list[randomIndex];
    console.log(item.key, item.val);
  }
  randomIndexingTimeOfList += Date.now() - start;
  start = Date.now();
  outerfor:
  for (const randomKey of ARRAY) {
    for (const item of list) {
      if (item.key === randomKey) {
        console.log(true);
        continue outerfor;
      }
    }
    throw 'list: why not found?';
  }
  randomSearchingTimeOfList += Date.now() - start;


}
function treeTest() {
  let start = Date.now();
  const tree = new Tree<number, number>((n1, n2) => n1 - n2);
  for (const key of ARRAY) {
    tree.put(key, double(key));
  }
  initAndSortingTimeOfTree += Date.now() - start;
  start = Date.now();

  tree.forEach((e, i) => {
    console.log(e.key, e.val, ARRAY[i]);
  });

  forEachTraversingTimeOfTree += Date.now() - start;
  start = Date.now();

  for (const randomIndex of ARRAY) {
    const item = tree.of(randomIndex);
    console.log(item.key, item.val);
  }
  randomIndexingTimeOfTree += Date.now() - start;
  start = Date.now();

  for (const randomKey of ARRAY) {
    if (tree.has(randomKey)) {
      console.log(true);
      continue;
    }
    throw 'tree: why not found?';
  }
  randomSearchingTimeOfTree += Date.now() - start;
}

let count = 500;

while (count--) {
  shuffle(ARRAY);
  const switcher = Math.random() > 0.5;
  if (switcher) {
    listTest();
    treeTest();
  } else {
    treeTest();
    listTest();
  }
}
console.log('\n\ninit and sorting:')
console.log('list time', initAndSortingTimeOfList);
console.log('tree time', initAndSortingTimeOfTree);

console.log('\n\nfor each traversing:')
console.log('list time', forEachTraversingTimeOfList);
console.log('tree time', forEachTraversingTimeOfTree);

console.log('\n\nrandom indexing:')
console.log('list time', randomIndexingTimeOfList);
console.log('tree time', randomIndexingTimeOfTree);

console.log('\n\nrandom searching:')
console.log('list time', randomSearchingTimeOfList);
console.log('tree time', randomSearchingTimeOfTree);
