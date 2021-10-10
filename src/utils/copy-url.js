export function copyURL({ target }) {
  target.blur();

  // Creating absolute URL
  const link = document.createElement('a');
  link.href = target.value;

  const textNode = document.body.appendChild(document.createTextNode(link.href));

  const range = new Range();
  const selection = document.getSelection();

  range.selectNode(textNode);
  selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');
  selection.removeAllRanges();

  textNode.parentNode.removeChild(textNode);
}
