
import { queryStorage } from '../shared/storage';

document.addEventListener('DOMContentLoaded', () => {

  queryStorage(':ngl@vocabulary', (vocabulary) => {

    if (vocabulary) {
      const arr = new Array();
      // tslint:disable-next-line forin
      for (const key in vocabulary) {
        arr.push({ word: key, count: vocabulary[key].count as number });
      }
      arr.sort((item1, item2) => {
        return item2.count - item1.count || item2.word.length - item1.word.length || (item1.word.toLowerCase() >= item2.word.toLowerCase() ? 1 : -1);
      });
      const main = document.getElementById('main') as HTMLElement;
      let html = '';
      for (const item of arr) {
        html += `<div class="item-h"><div class="word">${item.word}</div><div class="count">${item.count}</div></div>`;
      }
      main.innerHTML = html;
    }
  });
});
