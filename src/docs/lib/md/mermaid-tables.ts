/**
 * Table-style diagram families sharing one renderer:
 *   erDiagram    — entities with attributes, cardinality relations
 *   classDiagram — classes with members, UML relation markers
 * Pure TS → inline SVG.
 */

import { escapeHtml } from './inline.js';

export interface TableRow { text: string }
export interface TableNode { id: string; title: string; rows: string[]; headerFill?: string }
export interface TableEdge {
  from: string;
  to: string;
  label?: string;
  /** decorations */
  head: 'none' | 'triangle' | 'arrow' | 'diamond-f' | 'diamond-o' | 'crow-one' | 'crow-many';
  tail: 'none' | 'diamond-f' | 'diamond-o' | 'crow-one' | 'crow-many';
  dotted: boolean;
}
export interface TableGraph {
  nodes: TableNode[];
  edges: TableEdge[];
}

// ---------------------------------------------------------------------------
// shared layered layout (cycle-aware) + SVG
// ---------------------------------------------------------------------------

interface Placed { x: number; y: number; w: number; h: number }

function layoutTables(g: TableGraph, sizeOf: (n: TableNode) => { w: number; h: number }): {
  pos: Map<string, Placed>;
  width: number;
  height: number;
} {
  const ids = g.nodes.map((n) => n.id);
  const level = new Map<string, number>(ids.map((id) => [id, 0]));
  const byId = new Map(g.nodes.map((n) => [n.id, n]));

  // back-edge detection
  const outgoing = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const e of g.edges) if (byId.has(e.from) && byId.has(e.to)) outgoing.get(e.from)!.push(e.to);
  const backEdges = new Set<string>();
  const color = new Map<string, number>(ids.map((id) => [id, 0]));
  const visit = (v: string): void => {
    color.set(v, 1);
    for (const w of outgoing.get(v) ?? []) {
      const c = color.get(w) ?? 0;
      if (c === 1) backEdges.add(`${v}->${w}`);
      else if (c === 0) visit(w);
    }
    color.set(v, 2);
  };
  for (const id of ids) if ((color.get(id) ?? 0) === 0) visit(id);

  // relax levels along forward edges only
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false;
    for (const e of g.edges) {
      if (!byId.has(e.from) || !byId.has(e.to)) continue;
      if (backEdges.has(`${e.from}->${e.to}`)) continue;
      const want = (level.get(e.from) ?? 0) + 1;
      if (want > (level.get(e.to) ?? 0)) { level.set(e.to, want); changed = true; }
    }
    if (!changed) break;
  }

  const rows = new Map<number, string[]>();
  for (const id of ids) {
    const l = Math.min(level.get(id) ?? 0, ids.length - 1);
    if (!rows.has(l)) rows.set(l, []);
    rows.get(l)!.push(id);
  }

  const pos = new Map<string, Placed>();
  const GAP_X = 60;
  const ROW_GAP = 56;

  let crossSize = 0;
  const rowSizes = new Map<number, { w: number; h: number }[]>();
  let maxLevel = 0;
  for (const [l, row] of rows) {
    maxLevel = Math.max(maxLevel, l);
    const sizes = row.map((id) => sizeOf(byId.get(id)!));
    rowSizes.set(l, sizes);
    crossSize = Math.max(crossSize, sizes.reduce((s2, sz) => s2 + sz.w + GAP_X, -GAP_X));
  }

  let depthSize = 0;
  for (const [l, sizes] of rowSizes) depthSize += Math.max(...sizes.map((s2) => s2.h)) + ROW_GAP;
  depthSize -= ROW_GAP;

  for (const [l, row] of rows) {
    const sizes = rowSizes.get(l)!;
    const rowW = sizes.reduce((s2, sz) => s2 + sz.w + GAP_X, -GAP_X);
    const rowH = Math.max(...sizes.map((s2) => s2.h));
    let acc = (crossSize - rowW) / 2;
    void rowW;
    const yBase = [...rowSizes.keys()].sort((a, b) => a - b).slice(0, l)
      .reduce((s2, k) => s2 + Math.max(...rowSizes.get(k)!.map((s3) => s3.h)) + ROW_GAP, 0);
    row.forEach((id, i) => {
      pos.set(id, { x: acc + sizes[i].w / 2, y: yBase + rowH / 2, w: sizes[i].w, h: sizes[i].h });
      acc += sizes[i].w + GAP_X;
    });
  }

  return { pos, width: crossSize, height: depthSize };
}

function markerDefs(): string {
  return (
    '<defs>'
    + '<marker id="tb-tri" viewBox="0 0 14 12" refX="12" refY="6" markerWidth="13" markerHeight="11" orient="auto-start-reverse"><path d="M1,1 L13,6 L1,11 z" fill="var(--surface, #fff)" stroke="currentColor"/></marker>'
    + '<marker id="tb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>'
    + '<marker id="tb-dia-f" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="15" markerHeight="9" orient="auto"><path d="M1,5 L8,1 L15,5 L8,9 z" fill="currentColor"/></marker>'
    + '<marker id="tb-dia-o" viewBox="0 0 16 10" refX="15" refY="5" markerWidth="15" markerHeight="9" orient="auto"><path d="M1,5 L8,1 L15,5 L8,9 z" fill="var(--surface, #fff)" stroke="currentColor"/></marker>'
    + '</defs>'
  );
}

/** Render a table graph. Returns svg string; empty nodes → null-safe empty svg. */
export function renderTableSvg(
  g: TableGraph,
  opts?: { title?: string },
): string | null {
  if (g.nodes.length === 0) return null;

  const CHAR_W = 7.0;
  const sizeOf = (n: TableNode): { w: number; h: number } => {
    const longest = Math.max(n.title.length, ...n.rows.map((r) => r.length), 8);
    return { w: Math.min(320, Math.max(150, longest * CHAR_W + 34)), h: 30 + n.rows.length * 17 + 8 };
  };
  const { pos, width, height } = layoutTables(g, sizeOf);

  const PAD = 26;
  const W = width + PAD * 2;
  const H = height + PAD * 2 + (opts?.title ? 24 : 0);

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}" class="mermaid-svg" role="img" aria-label="diagram">`,
    markerDefs(),
  );
  if (opts?.title) {
    parts.push(`<text x="${(W / 2).toFixed(1)}" y="18" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(opts.title)}</text>`);
  }
  const lineColor = 'var(--border-strong, #6b7280)';
  const surface = 'var(--surface, #fff)';
  const accent = 'var(--accent, #4f46e5)';

  interface Deco { x: number; y: number; ux: number; uy: number }
  /** Decorations sit ON the box edge; u points FROM the box ALONG the wire. */
  const drawDeco = (d: Deco, kind: TableEdge['head'] | TableEdge['tail']): void => {
    const { x, y, ux, uy } = d;
    const px2 = -uy;
    const py2 = ux;
    if (kind === 'crow-many' || kind === 'crow-one') {
      const sx2 = x - ux * 10;
      const sy2 = y - uy * 10;
      parts.push(
        `<path d="M ${sx2.toFixed(1)} ${sy2.toFixed(1)} L ${x.toFixed(1)} ${(y - 6 * Math.abs(px2)).toFixed(1)} M ${sx2.toFixed(1)} ${sy2.toFixed(1)} L ${x.toFixed(1)} ${(y + 6 * Math.abs(py2)).toFixed(1)} M ${sx2.toFixed(1)} ${sy2.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${lineColor}"/>`,
      );
      if (kind === 'crow-one') {
        parts.push(`<line x1="${sx2.toFixed(1)}" y1="${(sy2 - 6 * Math.abs(px2) - 6 * Math.abs(py2)).toFixed(1)}" x2="${sx2.toFixed(1)}" y2="${(sy2 + 6 * Math.abs(px2) + 6 * Math.abs(py2)).toFixed(1)}" stroke="${lineColor}"/>`);
      }
    } else if (kind === 'triangle') {
      parts.push(
        `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} L ${(x - ux * 12 + px2 * 7).toFixed(1)} ${(y - uy * 12 + py2 * 7).toFixed(1)} L ${(x - ux * 12 - px2 * 7).toFixed(1)} ${(y - uy * 12 - py2 * 7).toFixed(1)} z" fill="${surface}" stroke="${lineColor}"/>`,
      );
    } else if (kind === 'diamond-f' || kind === 'diamond-o') {
      const fill = kind === 'diamond-f' ? 'currentColor' : surface;
      parts.push(
        `<path d="M ${(x - ux * 14).toFixed(1)} ${(y - uy * 14).toFixed(1)} L ${(x - ux * 7 + px2 * 4.5).toFixed(1)} ${(y - uy * 7 + py2 * 4.5).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)} L ${(x - ux * 7 - px2 * 4.5).toFixed(1)} ${(y - uy * 7 - py2 * 4.5).toFixed(1)} z" fill="${fill}" stroke="${lineColor}"/>`,
      );
    } else if (kind === 'arrow') {
      parts.push(
        `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} L ${(x - ux * 9 + px2 * 5).toFixed(1)} ${(y - uy * 9 + py2 * 5).toFixed(1)} L ${(x - ux * 9 - px2 * 5).toFixed(1)} ${(y - uy * 9 - py2 * 5).toFixed(1)} z" fill="${lineColor}"/>`,
      );
    }
  };

  // edges under boxes — ONE orthogonal connector per relation, decorated once
  // per end based on which gap between the two boxes is widest.
  for (const e of g.edges) {
    const a = pos.get(e.from);
    const b = pos.get(e.to);
    if (!a || !b) continue;

    const gapR = b.x - b.w / 2 - (a.x + a.w / 2);
    const gapL = a.x - a.w / 2 - (b.x + b.w / 2);
    const gapD = b.y - b.h / 2 - (a.y + a.h / 2);
    const gapU = a.y - a.h / 2 - (b.y + b.h / 2);
    const best = Math.max(gapR, gapL, gapD, gapU);

    let d: string;
    let sDeco: Deco | null = null;
    let tDeco: Deco | null = null;
    let lx = 0;
    let ly = 0;

    if (best === gapR && gapR > 24) {
      const sx = a.x + a.w / 2, sy = a.y;
      const ex = b.x - b.w / 2, ey = b.y;
      const mx = (sx + ex) / 2;
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${mx.toFixed(1)} ${sy.toFixed(1)} L ${mx.toFixed(1)} ${ey.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      sDeco = { x: sx, y: sy, ux: 1, uy: 0 };
      tDeco = { x: ex, y: ey, ux: -1, uy: 0 };
      lx = mx; ly = sy - 10;
    } else if (best === gapL && gapL > 24) {
      const sx = a.x - a.w / 2, sy = a.y;
      const ex = b.x + b.w / 2, ey = b.y;
      const mx = (sx + ex) / 2;
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${mx.toFixed(1)} ${sy.toFixed(1)} L ${mx.toFixed(1)} ${ey.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      sDeco = { x: sx, y: sy, ux: -1, uy: 0 };
      tDeco = { x: ex, y: ey, ux: 1, uy: 0 };
      lx = mx; ly = sy - 10;
    } else if (best === gapD && gapD > 24) {
      const sx = a.x, sy = a.y + a.h / 2;
      const ex = b.x, ey = b.y - b.h / 2;
      const my2 = (sy + ey) / 2;
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${sx.toFixed(1)} ${my2.toFixed(1)} L ${ex.toFixed(1)} ${my2.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      sDeco = { x: sx, y: sy, ux: 0, uy: 1 };
      tDeco = { x: ex, y: ey, ux: 0, uy: -1 };
      lx = Math.max(sx, ex) + 8; ly = my2;
    } else {
      const sx = a.x, sy = a.y - a.h / 2;
      const ex = b.x, ey = b.y + b.h / 2;
      const my2 = (sy + ey) / 2;
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${sx.toFixed(1)} ${my2.toFixed(1)} L ${ex.toFixed(1)} ${my2.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      sDeco = { x: sx, y: sy, ux: 0, uy: -1 };
      tDeco = { x: ex, y: ey, ux: 0, uy: 1 };
      lx = Math.max(sx, ex) + 8; ly = my2;
    }

    parts.push(`<path d="${d}" fill="none" stroke="${lineColor}"${e.dotted ? ' stroke-dasharray="5 4"' : ''}/>`);
    if (sDeco) drawDeco(sDeco, e.tail);
    if (tDeco) drawDeco(tDeco, e.head);

    if (e.label) {
      const tw = e.label.length * 6.4 + 10;
      parts.push(
        `<rect x="${(lx - tw / 2).toFixed(1)}" y="${(ly - 9).toFixed(1)}" width="${tw.toFixed(0)}" height="18" rx="4" fill="${surface}" stroke="none"/>`,
        `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="currentColor">${escapeHtml(e.label)}</text>`,
      );
    }
  }

  // entity/class boxes
  for (const n of g.nodes) {
    const p = pos.get(n.id);
    if (!p) continue;
    const x = p.x - p.w / 2;
    const y = p.y - p.h / 2;
    const hdrH = 28;
    parts.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${p.w.toFixed(1)}" height="${p.h.toFixed(1)}" rx="7" fill="${surface}" stroke="${accent}" stroke-width="1.5"/>`,
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${p.w.toFixed(1)}" height="${hdrH}" rx="7" fill="var(--accent-soft, #eef)" stroke="${accent}" stroke-width="1.5"/>`,
      `<rect x="${x.toFixed(1)}" y="${(y + hdrH - 7).toFixed(1)}" width="${p.w.toFixed(1)}" height="7" fill="var(--accent-soft, #eef)" stroke="none"/>`,
      `<text x="${p.x.toFixed(1)}" y="${(y + 19).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${escapeHtml(n.title)}</text>`,
    );
    n.rows.forEach((r, i) => {
      parts.push(
        `<text x="${(x + 10).toFixed(1)}" y="${(y + hdrH + 16 + i * 17).toFixed(1)}" font-size="11.5" font-family="ui-monospace, monospace" fill="currentColor">${escapeHtml(r)}</text>`,
      );
    });
  }

  parts.push('</svg>');
  return parts.join('');
}

const CARD_RE = /^[|}o{]{2}$/;

const CROW_HEAD: Record<string, TableEdge['head']> = {
  '||': 'crow-one',
  'o|': 'crow-one',
  '}o': 'crow-many',
  '|{': 'crow-many',
  '}{': 'crow-many',
};

export function renderErDiagram(src: string): string | null {
  if (!/^\s*erDiagram\b/.test(src)) return null;
  const nodes = new Map<string, TableNode>();
  const edges: TableEdge[] = [];

  const node = (id: string): TableNode => {
    let n = nodes.get(id);
    if (!n) {
      n = { id, title: id, rows: [] };
      nodes.set(id, n);
    }
    return n;
  };

  let depth = 0;
  let curEntity: TableNode | null = null;
  for (let line of src.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('%%')) continue;
    if (/^erDiagram\b/.test(line)) continue;

    if (/^\w+\s*\{\s*$/.test(line)) {
      curEntity = node(line.replace(/\{.*$/, '').trim());
      depth++;
      continue;
    }
    if (depth > 0) {
      if (/^\}/.test(line)) { depth--; curEntity = null; continue; }
      curEntity?.rows.push(line);
      continue;
    }

    const m = /^(\w+)\s+([|}o{]{2})\s*--([|}o{]{2})\s+(\w+)\s*(?::\s*(.*))?$/.exec(line);
    if (m && CARD_RE.test(m[2]) && CARD_RE.test(m[3])) {
      node(m[1]);
      node(m[4]);
      edges.push({
        from: m[1],
        to: m[4],
        label: m[5]?.trim() || undefined,
        head: (CROW_HEAD[m[3]] ?? 'none') as TableEdge['head'],
        tail: (CROW_HEAD[m[2]] ?? 'none') as TableEdge['tail'],
        dotted: false,
      });
      continue;
    }
  }
  return renderTableSvg({ nodes: [...nodes.values()], edges });
}

// ---------------------------------------------------------------------------
// classDiagram
// ---------------------------------------------------------------------------

interface ClassRelSpec { head: TableEdge['head']; tail: TableEdge['tail']; dotted: boolean }

const CLASS_RELS: [RegExp, ClassRelSpec][] = [
  [/^<\|--$/, { head: 'triangle', tail: 'none', dotted: false }],
  [/^\.\.\|>$/, { head: 'triangle', tail: 'none', dotted: true }],
  [/^--\|>$/, { head: 'triangle', tail: 'none', dotted: false }],
  [/^\*--$/, { head: 'none', tail: 'diamond-f', dotted: false }],
  [/^--\*$/, { head: 'diamond-f', tail: 'none', dotted: false }],
  [/^o--$/, { head: 'none', tail: 'diamond-o', dotted: false }],
  [/^--o$/, { head: 'diamond-o', tail: 'none', dotted: false }],
  [/^\.\.>$/, { head: 'arrow', tail: 'none', dotted: true }],
  [/^-->$/, { head: 'arrow', tail: 'none', dotted: false }],
  [/^--$/, { head: 'none', tail: 'none', dotted: false }],
  [/^\.\.$/, { head: 'none', tail: 'none', dotted: true }],
];

export function renderClassDiagram(src: string): string | null {
  if (!/^\s*classDiagram\b/.test(src)) return null;
  const nodes = new Map<string, TableNode>();
  const edges: TableEdge[] = [];
  const generics = new Map<string, string>(); // id -> "~T" annotation

  const node = (rawId: string): TableNode => {
    let title = rawId;
    const gm = /^([\w-]+)(~.+~)$/.exec(rawId);
    if (gm) {
      title = `${gm[1]}${gm[2]}`;
      rawId = gm[1];
    }
    let n = nodes.get(rawId);
    if (!n) {
      n = { id: rawId, title, rows: [] };
      nodes.set(rawId, n);
    }
    return n;
  };

  let depth = 0;
  let curClass: TableNode | null = null;
  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^classDiagram\b/.test(line)) continue;
    if (/^(namespace\s|direction\b)/.test(line)) continue;

    if (/\{\s*$/.test(line)) {
      // `class Note {` / `interface Foo {` — strip the keyword so the node id
      // matches the one used in relation lines (otherwise we'd get duplicates)
      const body = line.replace(/\{[\s\S]*$/, '').replace(/^(class|interface)\s+/i, '').trim();
      curClass = node(body);
      depth++;
      continue;
    }
    if (depth > 0) {
      if (/^\}/.test(line)) { depth--; curClass = null; continue; }
      const mm = /^([+#~-])?\s*(.*)$/.exec(line);
      curClass?.rows.push(`${mm?.[1] ?? ''}${mm?.[2] ?? ''}`.replace(/returns?$|Return(s)?$/i, ''));
      continue;
    }

    let m = /^class\s+(.+?)\s*$/.exec(line);
    if (m && !m[1].includes('--') && !m[1].includes('<|--')) {
      const n = node(m[1]);
      void n;
      continue;
    }

    m = /^(\S+)\s*(<\|--|\.\.\|>|--\|>|\*--|--\*|o--|--o|\.\.>|-->|--|\.\.)\s*(\S+)\s*(?::\s*(.*))?$/.exec(line);
    if (m) {
      const spec = CLASS_RELS.find(([re]) => re.test(m![2]))?.[1] ?? { head: 'arrow' as const, tail: 'none' as const, dotted: false };
      node(m[1]);
      node(m[3]);
      edges.push({
        from: m[1].replace(/~.*~/, ''),
        to: m[3].replace(/~.*~/, ''),
        label: m[4]?.trim() || undefined,
        head: spec.head,
        tail: spec.tail,
        dotted: spec.dotted,
      });
      continue;
    }

    m = /^(\S+)\s*:\s*(.+)$/.exec(line);
    if (m) {
      const n = node(m[1]);
      n.rows.push(m[2].trim());
      continue;
    }
  }
  void generics;
  return renderTableSvg({ nodes: [...nodes.values()], edges });
}
