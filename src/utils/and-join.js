export function andJoin(items) {
  if (items.length <= 1) {
    return items.join('');
  }
  const head = [...items];
  const tail = head.pop();
  return `${head.join(', ')} and ${tail}`;
}
