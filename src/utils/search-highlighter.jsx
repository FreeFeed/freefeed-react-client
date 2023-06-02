const hlClass = 'search-highlight';

export function highlightString(text, terms) {
  if (terms.length === 0 || text === '') {
    return [text];
  }

  const result = [];
  while (text !== '') {
    let match = '',
      minPos = 0;
    terms.forEach((re) => {
      const m = re.exec(text);
      if (m && (match === '' || m.index < minPos)) {
        minPos = m.index + (m[1] || '').length;
        match = m[2]; // eslint-disable-line prefer-destructuring
      }
    });

    if (match !== '') {
      result.push(text.slice(0, Math.max(0, minPos)));
      result.push(
        <span key={`hl-${result.length}`} className={hlClass} role="mark">
          {match}
        </span>,
      );
      text = text.slice(Math.max(0, minPos + match.length));
    } else {
      result.push(text);
      break;
    }
  }
  return result;
}
