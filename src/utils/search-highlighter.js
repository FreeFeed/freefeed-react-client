import _ from 'lodash';
import { stemmer as enStemmer } from 'porter-stemmer';
import ruStemmer from './ru-stemmer';

const enLetters = 'a-z';
const ruLetters = '\u0400-\u04FF';

const partRE = /"(.+?)"|(\S+)/g;
const enWordRE = new RegExp(`^[${enLetters}]+$`, 'i');
const ruWordRE = new RegExp(`^[${ruLetters}]+$`, 'i');

const hlClass = 'search-highlight';

export function parseQuery(query) {
  const terms = [];
  let m;
  while ((m = partRE.exec(query)) !== null) {
    if (m[2] && (m[2].includes(':') || m[2].length === 1)) {
      continue;
    }
    if (m[1] !== undefined) {
      terms.push(
        new RegExp(
          `(^|[^${enLetters}${ruLetters}])(${_.escapeRegExp(
            m[1],
          )})(?:$|[^${enLetters}${ruLetters}])`,
          'i',
        ),
      );
    } else if (enWordRE.test(m[2])) {
      terms.push(
        new RegExp(
          `(^|[^${enLetters}])(${_.escapeRegExp(stem(m[2], enStemmer))}[${enLetters}]*)`,
          'i',
        ),
      );
    } else if (ruWordRE.test(m[2])) {
      terms.push(
        new RegExp(
          `(^|[^${ruLetters}])(${_.escapeRegExp(stem(m[2], ruStemmer))}[${ruLetters}]*)`,
          'i',
        ),
      );
    } else {
      terms.push(
        new RegExp(
          `(^|[^${enLetters}${ruLetters}])(${_.escapeRegExp(
            m[2],
          )})(?:$|[^${enLetters}${ruLetters}])`,
          'i',
        ),
      );
    }
  }
  return terms;
}

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
        <span key={`hl-${result.length}`} className={hlClass}>
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

function stem(word, stemmer) {
  const stemmed = stemmer(word);
  // Find common prefix of word and stemmed
  let commonLen = 0;
  for (let i = 0; i < Math.min(word.length, stemmed.length); i++) {
    if (word.charAt(i) !== stemmed.charAt(i)) {
      break;
    }
    commonLen++;
  }
  return word.slice(0, commonLen);
}
