/**
 * Lightweight syntax highlighting for fenced code blocks. Pure TS, no deps.
 * Supports 10+ popular languages; unknown languages return '' so callers fall
 * back to plain escaped text.
 */

import { escapeHtml } from './inline.js';

interface LangDef {
  kw: Set<string>;
  bi?: Set<string>;
  lc?: string[];                 // line comment markers
  bc?: [string, string][];       // block comment pairs
  strq: string[];                // string delimiters (longest first)
  ci?: boolean;                  // case-insensitive keywords (SQL)
  fnParen?: boolean;             // ident before '(' → function color
}

const S = (s: string) => new Set(s.split(' '));

const JS_KW = S('break case catch class const continue debugger default delete do else enum export extends false finally for function if implements import in instanceof interface let new null package private protected public readonly return static super switch this throw true try typeof var void while with yield async await of get set type keyof infer satisfies override declare namespace abstract is');
const JS_BI = S('console Math Object Array String Number Boolean Promise JSON window document require module exports setTimeout setInterval clearTimeout fetch Map Set WeakMap Symbol Error RegExp Date parseInt parseFloat isNaN globalThis process Buffer');
const PY_KW = S('False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case');
const PY_BI = S('print len range str int float list dict set tuple open input self super isinstance enumerate zip abs min max sum sorted map filter type round repr hash id staticmethod classmethod property Exception ValueError TypeError NotImplementedError __init__ __name__ __main__');
const BASH_KW = S('if then else elif fi for while until do done case esac in select function time coproc return exit local export readonly declare unset shift source alias trap set');
const BASH_BI = S('echo cd ls cat grep sed awk curl wget mkdir rmdir rm cp mv chmod chown sudo npm pnpm npx node python pip git docker kubectl make tar ssh scp find which head tail wc sort uniq xargs');
const SQL_KW = S('select from where insert into values update set delete create table drop alter add column join left right inner outer full cross on group by order having limit offset union all distinct as and or not null primary key foreign references default unique index view between like ilike in exists count sum avg min max begin commit rollback cascade constraint check auto_increment serial integer varchar text boolean timestamp date');
const GO_KW = S('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false iota');
const GO_BI = S('make len cap append copy delete panic recover print println new close error string int int64 float64 bool byte rune uint any');
const RUST_KW = S('fn let mut const static if else match loop while for in break continue return struct enum trait impl where use mod pub crate super self Self move ref as dyn unsafe extern true false macro_rules await async dyn');
const RUST_BI = S('println print vec format Some None Ok Err Result Option String Vec Box Rc Arc u8 u16 u32 u64 usize i8 i16 i32 i64 isize f32 f64 bool char str');
const C_KW = S('int char float double void long short unsigned signed struct union enum typedef sizeof static extern const volatile register return if else while do for switch case default break continue goto inline restrict NULL');
const CPP_KW = S('class public private protected template typename namespace using new delete this virtual override final try catch throw operator bool true false nullptr constexpr consteval auto explicit friend inline mutable noexcept static_assert static_cast dynamic_cast reinterpret_cast concept requires');
const JAVA_KW = S('public private protected class interface extends implements static final void int long double float boolean char byte short new return this super throws try catch finally import package instanceof enum abstract native synchronized transient volatile assert true false null record sealed var yield');
const CS_KW = S('public private protected internal class struct interface extends implements static readonly void int long double float bool char byte decimal string object var new return this base throws try catch finally using namespace instanceof enum abstract sealed override virtual partial async await out ref params is as null true false nameof');

const LANGS: Record<string, LangDef> = {};
function def(aliases: string[], d: LangDef): void {
  for (const a of aliases) LANGS[a] = d;
}

def(['js', 'jsx', 'javascript', 'mjs', 'cjs', 'node'], { kw: JS_KW, bi: JS_BI, lc: ['//'], bc: [['/*', '*/']], strq: ['`', '"', "'"], fnParen: true });
def(['ts', 'tsx', 'typescript'], { kw: JS_KW, bi: JS_BI, lc: ['//'], bc: [['/*', '*/']], strq: ['`', '"', "'"], fnParen: true });
def(['py', 'python', 'python3'], { kw: PY_KW, bi: PY_BI, lc: ['#'], strq: ['"""', "'''", '"', "'"] });
def(['bash', 'sh', 'shell', 'zsh', 'console'], { kw: BASH_KW, bi: BASH_BI, lc: ['#'], strq: ['"', "'"] });
def(['sql'], { kw: SQL_KW, lc: ['--'], bc: [['/*', '*/']], strq: ["'"], ci: true });
def(['go', 'golang'], { kw: GO_KW, bi: GO_BI, lc: ['//'], bc: [['/*', '*/']], strq: ['`', '"', "'"], fnParen: true });
def(['rust', 'rs'], { kw: RUST_KW, bi: RUST_BI, lc: ['//'], bc: [['/*', '*/']], strq: ['"', "'"], fnParen: true });
def(['c', 'h'], { kw: C_KW, lc: ['//'], bc: [['/*', '*/']], strq: ['"', "'"], fnParen: true });
def(['cpp', 'c++', 'cc', 'hpp'], { kw: new Set([...C_KW, ...CPP_KW]), lc: ['//'], bc: [['/*', '*/']], strq: ['"', "'"], fnParen: true });
def(['java'], { kw: JAVA_KW, bi: S('System String Integer Boolean List ArrayList HashMap Math'), lc: ['//'], bc: [['/*', '*/']], strq: ['"', "'"], fnParen: true });
def(['cs', 'csharp'], { kw: CS_KW, bi: S('Console String List Dictionary Math Task'), lc: ['//'], bc: [['/*', '*/']], strq: ['"', "'"], fnParen: true });
def(['json'], { kw: S('true false null'), lc: [], bc: [], strq: ['"'] });
def(['yaml', 'yml'], { kw: S('true false null'), lc: ['#'], strq: ['"', "'"] });

export const SUPPORTED_HL_LANGS = new Set(Object.keys(LANGS));

export function isHighlightable(lang: string): boolean {
  const key = lang.toLowerCase().trim();
  return key === 'html' || key === 'xml' || key === 'svg' || key === 'css' || LANGS[key] !== undefined;
}

/** Tokenize code into colored spans. Returns '' when the language is unknown. */
export function highlightCode(code: string, langRaw: string): string {
  const key = langRaw.toLowerCase().trim();
  if (key === 'html' || key === 'xml' || key === 'svg') return highlightMarkup(code);
  if (key === 'css') return highlightCss(code);
  const def = LANGS[key];
  if (!def) return '';

  const out: string[] = [];
  const span = (cls: string, text: string): void => { out.push(`<span class="tok-${cls}">${escapeHtml(text)}</span>`); };
  const n = code.length;
  let i = 0;

  const startsWith = (s: string): boolean => code.startsWith(s, i);

  outer: while (i < n) {
    // block comments
    for (const [o, c] of def.bc ?? []) {
      if (startsWith(o)) {
        let j = code.indexOf(c, i + o.length);
        j = j === -1 ? n : j + c.length;
        span('com', code.slice(i, j));
        i = j;
        continue outer;
      }
    }
    // line comments
    for (const lc of def.lc ?? []) {
      if (startsWith(lc)) {
        let j = code.indexOf('\n', i);
        j = j === -1 ? n : j;
        span('com', code.slice(i, j));
        i = j;
        continue outer;
      }
    }
    // strings
    for (const q of def.strq) {
      if (!startsWith(q)) continue;
      let j = i + q.length;
      while (j < n) {
        if (code[j] === '\\') { j += 2; continue; }
        if (code.startsWith(q, j)) { j += q.length; break; }
        if (code[j] === '\n' && q !== '`' && q !== '"""' && q !== "'''") break; // unterminated
        j++;
      }
      span('str', code.slice(i, Math.min(j, n)));
      i = Math.min(j, n);
      continue outer;
    }
    const ch = code[i];

    // numbers
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(code[i + 1] ?? ''))) {
      const m = /^(0[xXbBoO][0-9a-fA-F_]+|\d[\d_]*(\.\d+)?([eE][+-]?\d+)?)?/.exec(code.slice(i))!;
      const num = m[0] || ch;
      span('num', num);
      i += num.length;
      continue;
    }

    // bash variables
    if (ch === '$' && /^\$\{?[\w]+\}?/.test(code.slice(i))) {
      const m = /^\$\{?[\w]+\}?/.exec(code.slice(i))!;
      span('var', m[0]);
      i += m[0].length;
      continue;
    }

    // C/C++ preprocessor directives
    if (ch === '#' && /^#[ \t]*[a-z]+/i.test(code.slice(i)) && def.kw.has('int')) {
      const m = /^#[ \t]*[a-z]+/i.exec(code.slice(i))!;
      span('kw', m[0]);
      i += m[0].length;
      continue;
    }

    // identifiers / keywords
    if (/[A-Za-z_$@]/.test(ch)) {
      const m = /^[A-Za-z_$@#][\w$]*/.exec(code.slice(i));
      if (!m) { out.push(escapeHtml(ch)); i++; continue; }
      const word = m[0];
      const probe = def.ci ? word.toLowerCase() : word;
      let j = i + word.length;
      while (j < n && code[j] === ' ') j++;
      const nextIsParen = code[j] === '(';
      if (def.kw.has(probe)) span('kw', word);
      else if (def.bi?.has(probe)) span('bi', word);
      else if ((def.fnParen && nextIsParen) || nextIsParen === false && false) span('fn', word);
      else if (/^[A-Z]/.test(word) && word.length > 1) span('bi', word); // Types/Classes
      else span('', word);
      i += word.length;
      continue;
    }

    // whitespace & punctuation
    if ('{}()[];,.'.includes(ch) || ch === ':') { span('punc', ch); i++; continue; }
    out.push(escapeHtml(ch));
    i++;
  }
  return out.join('');
}

/** HTML/XML: tags, attributes, comments, text. */
function highlightMarkup(code: string): string {
  const parts: string[] = [];
  let i = 0;
  const n = code.length;
  while (i < n) {
    if (code.startsWith('<!--', i)) {
      let j = code.indexOf('-->', i);
      j = j === -1 ? n : j + 3;
      parts.push(`<span class="tok-com">${escapeHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }
    if (code[i] === '<') {
      const m = /^<\/?[A-Za-z][\w:-]*/.exec(code.slice(i));
      if (m) {
        parts.push(`<span class="tok-tag">${escapeHtml(m[0])}</span>`);
        i += m[0].length;
        // attributes until > 
        while (i < n && code[i] !== '>') {
          if (code.startsWith('<!--', i)) break;
          const am = /^(\s*)([\w:-]+)(=)?/.exec(code.slice(i));
          if (am) {
            i += am[0].length;
            if (am[1]) parts.push(escapeHtml(am[1]));
            parts.push(`<span class="tok-attr">${escapeHtml(am[2])}</span>${am[3] ? '=' : ''}`);
            if (am[3]) {
              const q = code[i] === '"' || code[i] === "'" ? code[i] : '';
              if (q) {
                let j = code.indexOf(q, i + 1);
                j = j === -1 ? n : j + 1;
                parts.push(`<span class="tok-str">${escapeHtml(code.slice(i, j))}</span>`);
                i = j;
              }
            }
          } else {
            parts.push(escapeHtml(code[i]));
            i++;
          }
        }
        if (i < n) { parts.push(`<span class="tok-tag">&gt;</span>`); i++; }
        continue;
      }
    }
    let j = code.indexOf('<', i === 0 && code[0] === '<' ? i + 1 : i);
    if (j === -1) j = n;
    if (j === i) j = i + 1;
    parts.push(escapeHtml(code.slice(i, j)));
    i = j;
  }
  return parts.join('');
}

/** CSS: at-rules, selectors, properties, values, numbers+units. */
function highlightCss(code: string): string {
  const parts: string[] = [];
  const re = /(\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(@[\w-]+)|([\w-]+)(?=\s*:)|(-?\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms)?)|([.#]?[-\w][\w-]*)(?=[^{}]*\{)|([{}:;,()])/g;
  let last = 0;
  for (const m of code.matchAll(re)) {
    if (m.index! > last) parts.push(escapeHtml(code.slice(last, m.index)));
    const cls = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'kw' : m[4] ? 'attr' : m[5] ? 'num' : m[6] ? 'tag' : 'punc';
    parts.push(`<span class="tok-${cls}">${escapeHtml(m[0])}</span>`);
    last = m.index! + m[0].length;
  }
  parts.push(escapeHtml(code.slice(last)));
  return parts.join('');
}
