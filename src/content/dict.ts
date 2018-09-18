const Dict = document.createElement('div');
Dict.classList.add('lanx-root');
Dict.classList.add('lanx-none');
document.body.appendChild(Dict);

Dict.innerHTML = [
  '<div class="lanx-main">',
  '  <div class="lanx-view">',
  '    <div class="lanx-head">',
  '      <div class="lanx-word"></div>',
  '      <div class="lanx-hide"></div>',
  '      <div class="lanx-mean"></div>',
  '    </div>',
  '    <div class="lanx-list"></div>',
  '  </div>',
  '  <div class="lanx-edit">',
  '    <div class="lanx-back" title="取消"></div>',
  '    <textarea class="lanx-area"></textarea>',
  '    <div class="lanx-done">完成</div>',
  '  </div>',
  '</div>',
  '<div class="lanx-foot"></div>'
].reduce((a, b) => a + b.trim());

Dict.addEventListener('mouseup', event => {
  event.stopPropagation();
});

window.addEventListener('resize', () => {
  Dict.classList.add('lanx-none');
});

export default Dict;