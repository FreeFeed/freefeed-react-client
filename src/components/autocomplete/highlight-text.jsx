/* eslint-disable prefer-destructuring */
/* eslint-disable unicorn/no-for-loop */
export function HighlightText({ text, matches }) {
  if (!text || matches.length === 0) {
    return <>{text}</>;
  }

  const mergedMatches = [];
  let start = matches[0];
  let end = matches[0];

  for (let i = 1; i < matches.length; i++) {
    if (matches[i] === end + 1) {
      end = matches[i];
    } else {
      mergedMatches.push([start, end]);
      start = matches[i];
      end = matches[i];
    }
  }
  mergedMatches.push([start, end]);

  const parts = [];
  let lastIndex = 0;

  for (const [start, end] of mergedMatches) {
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(<mark key={`${start}:${end}`}>{text.slice(start, end + 1)}</mark>);
    lastIndex = end + 1;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
