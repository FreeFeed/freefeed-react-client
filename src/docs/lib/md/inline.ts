/**
 * Inline markdown → HTML (string) renderer. Pure, dependency-free.
 * All literal text is escaped; markup only ever comes from our own constructs
 * plus a sanitized allowlist of inline HTML tags, so the output cannot inject
 * arbitrary scripts.
 *
 * Supported inline syntax: emphasis (asterisk, underscore, double, triple),
 * inline code, links (inline, reference-style, collapsed and shortcut),
 * images (inline + reference-style, http/https/data-image), autolinks
 * (<url> and bare URLs), wiki note references ([[Target]] / [[id|text]] /
 * md: scheme), footnote references ([^label]), inline math ($…$), HTML
 * entities, emoji shortcodes and a safe subset of raw inline HTML.
 */

export interface RefResolution {
  /** Resolve a `[[Target]]` / `[x](md:target)` reference to an existing note. Null when missing. */
  resolveRef?: (target: string) => { id: string; title: string } | null;
}

export interface InlineContext extends RefResolution {
  /** Markdown link-reference definitions (`[label]: url "title"`), keyed lowercase. */
  references?: { get(label: string): { url: string; title?: string } | null };
  /** Footnote registry; returns the display number or null if the label is undefined. */
  footnotes?: { number(label: string): number | null };
}

const SAFE_URL = /^(https?:|mailto:|#)/i;
const DENYED_URL = /^\s*(javascript|vbscript):/i;
const BARE_URL_RE = /^https?:\/\/[^\s<>()[\]]+/;

import { renderMathHtml } from './math.js';

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function quoteAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

/** Unescape the markdown backslash-escapes we recognize. */
export function unescapeMd(s: string): string {
  return s.replace(/\\([!*&[\]()_`~#$\\])/g, '$1');
}

const isNonSpace = (c: string | undefined) => c !== undefined && c.trim() !== '';

/** Render inline markdown (no block elements) into an HTML string. */
export function renderInline(src: string, opts?: InlineContext): string {
  const out: string[] = [];
  let buf = '';
  let i = 0;
  const n = src.length;
  const flush = () => {
    if (buf) {
      out.push(escapeHtml(buf));
      buf = '';
    }
  };

  while (i < n) {
    const ch = src[i];

    // --- backslash escapes ----------------------------------------------------
    if (ch === '\\' && i + 1 < n && /[!*&[\]()_`~#$\\]/.test(src[i + 1])) {
      buf += src[i + 1];
      i += 2;
      continue;
    }

    // --- inline code span `...` — never spans a line break --------------------
    if (ch === '`') {
      let openLen = 0;
      while (src[i + openLen] === '`') openLen++;
      const close = closeCodeSpan(src, i + openLen, openLen);
      if (close) {
        flush();
        out.push(`<code>${escapeHtml(close.content)}</code>`);
        i = close.after;
        continue;
      }
    }

    // --- autolinks <https://…>, <mail@host> and safe inline HTML --------------
    if (ch === '<') {
      const auto = matchAutolink(src, i);
      if (auto) {
        flush();
        const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(auto.url);
        const href = isMail ? `mailto:${auto.url}` : auto.url;
        out.push(`<a href="${quoteAttr(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(auto.url)}</a>`);
        i = auto.after;
        continue;
      }
      const tag = matchSafeHtmlTag(src, i);
      if (tag) {
        flush();
        out.push(tag.html);
        i = tag.after;
        continue;
      }
    }

    // --- bare URLs (http://… or https://…) ------------------------------------
    if ((ch === 'h' || ch === 'H') && BARE_URL_RE.test(src.slice(i))) {
      const m = BARE_URL_RE.exec(src.slice(i))!;
      const prevOk = i === 0 || !/[a-zA-Z0-9/]/.test(src[i - 1]);
      if (prevOk) {
        flush();
        const url = m[0].replace(/[.,;:!?]+$/, ''); // don't swallow sentence punctuation
        out.push(`<a href="${quoteAttr(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`);
        i += url.length;
        continue;
      }
    }

    // --- image ![alt](src) / ![alt][label] -------------------------------------
    if (ch === '!' && src[i + 1] === '[') {
      const img = matchImage(src, i, opts);
      if (img) {
        flush();
        if (img.html !== null) out.push(img.html);
        else buf += src.slice(i, img.after); // unsafe url → literal text
        i = img.after;
        continue;
      }
    }

    // --- brackets: footnote [^id], wiki [[..]], links (inline/reference/shortcut)
    if (ch === '[') {
      const bracket = matchBracket(src, i, opts);
      if (bracket) {
        flush();
        if (bracket.html !== null) out.push(bracket.html);
        i = bracket.after;
        continue;
      }
    }

    // --- bold-italic ***text*** -------------------------------------------------
    if (ch === '*' && src[i + 1] === '*' && src[i + 2] === '*') {
      const j = findCloseTriple(src, i + 3);
      if (j >= 0) {
        const inner = src.slice(i + 3, j);
        if (validEmphasisInner(inner)) {
          flush();
          out.push(`<strong><em>${renderInline(unescapeMd(inner), opts)}</em></strong>`);
          i = j + 3;
          continue;
        }
      }
    }

    // --- bold **text** ----------------------------------------------------------
    if (ch === '*' && src[i + 1] === '*') {
      const j = findCloseRun(src, i + 2, '*');
      if (j >= 0) {
        const inner = src.slice(i + 2, j);
        if (validEmphasisInner(inner)) {
          flush();
          out.push(`<strong>${renderInline(unescapeMd(inner), opts)}</strong>`);
          i = j + 2;
          continue;
        }
      }
    }

    // --- strikethrough ~~text~~ or ~text~ ----------------------------------------
    if (ch === '~') {
      const dbl = src[i + 1] === '~';
      const marker = dbl ? 2 : 1;
      const j = dbl ? findCloseRun(src, i + 2, '~') : findSingleClose(src, i + 1, '~');
      if (j >= 0) {
        const inner = src.slice(i + marker, j);
        if (validEmphasisInner(inner)) {
          flush();
          out.push(`<del>${renderInline(unescapeMd(inner), opts)}</del>`);
          i = j + marker;
          continue;
        }
      }
    }

    // --- emphasis *text* or _text_ ------------------------------------------------
    if (ch === '*' || ch === '_') {
      const next = src[i + 1];
      const prev = i > 0 ? src[i - 1] : ' ';
      if (next !== ch && okEmphasisOpener(prev, next, ch)) {
        const j = findSingleClose(src, i + 1, ch);
        if (j >= 0) {
          flush();
          out.push(`<em>${renderInline(unescapeMd(src.slice(i + 1, j)), opts)}</em>`);
          i = j + 1;
          continue;
        }
      }
    }

    // --- inline math $…$ ------------------------------------------------------------
    if (ch === '$' && isNonSpace(src[i + 1]) && src[i + 1] !== '$') {
      const lineEnd = src.indexOf('\n', i);
      const stop = lineEnd === -1 ? n : lineEnd;
      const j = src.indexOf('$', i + 1);
      if (j > i + 1 && j < stop) {
        const content = src.slice(i + 1, j);
        const priceLike = /^\d+([.,]\d+)?$/.test(content.trim());
        if (isNonSpace(content[content.length - 1]) && !priceLike) {
          flush();
          out.push(`<span class="md-math" title="${quoteAttr(content)}">${renderMathHtml(content)}</span>`);
          i = j + 1;
          continue;
        }
      }
    }

    // --- emoji shortcodes :name: ------------------------------------------------------
    if (ch === ':' && /[a-z_]/.test(src[i + 1] ?? '')) {
      const m = /^:([a-z0-9_+]+):/.exec(src.slice(i, i + 26));
      if (m && EMOJI[m[1]] !== undefined) {
        flush();
        buf += EMOJI[m[1]];
        i += m[0].length;
        continue;
      }
    }

    // --- HTML entities ------------------------------------------------------------------
    if (ch === '&') {
      const m = /^&(#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});/.exec(src.slice(i));
      if (m) {
        const decoded = decodeEntity(m[1]);
        if (decoded !== null) {
          buf += decoded;
          i += m[0].length;
          continue;
        }
      }
    }

    buf += ch;
    i++;
  }
  flush();
  return out.join('');
}

/** HTML for a note reference — resolved link or "missing" chip. */
export function refHtml(target: string, display: string, opts?: RefResolution): string {
  const resolved = opts?.resolveRef ? opts.resolveRef(target) : null;
  if (resolved) {
    return `<a class="md-ref" data-ref-id="${quoteAttr(resolved.id)}" href="#/note/${encodeURIComponent(resolved.id)}">${escapeHtml(display)}</a>`;
  }
  return `<span class="md-ref md-ref-missing" title="No note called &quot;${quoteAttr(display)}&quot; yet">${escapeHtml(display)}</span>`;
}

// ---------------------------------------------------------------------------
// bracket matcher: footnote / wiki / inline link / image / reference-style
// ---------------------------------------------------------------------------

interface BracketResult { html: string | null; after: number }

function matchBracket(src: string, start: number, opts?: InlineContext): BracketResult | null {
  const n = src.length;

  // footnote reference [^label]
  if (src[start + 1] === '^') {
    const close = src.indexOf(']', start + 2);
    if (close > start + 2 && src[close + 1] !== ':') {
      const label = src.slice(start + 2, close);
      const num = opts?.footnotes ? opts.footnotes.number(label) : null;
      if (num !== null) {
        return { html: `<sup class="footnote-ref" id="fnref-${quoteAttr(label)}"><a href="#fn-${quoteAttr(label)}">[${num}]</a></sup>`, after: close + 1 };
      }
      return null; // undefined footnote → literal text
    }
    return null;
  }

  // wiki link [[..]] — handled by caller via dedicated branch? keep here for cohesion
  if (src[start + 1] === '[') {
    const closeIdx = findWikiEnd(src, start);
    if (closeIdx >= 0) {
      const inner = unescapeMd(src.slice(start + 2, closeIdx));
      const pipe = topLevelPipe(inner);
      let target: string;
      let display: string;
      if (pipe >= 0 && inner.slice(pipe + 1).trim() !== '') {
        target = inner.slice(0, pipe).trim();
        display = inner.slice(pipe + 1).trim();
      } else {
        target = inner.replace(/\s*\|\s*$/, '').trim();
        display = target;
      }
      return { html: refHtml(target, display, opts), after: closeIdx + 2 };
    }
    return null;
  }

  const span = matchPair(src, start, ']');
  if (!span) return null;
  const innerRaw = src.slice(start + 1, span.close);
  let p = span.close + 1;
  while (p < n && src[p] === ' ') p++;

  // inline destination [text](url "title")
  if (p < n && src[p] === '(') {
    const r = matchPair(src, p, ')');
    if (r) {
      const [urlRaw0, title] = splitUrlTitle(src.slice(p + 1, r.close));
      const urlRaw = unescapeMd(urlRaw0).trim();
      return { html: linkOrRefHtml(urlRaw, title, innerRaw, opts), after: r.close + 1 };
    }
  }

  // reference-style [text][label]
  if (p < n && src[p] === '[') {
    const lbl = matchPair(src, p, ']');
    if (lbl) {
      const label = src.slice(p + 1, lbl.close);
      const def = opts?.references?.get(label.toLowerCase());
      if (def) {
        return { html: linkOrRefHtml(def.url, def.title ?? null, innerRaw, opts), after: lbl.close + 1 };
      }
      return null;
    }
  }

  // collapsed [label][] and shortcut [label]
  let label: string | null = null;
  if (p < n && src[p] === '[' && src[p + 1] === ']') {
    label = innerRaw;
  } else if (p >= n || src[p] !== '(') {
    label = innerRaw; // shortcut — only when not followed by anything bracket-ish
  }
  if (label !== null && !/^\s*$/.test(label)) {
    const def = opts?.references?.get(label.toLowerCase());
    if (def) {
      return { html: linkOrRefHtml(def.url, def.title ?? null, innerRaw, opts), after: (src[p] === '[' && src[p + 1] === ']' ? p + 2 : span.close + 1) };
    }
  }
  return null;
}

/** Shared dispatcher for link destinations: md: refs, safe urls, refused schemes. */
function linkOrRefHtml(urlRaw: string, title: string | null, innerRaw: string, opts?: InlineContext): string {
  const url = unescapeMd(urlRaw).trim();
  const inner = unescapeMd(innerRaw).trim();
  if (url.toLowerCase().startsWith('md:')) {
    return refHtml(url.slice(3), inner || urlRaw, opts);
  }
  if (SAFE_URL.test(url)) {
    const tAttr = title ? ` title="${quoteAttr(title)}"` : '';
    const ext = url.startsWith('#') ? '' : ' target="_blank" rel="noopener noreferrer"';
    return `<a href="${quoteAttr(url)}"${ext}${tAttr}>${renderInline(innerRaw, opts) || quoteAttr(inner)}</a>`;
  }
  if (/^(javascript|vbscript):/i.test(url)) {
    return `<code>${escapeHtml(`[${inner}](${url})`)}</code>`; // refuse dangerous schemes
  }
  return `<span>${escapeHtml(innerRaw)}</span>`; // relative/unknown destination → plain text
}

interface ImageResult { html: string | null; after: number }

function matchImage(src: string, start: number, opts?: InlineContext): ImageResult | null {
  const span = matchPair(src, start + 1, ']');
  if (!span) return null;
  const alt = unescapeMd(src.slice(start + 2, span.close));
  let p = span.close + 1;
  while (src[p] === ' ') p++;

  if (src[p] === '(') {
    const r = matchPair(src, p, ')');
    if (r) {
      const [urlRaw0, title] = splitUrlTitle(src.slice(p + 1, r.close));
      const url = unescapeMd(urlRaw0).trim();
      const html = imageHtml(url, alt, title);
      return { html, after: r.close + 1 };
    }
  }
  if (src[p] === '[') {
    const lbl = matchPair(src, p, ']');
    if (lbl) {
      const def = opts?.references?.get(src.slice(p + 1, lbl.close).toLowerCase());
      if (def) return { html: imageHtml(def.url, alt, def.title ?? null), after: lbl.close + 1 };
    }
  }
  return null;
}

function imageHtml(url: string, alt: string, title: string | null): string | null {
  if (/^(https?:|data:image\/)/i.test(url) && !DENYED_URL.test(url)) {
    const t = title ? ` title="${quoteAttr(title)}"` : '';
    return `<img src="${quoteAttr(url)}" alt="${quoteAttr(alt)}"${t} loading="lazy">`;
  }
  return null; // unsafe/relative → caller renders literal text
}

// ---------------------------------------------------------------------------
// autolinks & safe raw html
// ---------------------------------------------------------------------------

function matchAutolink(src: string, start: number): { url: string; after: number } | null {
  const close = src.indexOf('>', start);
  if (close === -1) return null;
  const inner = src.slice(start + 1, close);
  if (/\s/.test(inner)) return null;
  if (/^https?:\/\//i.test(inner)) return { url: inner, after: close + 1 };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inner) && !/^mailto:/i.test(inner)) return { url: inner, after: close + 1 };
  return null;
}

/** Allowlisted raw inline HTML — attributes stripped except `title`. */
const HTML_ALLOW = new Set(['b', 'i', 'em', 'strong', 'u', 's', 'sub', 'sup', 'br', 'hr', 'kbd', 'mark', 'span', 'abbr', 'small', 'q', 'cite', 'var', 'samp', 'del', 'ins']);

function matchSafeHtmlTag(src: string, start: number): { html: string; after: number } | null {
  const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^<>]*?)?)\s*(\/?)>/.exec(src.slice(start));
  if (!m) return null;
  const [, closing, rawName, attrBlob, selfClose] = m;
  const name = rawName.toLowerCase();
  if (!HTML_ALLOW.has(name)) return null;
  // extract only a safe title attribute
  const tm = attrBlob.match(/title\s*=\s*("([^"]*)"|'([^']*)')/);
  const titleAttr = tm ? ` title="${quoteAttr(tm[2] ?? tm[3] ?? '')}"` : '';
  const html = `<${closing}${name}${titleAttr}${selfClose}>`;
  return { html, after: start + m[0].length };
}

// ---------------------------------------------------------------------------
// entities & emoji
// ---------------------------------------------------------------------------

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', copy: '©', reg: '®',
  trade: '™', hellip: '…', mdash: '—', ndash: '–', lsquo: '\u2018', rsquo: '\u2019',
  ldquo: '\u201c', rdquo: '\u201d', laquo: '«', raquo: '»', times: '×', divide: '÷',
  plusmn: '±', deg: '°', micro: 'µ', para: '¶', sect: '§', middot: '·', bull: '•',
  dagger: '†', permil: '‰', euro: '€', pound: '£', yen: '¥', cent: '¢', sect2: '§',
  larr: '←', uarr: '↑', rarr: '→', darr: '↓', harr: '↔', ne: '≠', le: '≤', ge: '≥',
  infin: '∞', sum: '∑', radic: '√', asymp: '≈', equiv: '≡', alpha: 'α', beta: 'β',
  pi: 'π', Omega: 'Ω', mu: 'μ', dagger2: '†',
};

function decodeEntity(body: string): string | null {
  if (body[0] === '#') {
    const cp = body[1] === 'x' || body[1] === 'X'
      ? parseInt(body.slice(2), 16)
      : parseInt(body.slice(1), 10);
    if (!Number.isNaN(cp) && cp > 0 && cp <= 0x10ffff) {
      try {
        return String.fromCodePoint(cp);
      } catch {
        return null;
      }
    }
    return null;
  }
  return NAMED_ENTITIES[body] ?? NAMED_ENTITIES[body.toLowerCase()] ?? null;
}

const EMOJI: Record<string, string> = {
  smile: '😄', smiley: '😃', grin: '😁', laugh: '😆', joy: '😂', wink: '😉', blush: '😊',
  innocent: '😇', thinking: '🤔', neutral: '😐', expressionless: '😑', sweat: '😅',
  cry: '😢', sob: '😭', angry: '😠', rage: '😡', scream: '😱', sleepy: '😪', zzz: '💤',
  heart: '❤️', broken_heart: '💔', sparkling_heart: '💖', star: '⭐', star2: '🌟',
  sparkles: '✨', fire: '🔥', boom: '💥', zap: '⚡', rainbow: '🌈', sun: '☀️',
  moon: '🌙', cloud: '☁️', umbrella: '☂️', snowflake: '❄️', seedling: '🌱',
  tada: '🎉', confetti_ball: '🎊', rocket: '🚀', airplane: '✈️', car: '🚗', ship: '🚢',
  house: '🏠', office: '🏢', thumbsup: '👍', thumbsdown: '👎', ok_hand: '👌',
  wave: '👋', clap: '👏', pray: '🙏', muscle: '💪', point_right: '👉', eyes: '👀',
  brain: '🧠', bulb: '💡', mag: '🔍', lock: '🔒', key: '🔑', hammer: '🔨',
  wrench: '🔧', gear: '⚙️', link: '🔗', paperclip: '📎', pushpin: '📌',
  bookmark: '🔖', memo: '📝', pencil: '✏️', book: '📖', books: '📚', newspaper: '📰',
  envelope: '✉️', inbox_tray: '📥', outbox_tray: '📤', phone: '📞', computer: '💻',
  iphone: '📱', camera: '📷', tv: '📺', battery: '🔋', light_bulb: '💡',
  warning: '⚠️', question: '❓', exclamation: '❗', grey_question: '❔',
  check: '✅', white_check_mark: '✅', x: '❌', negative_squared_cross_mark: '❎',
  heavy_check_mark: '✔️', hundred: '💯', clock: '🕐', alarm_clock: '⏰',
  calendar: '📅', chart_with_upwards_trend: '📈', bar_chart: '📊', clipboard: '📋',
  folder: '📁', open_file_folder: '📂', floppy_disk: '💾', moneybag: '💰',
  dollar: '💵', trophy: '🏆', medal: '🎖️', dart: '🎯', game_die: '🎲',
  notes: '🎵', musical_note: '🎶', coffee: '☕', beer: '🍺', pizza: '🍕',
  cake: '🍰', apple: '🍎', gift: '🎁', bell: '🔔', mega: '📣', speech_balloon: '💬',
  thought_balloon: '💭', bust_in_silhouette: '👤', users: '👥', crown: '👑',
  gem: '💎', balloon: '🎈', ghost: '👻', robot: '🤖', alien: '👽', skull: '💀',
  poop: '💩', unicorn: '🦄', dog: '🐶', cat: '🐱', bug: '🐛', turtle: '🐢',
};

// ---------------------------------------------------------------------------
// scanner helpers (all pure string ops)
// ---------------------------------------------------------------------------

/** Close a code span opened by `len` backticks: same line, run of at least len. */
function closeCodeSpan(src: string, from: number, len: number): { content: string; after: number } | null {
  let lineEnd = src.indexOf('\n', from);
  if (lineEnd === -1) lineEnd = src.length;
  let i = Math.min(from, lineEnd);
  while (i < lineEnd && i < src.length) {
    if (src[i] === '`') {
      const start = i;
      let L = 0;
      while (i < src.length && src[i] === '`') { L++; i++; }
      if (L >= len) return { content: src.slice(from, start), after: Math.min(i, src.length) };
    } else {
      i++;
    }
  }
  return null;
}

/** Next balanced closer of kind closeCh for the opener at openIdx. Null when unbalanced. */
function matchPair(src: string, openIdx: number, closeCh: ']' | ')'): { close: number } | null {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === '\\' && i + 1 < src.length) i++;
    else if (c === '[' || c === '(') depth++;
    else if (c === closeCh) {
      if (--depth <= 0) return { close: i };
    }
  }
  return null;
}

/** Index of the ']]' closing a [[...]] reference. */
function findWikiEnd(src: string, openIdx: number): number {
  const idx = src.indexOf(']]', openIdx + 2);
  return idx === -1 ? -1 : idx;
}

/** Top-level '|' in a string, ignoring pipes inside `code` spans. */
function topLevelPipe(s: string): number {
  let inCode = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '`') inCode = !inCode;
    else if (s[i] === '|' && !inCode) return i;
  }
  return -1;
}

/** Split "url \"title\"" into [url, title|null]. */
function splitUrlTitle(raw: string): [string, string | null] {
  const m = raw.match(/^(\S+)\s+("[^"]*"|'[^']*')\s*$/);
  if (m) return [m[1], m[2].slice(1, -1)];
  const i = raw.search(/\s/);
  if (i > 0 && /["']/.test(raw.slice(i))) return [raw.slice(0, i).trim(), null];
  return [raw.trim(), null];
}

/** Next lone '***' run (exactly three asterisks) at or after from. */
function findCloseTriple(src: string, from: number): number {
  let p = from - 1;
  for (;;) {
    p = src.indexOf('***', p + 1);
    if (p === -1) return -1;
    if (src[p - 1] !== '*' && src[p + 3] !== '*') return p;
  }
}

/** Next two-char run of ch that is exactly two chars long, at or after from. */
function findCloseRun(src: string, from: number, ch: '*' | '~'): number {
  const run = ch + ch;
  let p = from - 1;
  for (;;) {
    p = src.indexOf(run, p + 1);
    if (p === -1) return -1;
    const prev = src[p - 1];
    const next = src[p + 2];
    if ((prev === undefined || prev !== ch) && (next === undefined || next !== ch)) {
      return p;
    }
  }
}

/** Next lone occurrence of ch at or after from, where inner content ends with a non-space char. */
function findSingleClose(src: string, from: number, ch: '*' | '_' | '~'): number {
  let p = src.indexOf(ch, from);
  while (p !== -1) {
    if ((src[p - 1] === undefined || src[p - 1] !== ch) && (src[p + 1] === undefined || src[p + 1] !== ch)) {
      const inner = src.slice(from, p);
      if (inner.trim() !== '' && isNonSpace(inner[inner.length - 1])) return p;
    }
    p = src.indexOf(ch, p + 1);
  }
  return -1;
}

function validEmphasisInner(s: string): boolean {
  if (!s.trim()) return false;
  return isNonSpace(s[0]) && isNonSpace(s[s.length - 1]);
}

/** Simplified CommonMark flanking rules. */
function okEmphasisOpener(prev: string, next: string | undefined, ch: '*' | '_'): boolean {
  if (!isNonSpace(next)) return false;
  if (ch === '_' && /[a-zA-Z0-9]/.test(prev)) return false;
  return true;
}
