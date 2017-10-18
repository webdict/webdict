
import { queryStorage } from '../shared/storage';
interface Item { note: string; time: number; }
document.addEventListener('DOMContentLoaded', () => {
  queryStorage(':ngl@notebook', (notebook) => {
    if (notebook) {
      const arr = new Array<Item>();
      // tslint:disable-next-line forin
      for (const key in notebook) {
        arr.push({ note: key, time: notebook[key].moment as number });
      }
      arr.sort((item1, item2) => {
        return item2.time - item1.time || item2.note.length - item1.note.length || (item1.note.toLowerCase() >= item2.note.toLowerCase() ? 1 : -1);
      });
      const main = document.getElementById('main') as HTMLElement;
      let html = '';
      const now = new Date();
      for (const item of arr) {
        now.setTime(item.time);
        html += `<div class="item-n"><div class="note">${item.note}</div><div class="time">${now.toDateString()}</div></div>`;
      }
      main.innerHTML = html;
    }
  });
});


