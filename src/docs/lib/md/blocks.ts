/**
 * Block-level markdown parser. Pure TS, no DOM.
 * Every parsed node records the raw source lines it came from — that is what
 * makes "click a rendered block → edit its exact markdown" possible in the UI.
 */

import { renderInline, escapeHtml } from './inline.js';
import type { InlineContext } from './inline.js';
import { parseFrontmatter } from '../frontmatter.js';
import { slugify } from '../util.js';
import { renderMathHtml } from './math.js';
import { renderMermaidSvg } from './mermaid.js';
import { highlightCode, isHighlightable } from './highlight.js';

export interface HeadingBlock { type: 'heading'; level: number; text: string; id?: string; start: number; end: number; raw: string }
export interface ParagraphBlock { type: 'paragraph'; lines: string[]; start: number; end: number; raw: string }
export interface CodeBlock { type: 'code'; lang: string; code: string; info?: string; start: number; end: number; raw: string }
export interface QuoteBlock { type: 'quote'; children: BlockNode[]; start: number; end: number; raw: string }
/** Public shape of a list item. */
export interface ListItem {
  blocks: BlockNode[];
  /** GFM-style task list item (`- [ ] text` / `- [x] text`). */
  task?: boolean;
  checked?: boolean;
}
export interface ListBlock { type: 'list'; ordered: boolean; items: ListItem[]; start: number; end: number; raw: string }
export interface HrBlock { type: 'hr'; start: number; end: number; raw: string }
export type Align = null | 'left' | 'center' | 'right';
export interface TableBlock {
  type: 'table';
  header: string[];
  aligns: Align[];
  rows: string[][];
  start: number;
  end: number;
  raw: string;
}
/** Definition list (`term` line followed by `: definition` lines). */
export interface DefinitionListBlock {
  type: 'dl';
  entries: { terms: string[]; defs: string[][] }[];
  start: number;
  end: number;
  raw: string;
}
/** Display math ($$ … $$). */
export interface MathBlock { type: 'math'; tex: string; start: number; end: number; raw: string }

export type BlockNode =
  | HeadingBlock
  | ParagraphBlock
  | CodeBlock
  | QuoteBlock
  | ListBlock
  | HrBlock
  | TableBlock
  | DefinitionListBlock
  | MathBlock;

const RE_BLANK = /^\s*$/;
const RE_FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})([ \t]*)(.*)$/;
const RE_HEADING = /^ {0,3}(#{1,6})[ \t]+(.*)$/;
const RE_HR = /^ {0,3}((-[ \t]*){3,}|(_[ \t]*){3,}|(\*[ \t]*){3,})$/;
const RE_QUOTE = /^ {0,3}>/;
const RE_ITEM = /^( *)([-*+]|[1-9][0-9]{0,8}[.)])[ \t]+(.*)$/;

const isBlank = (l: string): boolean => RE_BLANK.test(l);

/** Parse markdown lines into top-level blocks with absolute line ranges [start, end). */
export function parseBlocks(lines: string[]): BlockNode[] {
  const out: BlockNode[] = [];
  let i = 0;
  const n = lines.length;

  while (i < n) {
    const line = lines[i];
    if (isBlank(line)) { i++; continue; }

    // ---- display math $$…$$ --------------------------------------------------
    {
      const mo = /^\s*\$\$\s*(.*?)\s*$/.exec(line);
      if (mo) {
        const first = mo[1];
        if (/\$\$\s*$/.test(first) && first.replace(/\$\$\s*$/, '').trim() !== '') {
          // single-line $$ … $$
          out.push({ type: 'math', tex: first.replace(/\$\$\s*$/, '').trim(), start: i, end: i + 1, raw: line });
          i++;
          continue;
        }
        let closeIdx = -1;
        for (let k = i + 1; k < n; k++) {
          if (/^\s*\$\$\s*$/.test(lines[k])) { closeIdx = k; break; }
        }
        const endAbs = closeIdx >= 0 ? closeIdx + 1 : n;
        const texLines = lines.slice(i + 1, closeIdx === -1 ? n : closeIdx);
        out.push({ type: 'math', tex: texLines.join('\n').trim(), start: i, end: endAbs, raw: lines.slice(i, endAbs).join('\n') });
        i = endAbs;
        continue;
      }
    }

    // ---- fenced code ---------------------------------------------------------
    const f = RE_FENCE_OPEN.exec(line);
    let fenceDone = false;
    if (f && !(f[1][0] === '`' && f[3].includes('`'))) {
      const markerChar = f[1][0];
      const markerLen = Math.max(f[1].length, 3);
      const closerSrc = markerChar === '`' ? String.raw`\`` : '~';
      const closer = new RegExp(`^ {0,3}${closerSrc}{${markerLen},}[ \t]*$`);
      let closeIdx = -1;
      for (let k = i + 1; k < n; k++) {
        if (closer.test(lines[k])) { closeIdx = k; break; }
      }
      const endAbs = closeIdx >= 0 ? closeIdx + 1 : n;
      const codeLines = lines.slice(i + 1, closeIdx === -1 ? n : closeIdx);
      const infoFull = f[3].trim();
      const attrMatch = infoFull.match(/^([^\s{]+)\s*(\{.*\})?$/);
      const lang = markerChar === '`' ? firstWord(attrMatch ? attrMatch[1] : infoFull) : '';
      const extraInfo = attrMatch && attrMatch[2] ? attrMatch[2] : undefined;
      out.push({ type: 'code', lang, code: codeLines.join('\n'), info: extraInfo, start: i, end: endAbs, raw: lines.slice(i, endAbs).join('\n') });
      i = endAbs;
      continue;
    }

    // ---- heading ---------------------------------------------------------------
    if (!fenceDone) {
      const h = RE_HEADING.exec(line);
      if (h && !RE_HR.test(line)) {
        let text = cleanHeadingText(h[2]);
        let customId: string | undefined;
        const idm = text.match(/\{#([\w-]+)\}\s*$/);
        if (idm) {
          customId = idm[1];
          text = text.slice(0, idm.index).trim();
        }
        out.push({ type: 'heading', level: h[1].length, text, id: customId, start: i, end: i + 1, raw: line });
        i++;
        continue;
      }
    }

    // ---- horizontal rule -----------------------------------------------------------
    if (!fenceDone && RE_HR.test(line)) {
      out.push({ type: 'hr', start: i, end: i + 1, raw: line });
      i++;
      continue;
    }

    // ---- table --------------------------------------------------------------------------
    if (!fenceDone && line.includes('|') && i + 1 < n && isSeparatorRow(lines[i + 1])) {
      const header = splitRow(line);
      const aligns = parseAligns(splitRow(lines[i + 1])).slice(0, header.length);
      const rows: string[][] = [];
      let k = i + 2;
      while (k < n && !isBlank(lines[k]) && lines[k].includes('|')) {
        rows.push(padCells(splitRow(lines[k]), header.length));
        k++;
      }
      out.push({ type: 'table', header, aligns, rows, start: i, end: k, raw: lines.slice(i, k).join('\n') });
      i = k;
      continue;
    }

    // ---- blockquote --------------------------------------------------------------------------
    if (!fenceDone && RE_QUOTE.test(line)) {
      const inner: string[] = [];
      let k = i;
      while (k < n) {
        if (RE_QUOTE.test(lines[k])) {
          inner.push(lines[k].replace(/^ {0,3}>[ \t]?/, ''));
          k++;
          continue;
        }
        // a blank line does not end the quote when another '>' line follows
        if (isBlank(lines[k]) && k + 1 < n && RE_QUOTE.test(lines[k + 1])) {
          inner.push('');
          k++;
          continue;
        }
        break;
      }
      const children = parseBlocks(inner);
      for (const c of children) { c.start += i; c.end += i; } // rebase onto absolute lines
      out.push({ type: 'quote', children, start: i, end: k, raw: lines.slice(i, k).join('\n') });
      i = k;
      continue;
    }

    // ---- definition list ------------------------------------------------------------------------
    if (!fenceDone && i + 1 < n && /^ {0,3}: [ ]?/.test(lines[i + 1]) && !isBlank(line)
        && !RE_HEADING.test(line) && !RE_ITEM.test(line)) {
      const entries: DefinitionListBlock['entries'] = [];
      let k = i;
      while (k < n && !isBlank(lines[k])) {
        const terms: string[] = [];
        while (k < n && !isBlank(lines[k]) && !/^ {0,3}: /.test(lines[k])) {
          terms.push(lines[k]);
          k++;
        }
        const defs: string[][] = [];
        while (k < n && /^ {0,3}: /.test(lines[k])) {
          defs.push([lines[k].replace(/^ {0,3}: /, '')]);
          k++;
          // continuation lines indented under the definition
          while (k < n && /^ {2,}\S/.test(lines[k])) {
            defs[defs.length - 1].push(lines[k].trim());
            k++;
          }
        }
        if (terms.length === 0 || defs.length === 0) break;
        entries.push({ terms, defs });
      }
      if (entries.length > 0) {
        out.push({ type: 'dl', entries, start: i, end: k, raw: lines.slice(i, k).join('\n') });
        i = k;
        continue;
      }
    }

    // ---- list -----------------------------------------------------------------------------
    if (!fenceDone && RE_ITEM.test(line)) {
      const res = parseListRun(lines, i);
      out.push(...res.blocks);
      i = res.nextIndex;
      continue;
    }

    // ---- paragraph (with setext heading detection) ---------------------------------------------
    {
      const para: string[] = [line];
      let k = i + 1;
      while (k < n && !isBlank(lines[k]) && !startsNewBlock(lines, k) && !/^[ \t]*[-=]+[ \t]*$/.test(lines[k])) {
        para.push(lines[k]);
        k++;
      }
      const nextLine = lines[k];
      if (nextLine !== undefined && /^[ \t]*=+[ \t]*$/.test(nextLine)) {
        out.push({ type: 'heading', level: 1, text: para.join(' '), start: i, end: k + 1, raw: lines.slice(i, k + 1).join('\n') });
        i = k + 1;
      } else if (nextLine !== undefined && /^[ \t]*-+[ \t]*$/.test(nextLine)) {
        out.push({ type: 'heading', level: 2, text: para.join(' '), start: i, end: k + 1, raw: lines.slice(i, k + 1).join('\n') });
        i = k + 1;
      } else {
        out.push({ type: 'paragraph', lines: para, start: i, end: k, raw: para.join('\n') });
        i = k;
      }
    }
  }

  return out;
}

function cleanHeadingText(s: string): string {
  return s.replace(/[ \t]+#+[ \t]*$/, '').trim(); // strip optional closing hashes
}

/** Does this line begin a new block? (used to stop paragraph collection) */
function startsNewBlock(lines: string[], k: number): boolean {
  const l = lines[k];
  if (l === undefined) return true;
  if (RE_FENCE_OPEN.test(l)) return true;
  if (RE_HEADING.test(l)) return true;
  if (RE_HR.test(l)) return true;
  if (RE_QUOTE.test(l)) return true;
  if (RE_ITEM.test(l)) return true;
  if (l.includes('|') && k + 1 < lines.length && isSeparatorRow(lines[k + 1])) return true;
  return false;
}

// ---------------------------------------------------------------------------
// lists — indentation-driven nesting via a frame stack.
//   deeper:   indent > top.indent + TOL  → new nested list under top's last item
//   same:     |indent - frame.indent| <= TOL → sibling in that frame's list
//   shallower: pop deeper frames first, then re-evaluate
// ---------------------------------------------------------------------------

/** Parser-side item record: public fields plus bookkeeping. */
interface InternalItem extends ListItem { lines: string[]; textCol: number; absStart: number }
interface Frame { indent: number; list: ListBlock; lastItem: InternalItem | null; textCol: number }
interface ChildList { list: ListBlock; anchorAbs: number }

const TOL = 1; // same-level tolerance in spaces

function parseListRun(lines: string[], i0: number): { blocks: BlockNode[]; nextIndex: number } {
  const n = lines.length;

  // extent of the run: items + indented/lazy continuations, until blank or new block
  let j = i0;
  while (j < n) {
    const l = lines[j];
    if (isBlank(l)) break;
    if (RE_ITEM.test(l)) { j++; continue; }
    if (/^ +\S/.test(l) || /^ +[`>*]/.test(l)) { j++; continue; } // indented continuation / inline fence or quote inside an item
    if (!isBlockStartLike(l)) { j++; continue; } // lazy continuation of the open item
    break;
  }

  const makeList = (ordered: boolean): ListBlock => ({ type: 'list', ordered, items: [], start: i0, end: j, raw: '' });

  const frames: Frame[] = []; // stack, indent increasing
  const blocksOut: ListBlock[] = [];
  /** nested lists anchored under a parent item at an absolute source line */
  const childrenOf = new Map<InternalItem, ChildList[]>();

  for (let p = i0; p < j; p++) {
    const l = lines[p];
    const m = RE_ITEM.exec(l);

    if (!m) {
      // continuation of the deepest frame's last item, de-indented toward its text column
      const topFrame = frames[frames.length - 1];
      if (topFrame?.lastItem) {
        topFrame.lastItem.lines.push(stripIndent(l, Math.max(topFrame.textCol, 1)));
      }
      continue;
    }

    const indent = m[1].length;
    while (frames.length > 1 && indent < frames[frames.length - 1].indent - TOL) frames.pop();

    let target: Frame;
    const ordered = /^\d/.test(m[2]);

    if (frames.length === 0 || indent <= frames[0].indent + TOL) {
      // root level of this run
      if (frames.length > 0 && Math.abs(indent - frames[0].indent) <= TOL) {
        target = frames[0];
      } else if (frames.length === 0) {
        target = { indent, list: makeList(ordered), lastItem: null, textCol: 2 };
        frames.push(target);
        blocksOut.push(target.list);
      } else {
        // shallower than the root frame by more than TOL → treat as sibling of root anyway
        target = frames[0];
      }
    } else {
      const topFrame = frames[frames.length - 1];
      if (Math.abs(indent - topFrame.indent) <= TOL) {
        target = topFrame; // sibling at the deepest level
      } else {
        // strictly deeper: nest under the last item of the deepest frame
        const parentItem = topFrame.lastItem;
        if (!parentItem) continue; // malformed — skip
        const nl = makeList(ordered);
        nl.start = p;
        pushChild(childrenOf, parentItem, { list: nl, anchorAbs: p });
        target = { indent, list: nl, lastItem: null, textCol: 2 };
        frames.push(target);
      }
    }

    const item: InternalItem = { blocks: [], lines: [m[3]], textCol: l.length - m[3].length, absStart: p };
    target.list.items.push(item);
    target.lastItem = item;
    target.textCol = item.textCol;
  }

  // finalize: parse each item's lines into blocks, interleaving anchored sub-lists
  //   so that prose → sublist → more prose keeps its original order.
  const TASK_RE = /^\[( |x|X)\][ \t]+/;
  const finalize = (listNode: ListBlock): void => {
    for (const it of listNode.items) {
      const internal = it as InternalItem;
      while (internal.lines.length > 0 && isBlank(internal.lines[internal.lines.length - 1])) internal.lines.pop();
      const tm = TASK_RE.exec(internal.lines[0] ?? '');
      if (tm && internal.lines[0].slice(tm[0].length).trim() !== '') {
        it.task = true;
        it.checked = tm[1].toLowerCase() === 'x';
        internal.lines[0] = internal.lines[0].slice(tm[0].length);
      }
      const kids = [...(childrenOf.get(internal) ?? [])].sort((a, b) => a.anchorAbs - b.anchorAbs);
      const base = internal.absStart;
      const blocks: BlockNode[] = [];
      let prev = 0;
      for (const kid of kids) {
        const rel = Math.max(prev, Math.min(kid.anchorAbs - base, internal.lines.length));
        blocks.push(...parseBlocks(internal.lines.slice(prev, rel)));
        finalize(kid.list);
        blocks.push(kid.list);
        prev = rel + 1; // the anchor line itself belongs to the child's first item
      }
      blocks.push(...parseBlocks(internal.lines.slice(prev)));
      internal.blocks = blocks;
    }
  };
  for (const b of blocksOut) finalize(b);

  return { blocks: blocksOut, nextIndex: j };
}

function pushChild(map: Map<InternalItem, ChildList[]>, item: InternalItem, child: ChildList): void {
  const arr = map.get(item);
  if (arr) arr.push(child);
  else map.set(item, [child]);
}

/** Does this line start a structural block (stops list-run lazy continuation)? */
function isBlockStartLike(l: string): boolean {
  if (RE_FENCE_OPEN.test(l)) return true;
  if (RE_HEADING.test(l)) return true;
  if (RE_HR.test(l)) return true;
  if (RE_QUOTE.test(l)) return true;
  if (/^[ \t]*[-=]+[ \t]*$/.test(l)) return true; // setext underline
  return false;
}

function stripMarkerless(line: string): string {
  return line.replace(/^ +/, '');
}
void stripMarkerless;

function stripIndent(line: string, col: number): string {
  const sp = leadingSpaces(line);
  if (sp === 0) return line;
  return line.slice(Math.min(sp, col));
}

function leadingSpaces(l: string): number {
  return (l.match(/^ */) ?? [''])[0].length;
}

function padCells(cells: string[], width: number): string[] {
  const out = [...cells];
  while (out.length < width) out.push('');
  return out;
}

// ---------------------------------------------------------------------------
// tables
// ---------------------------------------------------------------------------

/**
 * Split a table row into cells. Handles: leading/trailing pipes (optional),
 * escaped `\|`, and pipes inside inline code spans (which do NOT split).
 */
export function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells: string[] = [];
  let cur = '';
  let codeDelim = '';   // opening backtick run while inside a code span ('' = not in code)
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === '\\' && s[i + 1] === '|') { cur += '|'; i += 2; continue; } // escaped pipe
    if (c === '`') {
      let run = '';
      while (i < s.length && s[i] === '`') { run += '`'; i++; }
      if (codeDelim === '') codeDelim = run;            // entering a code span
      else if (run.length >= codeDelim.length) codeDelim = ''; // closing it
      cur += run;
      continue;
    }
    if (c === '|' && codeDelim === '') { cells.push(cur.trim()); cur = ''; i++; continue; }
    cur += c;
    i++;
  }
  cells.push(cur.trim());
  return cells;
}

export function isSeparatorRow(line: string): boolean {
  if (!line.includes('-') || !line.includes('|')) return false;
  const cells = splitRow(line);
  if (cells.length === 0) return false;
  return cells.every((c) => /^:?-+:?$/.test(c));
}

export function parseAligns(cells: string[]): Align[] {
  return cells.map((c) => {
    const left = c.startsWith(':');
    const right = c.length > 1 && c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return null;
  });
}

function firstWord(s: string): string {
  const m = s.match(/\S+/);
  return m ? m[0] : '';
}

// ---------------------------------------------------------------------------
// rendering to HTML strings (print view / exports use this directly)
// ---------------------------------------------------------------------------

export interface RenderOptions extends InlineContext {}

interface RenderCtx { usedIds: Set<string> }

/** Render parsed blocks into an HTML string. All user text is escaped — injection-safe by construction. */
export function renderBlocksHtml(blocks: BlockNode[], opts?: RenderOptions): string {
  const ctx: RenderCtx = { usedIds: new Set() };
  return blocks.map((b) => renderBlock(b, opts, ctx)).join('\n');
}

function renderBlock(b: BlockNode, opts?: RenderOptions, ctx: RenderCtx = { usedIds: new Set() }): string {
  switch (b.type) {
    case 'heading': {
      const lvl = Math.min(6, Math.max(1, b.level));
      const base = b.id ?? slugForHeading(b.text);
      let id = base;
      let k2 = 2;
      while (ctx.usedIds.has(id)) id = `${base}-${k2++}`; // dedupe across the document
      ctx.usedIds.add(id);
      return `<h${lvl} id="${quoteAttrId(id)}">${renderInline(b.text, opts)}</h${lvl}>`;
    }
    case 'paragraph': {
      let html = '';
      for (let k = 0; k < b.lines.length; k++) {
        const l = b.lines[k];
        if (k > 0) {
          const prev = b.lines[k - 1];
          html += /[\\]$/.test(prev) || /[ \t]{2}$/.test(prev) ? '<br>' : ' ';
        }
        html += renderInline(l.endsWith('\\') ? l.slice(0, -1) : l, opts);
      }
      return `<p>${html}</p>`;
    }
    case 'code': {
      if (/^(mermaid|stateDiagram(-v2)?)$/i.test(b.lang)) {
        const svg = renderMermaidSvg(b.code);
        if (svg) return `<div class="md-mermaid-view">${svg}</div>`;
        return `<div class="md-mermaid" data-lang="${b.lang}">${escapeHtml(b.code)}</div>`;
      }
      const cls = b.lang ? ` class="lang-${b.lang.replace(/[^a-zA-Z0-9+-]/g, '')}"` : '';
      const info = b.info ? ` data-info="${quoteAttrId(b.info)}"` : '';
      const hl = b.lang && isHighlightable(b.lang) ? highlightCode(b.code, b.lang) : '';
      return `<pre${cls}${info}><code>${hl || escapeHtml(b.code)}</code></pre>`;
    }
    case 'quote':
      return `<blockquote>${renderBlocksHtml(b.children, opts).replace(/\n/g, '')}</blockquote>`;
    case 'hr':
      return '<hr>';
    case 'math':
      return `<div class="md-math-block" title="${quoteAttrId(b.tex)}">${renderMathHtml(b.tex)}</div>`;
    case 'dl': {
      const parts: string[] = ['<dl class="md-dl">'];
      for (const e of b.entries) {
        for (const t of e.terms) parts.push(`<dt>${renderInline(t, opts)}</dt>`);
        for (const d of e.defs) parts.push(`<dd>${d.map((l) => renderInline(l, opts)).join(' ')}</dd>`);
      }
      parts.push('</dl>');
      return parts.join('');
    }
    case 'table': {
      const th = b.header.map((c, k) => `<th${b.aligns[k] ? ` class="${b.aligns[k]}"` : ''}>${renderInline(c, opts)}</th>`).join('');
      const trs = b.rows
        .map((r) => `<tr>${r.map((c, k) => `<td${b.aligns[k] ? ` class="${b.aligns[k]}"` : ''}>${renderInline(c, opts)}</td>`).join('')}</tr>`)
        .join('');
      return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
    }
    case 'list': {
      const tag = b.ordered ? 'ol' : 'ul';
      const lis = b.items.map((it) => {
        const inner = renderBlocksHtml(it.blocks, opts);
        if (it.task) {
          return `<li class="md-task"><input type="checkbox" class="md-task-check"${it.checked ? ' checked' : ''}> ${inner}</li>`;
        }
        return `<li>${inner}</li>`;
      }).join('');
      return `<${tag} class="md-list">${lis}</${tag}>`;
    }
  }
}

function quoteAttrId(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Slug for auto heading ids: strip markdown markers, lowercase, dash-join. */
function slugForHeading(text: string): string {
  return slugify(text.replace(/[`*_~[\]()#!]/g, '').trim().toLowerCase() || 'heading');
}

/** Extract every `[[...]]` reference target in a document (frontmatter & code fences excluded). */
export function extractRefTargets(source: string): string[] {
  let text = source;
  try {
    text = parseFrontmatter(source).body;
  } catch { /* keep whole text */ }
  const seen = new Set<string>();
  let inFence = false;
  for (const line of text.split('\n')) {
    if (/^ {0,3}(`{3,}|~{3,})/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const noInlineCode = line.replace(/`[^`\n]*`/g, ' ');
    for (const m of noInlineCode.matchAll(/\[\[([^\]]+)\]\]/g)) {
      let t = m[1].replace(/^#/, '').split('|')[0] ?? '';
      t = t.replace(/\\([!*&[\]()_`~#|])/g, '$1').trim();
      if (t) seen.add(t);
    }
  }
  return [...seen];
}

// ---------------------------------------------------------------------------
// document-level definitions: link references & footnotes
// ---------------------------------------------------------------------------

export interface ReferenceDef { url: string; title?: string }

export interface ExtractedDefinitions {
  /** Link-reference definitions keyed by lowercase label. */
  refs: Map<string, ReferenceDef>;
  /** Footnote definitions keyed by label, each holding its raw content lines. */
  footnotes: Map<string, string[]>;
  /**
   * The input lines with every definition replaced by blank lines — line
   * indices are preserved so block ranges stay valid, but the definitions no
   * longer render as paragraphs.
   */
  cleaned: string[];
}

const RE_LINK_DEF = /^ {0,3}\[([^^\]]+)\]:\s*<?([^\s>]+)>?\s*(?:"([^"]*)"|'([^']*)')?\s*$/;
const RE_FOOTNOTE_DEF = /^ {0,3}\[\^([^\]]+)\]:\s*(.*)$/;

/** Scan a document for `[label]: url` and `[^label]: text` definitions. */
export function extractDefinitions(text: string): ExtractedDefinitions {
  const lines = text.split('\n');
  const refs = new Map<string, ReferenceDef>();
  const footnotes = new Map<string, string[]>();
  const cleaned = [...lines];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^ {0,3}(`{3,}|~{3,})/.test(l)) { inFence = !inFence; continue; }
    if (inFence) continue;
    // definitions only count at line start after a blank (or another definition)
    const prevOk = i === 0 || lines[i - 1].trim() === '' || RE_LINK_DEF.test(lines[i - 1]) || RE_FOOTNOTE_DEF.test(lines[i - 1]);
    if (!prevOk) continue;

    const fm = RE_LINK_DEF.exec(l);
    if (fm) {
      refs.set(fm[1].toLowerCase(), { url: fm[2], title: fm[3] ?? fm[4] ?? undefined });
      cleaned[i] = '';
      continue;
    }

    const fn = RE_FOOTNOTE_DEF.exec(l);
    if (fn) {
      const bodyLines: string[] = [];
      const first = fn[2].trim();
      if (first) bodyLines.push(first);
      let k = i + 1;
      while (k < lines.length) {
        const cl = lines[k];
        if (/^ {4,}\S/.test(cl)) { bodyLines.push(cl.trim()); cleaned[k] = ''; k++; continue; }
        break;
      }
      footnotes.set(fn[1], bodyLines);
      cleaned[i] = '';
      i = k - 1; // loop's i++ lands on the first unconsumed line
      continue;
    }
  }
  return { refs, footnotes, cleaned };
}

/**
 * Flip the `[ ]`/`[x]` marker of the `index`-th task item within the line
 * range [start, end). Returns the flipped line index, or -1 when not found.
 * Pure helper so the UI can offer click-to-toggle on rendered checklists.
 */
export function flipTaskInBlock(lines: string[], start: number, end: number, index: number): number {
  const re = /^(\s*(?:[-*+]|\d+[.)])[ \t]+\[)([ xX])(\].*)$/;
  let seen = -1;
  for (let i = Math.max(0, start); i < Math.min(end, lines.length); i++) {
    const m = re.exec(lines[i]);
    if (!m) continue;
    seen++;
    if (seen === index) {
      lines[i] = m[1] + (m[2] === ' ' ? 'x' : ' ') + m[3];
      return i;
    }
  }
  return -1;
}
