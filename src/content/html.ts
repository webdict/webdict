export default function (entry) {
  document.querySelectorAll('.lanx-root')
    .forEach(prev => document.body.removeChild(prev));
  const root = document.createElement('div');
  root.classList.add('lanx-root');
  root.innerHTML = viewHTML(entry) + editHTML(entry);
  document.body.appendChild(root);
  return root;

}

function viewHTML({ word, mean, lang, pist }) {
  return [
    `<div class="lanx-view">`,
    `  <div class="lanx-head">`,
    `    <div class="lanx-word">${word}</div>`,
    `    <div class="lanx-hide"></div>`,
    `    <div class="lanx-mean">${mean}</div>`,
    `  </div>`,
    ...pist.map(pron => pronView(lang, pron)),
    `  <div class="lanx-foot"></div>`,
    `</div>`
  ].reduce((a, b) => a + b.trim());
}


function pronView(lang, pron) {
  if (lang === 'zh') {
    return [
      `<div class="lanx-pron">`,
      `  <div class="lanx-pron-puk">»</div>`,
      `  <div class="lanx-pron-pos">${pronZh(pron)}</div>`,
      `  <div class="lanx-pron-pus">«</div>`,
      `</div>`
    ].reduce((a, b) => a + b.trim());
  } else if (lang === 'en') {
    return null;
  }
  throw 'Unknown lang: ' + lang;
}


function pronZh({ type, pinv }) {
  return null;
}


function editHTML({ word, mean }) {
  return [
    `<div class="lanx-edit lanx-none">`,
    `  <div class="lanx-back">${word}</div>`,
    `  <textarea class="lanx-area">${mean}</textarea>`,
    `  <div class="lanx-done">完成</div>`,
    `  <div class="lanx-foot"></div>`,
    `</div>`
  ].reduce((a, b) => a + b.trim());
}