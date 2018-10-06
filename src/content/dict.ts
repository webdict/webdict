const Dict = document.createElement('div');
Dict.classList.add('lanx-root');

Dict.innerHTML = [
  '<div class="lanx-main">',
  '  <div class="lanx-head">',
  '    <div class="lanx-word"></div>',
  '    <div class="lanx-hide" title="关闭"></div>',
  '    <div class="lanx-mean" title="编辑 » 释义"></div>',
  '  </div>',
  '</div>',
  '<div class="lanx-foot"></div>'
].reduce((a, b) => a + b.trim());

Dict.addEventListener('mouseup', event => {
  event.stopPropagation();
});


export default Dict;
