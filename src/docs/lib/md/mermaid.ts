/**
 * Minimal Mermaid `graph`/`flowchart` renderer → inline SVG. Pure TS.
 *
 * Supports the common subset: direction headers (TB/TD, BT, LR, RL), node
 * definitions with shapes ([rect], (rounded), ([stadium]), ((circle)),
 * {diamond}, [[sub]]), edge styles (--> , ---, -.-> , ==>), edge labels
 * (`A -->|lbl| B` and `A -- lbl --> B`), chained statements, comments (%%)
 * and semicolon separators. Unsupported constructs (subgraph styling,
 * classDefs, themes…) are skipped gracefully; unparseable input yields null
 * so callers can show the raw source instead.
 */

import { escapeHtml } from './inline.js';
import { renderSequenceSvg, renderPieSvg, renderStateSvg, renderGanttSvg } from './mermaid-diagrams.js';
import { renderErDiagram, renderClassDiagram } from './mermaid-tables.js';
import { renderGitSvg, renderMindmapSvg } from './mermaid-git.js';
import { renderJourneySvg, renderQuadrantSvg, renderTimelineSvg, renderC4Svg, renderSankeySvg, renderXychartSvg } from './mermaid-misc.js';

export interface MermaidNode {
  id: string;
  label: string;
  shape: 'rect' | 'round' | 'stadium' | 'circle' | 'diamond' | 'sub' | 'start' | 'end' | 'fork' | 'join';
}

export interface MermaidEdge {
  from: string;
  to: string;
  label?: string;
  style: 'normal' | 'dotted' | 'thick';
  arrow: boolean;
}

export interface MermaidGraph {
  direction: 'TB' | 'BT' | 'LR' | 'RL';
  nodes: MermaidNode[];
  edges: MermaidEdge[];
}

const OPENERS: [string, string, MermaidNode['shape']][] = [
  ['((', '))', 'circle'],
  ['([', '])', 'stadium'],
  ['[[', ']]', 'sub'],
  ['(', ')', 'round'],
  ['{', '}', 'diamond'],
  ['[', ']', 'rect'],
];

/** Parse a mermaid flowchart. Returns null when the input is not one. */
export function parseMermaid(src: string): MermaidGraph | null {
  const lines = src.split('\n').map((l) => l.trim());
  const headerIdx = lines.findIndex((l) => /^(graph|flowchart)\b/.test(l));
  if (headerIdx === -1) return null;
  const hm = /^(?:graph|flowchart)\s+(TB|TD|BT|LR|RL)\s*;?\s*(.*)$/.exec(lines[headerIdx]);
  if (!hm) return null;
  const dirRaw = hm[1];
  const direction = (dirRaw === 'TD' ? 'TB' : dirRaw) as MermaidGraph['direction'];

  const bodyLines: string[] = [];
  const rest0 = hm[2].trim(); // statements sharing the header line
  if (rest0) bodyLines.push(rest0.replace(/;+\s*$/, ''));
  lines.forEach((t, idx) => {
    if (idx === headerIdx) return;
    if (!t || t.startsWith('%%')) return;
    if (/^(subgraph|end|classDef|class\s|style\s|click\s|linkStyle\s|direction\s)/i.test(t)) return;
    bodyLines.push(t.replace(/;+\s*$/, ''));
  });

  const nodes = new Map<string, MermaidNode>();
  const edges: MermaidEdge[] = [];
  // pre-scan subgraph declarations so edges can reference them as pseudo-nodes
  const sgTitles = new Map<string, string>();
  for (const t of lines) {
    const sm = /^subgraph\s+([A-Za-z_][\w.-]*)(?:\s+\[(.*?)\])?\s*;?\s*$/i.exec(t)
            ?? /^subgraph\s+\[(.*?)\]\s*;?\s*$/i.exec(t);
    if (sm) sgTitles.set(sm[1] ?? '', (sm[2] ?? sm[1] ?? '').trim());
  }

  const getNode = (id: string, label?: string, shape?: MermaidNode['shape']): MermaidNode => {
    let n = nodes.get(id);
    if (!n) {
      n = { id, label: label ?? id, shape: shape ?? 'rect' };
      nodes.set(id, n);
    } else if (label !== undefined || shape !== undefined) {
      if (shape) n.shape = shape;
      if (label !== undefined && (n.label === n.id || label !== '')) n.label = label || n.label;
    }
    return n;
  };

  for (const stmtRaw of bodyLines.flatMap((l) => l.split(';'))) {
    const stmt = stmtRaw.trim();
    if (!stmt) continue;

    // tokenize with `&` endpoint chaining:
    //   a & b --> c      edges a→c, b→c
    //   a --> b & c      edges a→b, a→c
    //   a --> b & c --> d edges a→b, a→c, b→d, c→d
    let rest = stmt.trim();
    const arrowRe = /^(-->|-\.->|==>|---)(?:\|([^|]*)\|)?/;
    interface Pending { style: MermaidEdge['style']; arrow: boolean; label?: string; len: number }
    let pending: Pending | null = null;
    let origin: string[] = [];   // sources of the pending arrow
    let current: string[] = [];  // most recent endpoints
    let expectingNode = true;    // next token should be a node
    let joinSrc = false;         // '&' before an arrow → extra source
    let justArrow = false;       // an arrow's edges were just completed
    let dupTgt = false;          // '&' after an arrow → duplicate targets

    const pushEdge = (fromId: string, toId: string, spec: Pending): void => {
      edges.push({ from: fromId, to: toId, label: spec.label || undefined, style: spec.style, arrow: spec.arrow });
    };

    /** Read one arrow at the front of `rest`: plain forms, pipe labels and
     *  spaced labels (`-- text -->`, `-. text .->`, `== text ==>`). */
    const readArrowAt = (r0: string): Pending | null => {
      let m = /^(-->|-\.->|==>)(?:\|([^|]*)\|)?/.exec(r0);
      if (m) {
        return {
          len: m[0].length,
          style: m[1].includes('.') ? 'dotted' : m[1].startsWith('==') ? 'thick' : 'normal',
          arrow: true,
          label: m[2]?.trim(),
        };
      }
      m = /^(---)(?:\|([^|]*)\|)?/.exec(r0);
      if (m) {
        return { len: m[0].length, style: 'normal', arrow: false, label: m[2]?.trim() };
      }
      m = /^--\s*([^-\n>][^>\n]*?)?\s*-->/.exec(r0);
      if (m) return { style: 'normal', arrow: true, label: m[1]?.trim(), len: m[0].length };
      m = /^-\.\s*([^-.\n>][^>\n]*?)?\s*\.->/.exec(r0);
      if (m) return { style: 'dotted', arrow: true, label: m[1]?.trim(), len: m[0].length };
      m = /^==\s*([^=\n>][^>\n]*?)?\s*==>/.exec(r0);
      if (m) return { style: 'thick', arrow: true, label: m[1]?.trim(), len: m[0].length };
      return null;
    };

    while (rest.length > 0) {
      rest = rest.replace(/^\s+/, '');
      if (rest.length === 0) break;

      if (!joinSrc && !dupTgt && !expectingNode) {
        const spec = readArrowAt(rest);
        if (spec) {
          origin = [...current];
          current = [];
          dupTgt = false;
          joinSrc = false;
          expectingNode = true;
          pending = spec;
          rest = rest.slice(spec.len);
          continue;
        }
      }

      if (/^&/.test(rest)) {
        rest = rest.slice(1).replace(/^\s+/, '');
        if (pending || !justArrow) {
          joinSrc = true; // extra source joins the current endpoint set
          expectingNode = true;
        } else {
          dupTgt = true; // duplicate the last arrow's targets
          expectingNode = true;
        }
        continue;
      }

      const res = consumeNode(rest, getNode, nodes);
      if (!res) break;
      const nid = res.id;
      rest = res.rest;

      if (pending) {
        for (const fromId of joinSrc ? current : origin.length ? origin : current) {
          pushEdge(fromId, nid, pending);
        }
        pending = null;
        current = [nid];
        joinSrc = false;
        dupTgt = false;
        justArrow = true;
      } else if (dupTgt && origin.length > 0) {
        for (const fromId of origin) pushEdge(fromId, nid, pending ?? { style: 'normal', arrow: true, len: 0 });
        current.push(nid);
        dupTgt = false;
      } else if (joinSrc) {
        justArrow = false;
        current.push(nid);
        joinSrc = false;
      } else {
        current = [nid];
      }
      expectingNode = false;
      // allow 'a --> b & c': after target node, a following '&' sets dupTgt next pass
    }
  }

  if (nodes.size === 0) return null;
  return { direction, nodes: [...nodes.values()], edges };
}


/** Read one node token (id + optional shape) from the front of `rest`. */
function consumeNode(
  rest: string,
  getNode: (id: string, label?: string, shape?: MermaidNode['shape']) => MermaidNode,
  _nodes: Map<string, MermaidNode>,
): { id: string; rest: string } | null {
  const idm = /^[A-Za-z_][\w]*(?:[.-][\w]+)*/.exec(rest);
  if (!idm) return null;
  let pos = idm[0].length;
  const id = idm[0];

  for (const [open, close, shape] of OPENERS) {
    if (rest.startsWith(open, pos)) {
      const depthScanFrom = pos + open.length;
      let depth = 1;
      let end = -1;
      for (let i = depthScanFrom; i < rest.length; i++) {
        if (rest.startsWith(open, i)) depth++;
        else if (rest.startsWith(close, i)) {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      }
      if (end === -1) return { id, rest: rest.slice(pos) };
      let label = rest.slice(pos + open.length, end).trim();
      if (/^".*"$/.test(label)) label = label.slice(1, -1);
      label = label.replace(/^["']|["']$/g, '').replace(/[``]/g, '').replace(/<br\s*\/?>/gi, ' ');
      getNode(id, label || id, shape);
      return { id, rest: rest.slice(end + close.length) };
    }
  }

  getNode(id);
  return { id, rest: rest.slice(pos) };
}

// ---------------------------------------------------------------------------
// layout + SVG
// ---------------------------------------------------------------------------

const NODE_W_MIN = 64;

const hhOf = (shape: MermaidNode['shape']): number => (shape === 'fork' || shape === 'join' ? 7 : NODE_H / 2);
const NODE_H = 40;
const CHAR_W = 7.2;
const GAP_X = 56;
const GAP_Y = 76;
const PAD = 24;

/** Layered layout: level = longest path from a root; cycle-tolerant. */
export function layoutGraph(g: MermaidGraph): { pos: Map<string, { x: number; y: number; w: number }>; width: number; height: number } {
  const ids = g.nodes.map((n) => n.id);
  const nodeById = new Map(g.nodes.map((n) => [n.id, n]));
  const incoming = new Map<string, string[]>(ids.map((id) => [id, []]));
  const outgoing = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const e of g.edges) {
    if (!nodeById.has(e.from) || !nodeById.has(e.to)) continue;
    outgoing.get(e.from)!.push(e.to);
    incoming.get(e.to)!.push(e.from);
  }

  // longest-path leveling: detect back edges (cycles) first, then relax
  // levels only along forward edges so feedback loops don't inflate rows.
  const backEdges = new Set<string>();
  {
    const color = new Map<string, number>(ids.map((id) => [id, 0])); // 0=new 1=active 2=done
    const visit = (v: string): void => {
      color.set(v, 1);
      for (const w of outgoing.get(v) ?? []) {
        if (!nodeById.has(w)) continue;
        const c = color.get(w) ?? 0;
        if (c === 1) backEdges.add(`${v}->${w}`); // cycle
        else if (c === 0) visit(w);
      }
      color.set(v, 2);
    };
    for (const id of ids) if ((color.get(id) ?? 0) === 0) visit(id);
  }

  const level = new Map<string, number>(ids.map((id) => [id, 0]));
  for (let pass = 0; pass < ids.length; pass++) {
    let changed = false;
    for (const e of g.edges) {
      if (!nodeById.has(e.from) || !nodeById.has(e.to)) continue;
      if (backEdges.has(`${e.from}->${e.to}`)) continue; // ignore feedback loops
      const want = (level.get(e.from) ?? 0) + 1;
      if (want > (level.get(e.to) ?? 0)) {
        level.set(e.to, want);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const horizontal = g.direction === 'LR' || g.direction === 'RL';
  const rows = new Map<number, string[]>();
  for (const id of ids) {
    const l = Math.min(level.get(id) ?? 0, ids.length - 1);
    if (!rows.has(l)) rows.set(l, []);
    rows.get(l)!.push(id);
  }

  const pos = new Map<string, { x: number; y: number; w: number }>();
  const widthOf = (n: MermaidNode) =>
    n.shape === 'start' || n.shape === 'end'
      ? 40
      : n.shape === 'fork' || n.shape === 'join'
        ? 120
        : Math.max(NODE_W_MIN, Math.min(220, n.label.length * CHAR_W + 28));
  const hOf = (n: MermaidNode): number => (n.shape === 'fork' || n.shape === 'join' ? 12 : NODE_H);

  const maxLevel = Math.max(...rows.keys(), 0);

  if (horizontal) {
    // levels flow left→right (or right→left); nodes inside a level stack vertically
    const colW: number[] = [];
    let totalH = 0;
    for (let l = 0; l <= maxLevel; l++) {
      const row = rows.get(l) ?? [];
      colW.push(Math.max(...row.map((id) => widthOf(nodeById.get(id)!)), NODE_W_MIN));
      totalH = Math.max(totalH, row.length * (NODE_H + GAP_Y) - GAP_Y);
    }
    const cum: number[] = [];
    let run = 0;
    for (let l = 0; l <= maxLevel; l++) { cum.push(run); run += colW[l] + GAP_X; }
    const width = run - GAP_X;
    const height = totalH;
    for (let l = 0; l <= maxLevel; l++) {
      const row = rows.get(l) ?? [];
      const accY = (totalH - (row.length * (NODE_H + GAP_Y) - GAP_Y)) / 2;
      row.forEach((id, i) => {
        const cxCol = cum[l] + colW[l] / 2;
        const cy = accY + i * (NODE_H + GAP_Y) + NODE_H / 2;
        pos.set(id, g.direction === 'LR'
          ? { x: cxCol, y: cy, w: widthOf(nodeById.get(id)!) }
          : { x: width - cxCol, y: cy, w: widthOf(nodeById.get(id)!) });
      });
    }
    return { pos, width, height };
  }

  // vertical layouts (TB/TD/BT): levels are rows
  const crossSize = Math.max(
    ...[...rows.values()].map((row) => row.reduce((s, id) => s + widthOf(nodeById.get(id)!) + GAP_X, -GAP_X)),
    NODE_W_MIN,
  );
  const depthSize = (maxLevel + 1) * (NODE_H + GAP_Y) - GAP_Y;
  for (const [l, row] of rows) {
    let acc = (crossSize - (row.reduce((s, id) => s + widthOf(nodeById.get(id)!) + GAP_X, -GAP_X))) / 2;
    const y = l * (NODE_H + GAP_Y) + NODE_H / 2;
    for (const id of row) {
      const w = widthOf(nodeById.get(id)!);
      const x = acc + w / 2;
      pos.set(id, g.direction === 'BT' ? { x, y: depthSize - y, w } : { x, y, w });
      acc += w + GAP_X;
    }
  }
  return { pos, width: crossSize, height: depthSize };
}

/** Render a parsed flowchart graph to SVG (shared with other diagram families). */
export interface GraphStyleOptions {
  title?: string;
  nodeStyles?: Map<string, Record<string, string>>;
  groups?: { title: string; members: string[]; style?: Record<string, string> }[];
  /** Per-edge style overrides indexed by order of appearance ('default' key applies to all). */
  edgeStyles?: Map<number | 'default', Record<string, string>>;
  theme?: string;
}

export function renderGraphSvg(
  g: MermaidGraph,
  opts?: GraphStyleOptions,
): string {
  const { pos, width, height } = layoutGraph(g);

  // detect back edges early so the canvas reserves side channels for them
  const nodeById2 = new Map(g.nodes.map((n) => [n.id, n]));
  const lvl0 = new Map<string, number>(g.nodes.map((n) => [n.id, 0]));
  {
    const out2 = new Map<string, string[]>(g.nodes.map((n) => [n.id, []]));
    for (const e of g.edges) if (nodeById2.has(e.from) && nodeById2.has(e.to)) out2.get(e.from)!.push(e.to);
    const backSet = new Set<string>();
    const colr = new Map<string, number>(g.nodes.map((n) => [n.id, 0]));
    const vis = (v: string): void => {
      colr.set(v, 1);
      for (const w of out2.get(v) ?? []) {
        const c = colr.get(w) ?? 0;
        if (c === 1) backSet.add(`${v}->${w}`);
        else if (c === 0) vis(w);
      }
      colr.set(v, 2);
    };
    for (const n of g.nodes) if ((colr.get(n.id) ?? 0) === 0) vis(n.id);
    for (let pass = 0; pass < g.nodes.length; pass++) {
      let changed = false;
      for (const e of g.edges) {
        if (!nodeById2.has(e.from) || !nodeById2.has(e.to)) continue;
        if (backSet.has(`${e.from}->${e.to}`)) continue;
        const want = (lvl0.get(e.from) ?? 0) + 1;
        if (want > (lvl0.get(e.to) ?? 0)) { lvl0.set(e.to, want); changed = true; }
      }
      if (!changed) break;
    }
  }
  let backLeft = false;
  let backRight = false;
  for (const e of g.edges) {
    if (!nodeById2.has(e.from) || !nodeById2.has(e.to)) continue;
    if (e.from === e.to) continue;
    if ((lvl0.get(e.to) ?? 0) <= (lvl0.get(e.from) ?? 0)) {
      const aP = pos.get(e.from)!;
      if (aP.x >= width / 2) backRight = true; else backLeft = true;
    }
  }

  const horizontal = g.direction === 'LR' || g.direction === 'RL';
  const padL = PAD + (backLeft ? 34 : 0);
  const padR = PAD + (backRight ? 34 : 0);
  const padT = PAD + (opts?.groups?.length ? 28 : 0); // room for subgraph title chips
  const W = width + padL + padR;
  const H = height + padT + PAD + (horizontal && backLeft ? 30 : 0) + (horizontal && backRight ? 30 : 0);

  const px = (id: string) => {
    const p = pos.get(id);
    if (!p) return null;
    const shape = g.nodes.find((n) => n.id === id)?.shape ?? 'rect';
    return { cx: p.x + padL, cy: p.y + padT, w: p.w, h: hhOf(shape) * 2 };
  };

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}" class="mermaid-svg"${opts?.theme ? ` data-theme="${quoteAttrId(opts.theme)}"` : ''} role="img" aria-label="diagram">`,
  );
  if (opts?.title) {
    parts.push(`<text x="${(W / 2).toFixed(1)}" y="20" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(opts.title)}</text>`);
  }
  parts.push(
    '<defs><marker id="ma" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>',
  );

  // subgraph group boxes behind everything
  for (const grp of opts?.groups ?? []) {
    const memberPos = grp.members.map((mid) => px(mid)).filter(Boolean) as { cx: number; cy: number; w: number; h: number }[];
    if (memberPos.length === 0) continue;
    const x1 = Math.min(...memberPos.map((m) => m.cx - m.w / 2)) - 18;
    const y1 = Math.min(...memberPos.map((m) => m.cy - m.h / 2)) - 26;
    const x2 = Math.max(...memberPos.map((m) => m.cx + m.w / 2)) + 18;
    const y2 = Math.max(...memberPos.map((m) => m.cy + m.h / 2)) + 14;
    const gs = grp.style ?? {};
    const gFill = sanitizeColor(gs.fill) ?? 'var(--accent-soft, #eef)';
    const gStroke = sanitizeColor(gs.stroke) ?? 'var(--border, #ccc)';
    const gDash = gs['stroke-dasharray'] && /^[\w\s,.%-]+$/.test(gs['stroke-dasharray']) ? ` stroke-dasharray="${gs['stroke-dasharray']}"` : ' stroke-dasharray="6 4"';
    parts.push(
      `<rect x="${x1.toFixed(1)}" y="${y1.toFixed(1)}" width="${(x2 - x1).toFixed(1)}" height="${(y2 - y1).toFixed(1)}" rx="8" fill="${gFill}" stroke="${gStroke}"${gDash}/>`,
    );
    if (grp.title) {
      parts.push(
        `<text x="${(x1 + 10).toFixed(1)}" y="${(y1 + 16).toFixed(1)}" font-size="12" font-weight="600" fill="currentColor">${escapeHtml(grp.title)}</text>`,
      );
    }
  }

  // edges first (under the nodes)
  const lvl = lvl0;
  const backSet = new Set<string>();
  for (const e of g.edges) {
    if (!nodeById2.has(e.from) || !nodeById2.has(e.to)) continue;
    if ((lvl0.get(e.to) ?? 0) <= (lvl0.get(e.from) ?? 0)) backSet.add(`${e.from}->${e.to}`);
  }

  // degree bookkeeping: fan out multiple branches from one node instead of
  // stacking them on a single anchor point
  const outDeg = new Map<string, number>();
  const inDeg = new Map<string, number>();
  for (const e of g.edges) {
    if (!nodeById2.has(e.from) || !nodeById2.has(e.to)) continue;
    outDeg.set(e.from, (outDeg.get(e.from) ?? 0) + 1);
    inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1);
  }
  const outSeen = new Map<string, number>();
  const inSeen = new Map<string, number>();
  /** spread anchor along the node edge when several branches share it */
  const spread = (w: number, i: number, n: number): number =>
    n <= 1 ? 0 : ((i / (n - 1)) - 0.5) * w * 0.72;

  let edgeIndex = -1;
  for (const e of g.edges) {
    edgeIndex++;
    const a = px(e.from);
    const b = px(e.to);
    if (!a || !b) continue;
    let dash = e.style === 'dotted' ? ' stroke-dasharray="4 4"' : '';
    let sw = e.style === 'thick' ? ' stroke-width="2.4"' : '';
    let color = 'var(--border-strong, #6b7280)';
    if (opts?.edgeStyles) {
      const es = opts.edgeStyles.get(edgeIndex) ?? opts.edgeStyles.get('default');
      if (es) {
        color = sanitizeColor(es.stroke) ?? color;
        if (es['stroke-width'] && /^[\d.]+(px)?$/.test(es['stroke-width'])) sw = ` stroke-width="${parseFloat(es['stroke-width'])}"`;
        if (es['stroke-dasharray'] && /^[\w\s,.%-]+$/.test(es['stroke-dasharray'])) dash = ` stroke-dasharray="${es['stroke-dasharray']}"`;
      }
    }

    const oi = outSeen.get(e.from) ?? 0;
    outSeen.set(e.from, oi + 1);
    const outTotal = outDeg.get(e.from) ?? 1;
    const ii = inSeen.get(e.to) ?? 0;
    inSeen.set(e.to, ii + 1);
    const inTotal = inDeg.get(e.to) ?? 1;

    const fromShape = nodeById2.get(e.from)?.shape ?? 'rect';
    const toShape = nodeById2.get(e.to)?.shape ?? 'rect';
    const ah = hhOf(fromShape);
    const bh = hhOf(toShape);

    const isBack = e.from !== e.to && (lvl.get(e.to) ?? 0) <= (lvl.get(e.from) ?? 0);

    let d: string;
    let lx: number;
    let ly: number;

    if (isBack) {
      // route around the outside so feedback loops never cross other nodes
      const rightSide = a.cx >= width / 2;
      const chx = rightSide ? W - padR + 17 : padL - 17;
      if (horizontal) {
        // vertical channel above/below the whole diagram
        const ahH = hhOf(fromShape);
        const bhH = hhOf(toShape);
        const yCh = a.cy >= height / 2 ? height + 24 : PAD - 18;
        d = `M ${a.cx.toFixed(1)} ${(a.cy + ahH).toFixed(1)} L ${a.cx.toFixed(1)} ${yCh.toFixed(1)} L ${b.cx.toFixed(1)} ${yCh.toFixed(1)} L ${b.cx.toFixed(1)} ${(b.cy + bhH).toFixed(1)}`;
        lx = b.cx;
        ly = yCh - 8;
      } else {
        // TD: horizontal channel on the outer side
        const sx0 = rightSide ? a.cx + a.w / 2 : a.cx - a.w / 2;
        const ex0 = rightSide ? b.cx + b.w / 2 : b.cx - b.w / 2;
        d = `M ${sx0.toFixed(1)} ${a.cy.toFixed(1)} L ${chx.toFixed(1)} ${a.cy.toFixed(1)} L ${chx.toFixed(1)} ${b.cy.toFixed(1)} L ${ex0.toFixed(1)} ${b.cy.toFixed(1)}`;
        lx = chx + (rightSide ? -8 : 8);
        ly = (a.cy + b.cy) / 2;
      }
    } else if (horizontal) {
      // elbow x must sit in the GAP BETWEEN the two columns — averaging the
      // y-coords here made wires double back through their own source boxes.
      const sx = a.cx + a.w / 2;
      const ex = Math.max(b.cx - b.w / 2, sx + 16);
      const sy = a.cy + spread(a.h, oi, outTotal);
      const ey = b.cy + spread(b.h, ii, inTotal);
      const mxx = (sx + ex) / 2;
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${mxx.toFixed(1)} ${sy.toFixed(1)} L ${mxx.toFixed(1)} ${ey.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      lx = mxx;
      ly = sy;
    } else {
      const sy = a.cy + ah;
      const ey = b.cy - bh;
      const sx = a.cx + spread(a.w, oi, outTotal);
      const ex = b.cx + spread(b.w, ii, inTotal);
      const my = (sy + ey) / 2;
      d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${sx.toFixed(1)} ${my.toFixed(1)} L ${ex.toFixed(1)} ${my.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      lx = sx;
      ly = my;
    }

    parts.push(`<path d="${d}" fill="none" stroke="${color}"${dash}${sw}${e.arrow ? ' marker-end="url(#ma)"' : ''}/>`);
    if (e.label) {
      const tw = e.label.length * 6.4 + 10;
      parts.push(
        `<rect x="${(lx - tw / 2).toFixed(1)}" y="${(ly - 9).toFixed(1)}" width="${tw.toFixed(0)}" height="18" rx="4" fill="var(--surface, #fff)" stroke="none"/>`,
        `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="currentColor">${escapeHtml(e.label)}</text>`,
      );
    }
  }

  // nodes
  for (const n of g.nodes) {
    const p = px(n.id);
    if (!p) continue;
    const x = p.cx - p.w / 2;
    const y = p.cy - NODE_H / 2;
    const st = opts?.nodeStyles?.get(n.id);
    const sv = (k: string, dflt: string): string => sanitizeColor(st?.[k]) ?? dflt;
    const common =
      `fill="${sv('fill', 'var(--surface, #fff)')}" stroke="${sv('stroke', 'var(--accent, #4f46e5)')}"` +
      ` stroke-width="${st?.['stroke-width'] && /^[\d.]+(px)?$/.test(st['stroke-width']) ? parseFloat(st['stroke-width']) : 1.6}"`;
    const textColor = sanitizeColor(st?.['color']) ?? 'currentColor';
    switch (n.shape) {
      case 'round':
        parts.push(`<rect x="${x.toFixed(1)}" y="${y}" width="${p.w.toFixed(1)}" height="${NODE_H}" rx="${NODE_H / 2 - 6}" ${common}/>`);
        break;
      case 'stadium':
        parts.push(`<rect x="${x.toFixed(1)}" y="${y}" width="${p.w.toFixed(1)}" height="${NODE_H}" rx="${NODE_H / 2}" ${common}/>`);
        break;
      case 'circle': {
        const r = Math.max(NODE_H, p.w) / 2;
        parts.push(`<circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="${r}" ${common}/>`);
        break;
      }
      case 'diamond': {
        const dw = Math.max(p.w * 1.35, 90);
        const dh = NODE_H * 1.6;
        parts.push(
          `<path d="M ${p.cx} ${p.cy - dh / 2} L ${p.cx + dw / 2} ${p.cy} L ${p.cx} ${p.cy + dh / 2} L ${p.cx - dw / 2} ${p.cy} z" ${common}/>`,
        );
        break;
      }
      case 'fork':
      case 'join':
        parts.push(`<rect x="${(p.cx - p.w / 2).toFixed(1)}" y="${(p.cy - 6).toFixed(1)}" width="${p.w.toFixed(1)}" height="12" rx="3" ${common}/>`);
        break;
      case 'start':
        parts.push(`<circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="9" fill="currentColor" stroke="none"/>`);
        break;
      case 'end':
        parts.push(`<circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="11" fill="none" stroke="currentColor" stroke-width="1.6"/>`);
        parts.push(`<circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="6" fill="currentColor" stroke="none"/>`);
        break;
      case 'sub':
        parts.push(`<rect x="${x.toFixed(1)}" y="${y}" width="${p.w.toFixed(1)}" height="${NODE_H}" rx="3" ${common}/>`);
        parts.push(
          `<line x1="${x.toFixed(1)}" y1="${y + 7}" x2="${(x + p.w).toFixed(1)}" y2="${y + 7}" stroke="${sv('stroke', 'var(--accent, #4f46e5)')}" stroke-width="1"/>`,
        );
        break;
      default:
        parts.push(`<rect x="${x.toFixed(1)}" y="${y}" width="${p.w.toFixed(1)}" height="${NODE_H}" rx="6" ${common}/>`);
    }
    parts.push(
      `<text x="${p.cx.toFixed(1)}" y="${(p.cy + 4.5).toFixed(1)}" text-anchor="middle" font-size="13" fill="${textColor}">${escapeHtml(n.label)}</text>`,
    );
  }

  parts.push('</svg>');
  return parts.join('');
}


/** Attribute-safe escaping. */
function quoteAttrId(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Allow-list for CSS values coming from classDef/style directives. */
function sanitizeColor(v: string | undefined): string | null {
  if (!v) return null;
  return /^[#\w(),.%\s-]{1,40}$/.test(v.trim()) ? v.trim() : null;
}

/** Parse `prop:value, prop:value` lists from classDef/style statements. */
export function parseStyleProps(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  let depth = 0;
  let cur = '';
  const parts: string[] = [];
  for (const ch of raw) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  for (const part of parts) {
    const i = part.indexOf(':');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

/** Full pipeline: mermaid source → SVG markup. Null when unsupported. */
/**
 * Strip mermaid YAML frontmatter (a leading `---` block, as on
 * mermaid.js.org). Returns the body plus a flat view of the metadata where
 * nested keys are dotted (`config.theme` → `config.theme`). Unknown keys are
 * preserved so diagrams stay forward-compatible.
 */
export function extractDiagramFrontmatter(src: string): { fm: Record<string, string>; body: string } {
  const lines = src.split('\n');
  if (!/^---\s*$/.test(lines[0] ?? '')) return { fm: {}, body: src };
  let close = -1;
  for (let i = 1; i < lines.length && i < 60; i++) {
    if (/^---\s*$|^\.\.\.\s*$/.test(lines[i])) { close = i; break; }
  }
  if (close === -1) return { fm: {}, body: src };

  const fm: Record<string, string> = {};
  const stack: { indent: number; path: string }[] = [];
  for (let i = 1; i < close; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const kv = /^(\s*)([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(raw);
    if (!kv) continue;
    const indent = kv[1].length;
    const key = kv[2];
    const value = kv[3].trim().replace(/^["']|["']$/g, '');
    while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
    const path = stack.length ? `${stack[stack.length - 1].path}.${key}` : key;
    if (value !== '') fm[path] = value;
    stack.push({ indent, path });
  }
  return { fm, body: lines.slice(close + 1).join('\n') };
}

/** Families whose renderer understands a plain `title …` statement. */
const TITLE_STATEMENT_RE =
  /^(sequenceDiagram|gantt|journey|quadrantChart|timeline|pie|stateDiagram(-v2)?|C4(Context|Container|Component|Dynamic)|xychart(-beta)?)\b/;

export function renderMermaidSvg(src: string): string | null {
  // mermaid frontmatter: `title` becomes a title statement (for families that
  // support one), `config.*` is read (theme applied where supported),
  // everything else tolerated.
  const { fm, body: fmBody } = extractDiagramFrontmatter(src);
  const theme = fm['config.theme'] ?? fm['config.config.theme'];
  let body = fmBody;
  const noInlineTitle = /^sequenceDiagram|^stateDiagram(-v2)?\b/.test(body.trim());
  if (fm.title && TITLE_STATEMENT_RE.test(body.trim()) && (noInlineTitle || !/^title\s/m.test(body))) {
    const ls = body.split('\n');
    const hi = ls.findIndex((l) => l.trim() !== ''); // header line
    if (hi >= 0) ls.splice(hi + 1, 0, `title ${fm.title}`);
    else ls.push(`title ${fm.title}`);
    body = ls.join('\n');
  }
  src = body;

  const t = src.trim();
  if (/^sequenceDiagram\b/.test(t)) return renderSequenceSvg(src);
  if (/^pie\b/.test(t)) return renderPieSvg(src);
  if (/^stateDiagram(-v2)?\b/.test(t)) return renderStateSvg(src);
  if (/^gantt\b/.test(t)) return renderGanttSvg(src);
  if (/^erDiagram\b/.test(t)) return renderErDiagram(src);
  if (/^classDiagram\b/.test(t)) return renderClassDiagram(src);
  if (/^gitGraph\b/.test(t)) return renderGitSvg(src);
  if (/^mindmap\b/.test(t)) return renderMindmapSvg(src);
  if (/^journey\b/.test(t)) return renderJourneySvg(src);
  if (/^quadrantChart\b/.test(t)) return renderQuadrantSvg(src);
  if (/^timeline\b/.test(t)) return renderTimelineSvg(src);
  if (/^C4(Context|Container|Component|Dynamic)\b/.test(t)) return renderC4Svg(src);
  if (/^sankey(-beta)?\b/.test(t)) return renderSankeySvg(src);
  if (/^xychart(-beta)?\b/.test(t)) return renderXychartSvg(src);
  const g = parseMermaid(src);
  if (!g) return null;

  // flowchart extras: subgraphs + classDef/class/style directives
  const groups: { title: string; members: string[]; style?: Record<string, string> }[] = [];
  const groupIds = new Map<string, number>(); // subgraph id -> index in groups
  const nodeStyles = new Map<string, Record<string, string>>();
  const classDefs = new Map<string, Record<string, string>>();
  const edgeStyles = new Map<number | 'default', Record<string, string>>();
  let currentGroup: { id: string; title: string; members: string[] } | null = null;

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+\s*$/, '');
    if (!line || line.startsWith('%%')) continue;

    let m = /^subgraph\s+([A-Za-z_][\w.-]*)(?:\s+\[(.*?)\])?\s*$/i.exec(line)
         ?? /^subgraph\s+\[(.*?)\]\s*$/i.exec(line);
    if (m) {
      const gid = (m[1] ?? '').trim();
      currentGroup = { id: gid, title: m[2] ?? m[1] ?? '', members: [] };
      if (gid) groupIds.set(gid, groups.length);
      groups.push(currentGroup);
      continue;
    }
    if (/^end\s*;?$/i.test(line)) {
      currentGroup = null;
      continue;
    }
    m = /^classDef\s+([\w-]+)\s+(.+)$/.exec(line);
    if (m) {
      classDefs.set(m[1], parseStyleProps(m[2]));
      continue;
    }
    m = /^class\s+([\w\s,-]+?)\s+([\w-]+)\s*$/.exec(line);
    if (m) {
      const props = classDefs.get(m[2]);
      if (!props) continue;
      for (const id of m[1].split(/[\s,]+/)) {
        const gi = groupIds.get(id);
        if (gi !== undefined) groups[gi].style = { ...groups[gi].style, ...props };
        else nodeStyles.set(id, { ...nodeStyles.get(id), ...props });
      }
      continue;
    }
    m = /^style\s+([\w-]+)\s+(.+)$/.exec(line);
    if (m) {
      const props = parseStyleProps(m[2]);
      const gi = groupIds.get(m[1]);
      if (gi !== undefined) groups[gi].style = { ...groups[gi].style, ...props };
      else nodeStyles.set(m[1], { ...nodeStyles.get(m[1]), ...props });
      continue;
    }
    m = /^linkStyle\s+(default|[\d\s,]+?)\s+(.+)$/.exec(line);
    if (m) {
      const props = parseStyleProps(m[2]);
      if (m[1].trim() === 'default') edgeStyles.set('default', { ...edgeStyles.get('default'), ...props });
      else for (const idx of m[1].split(/[\s,]+/).map(Number)) if (!Number.isNaN(idx)) edgeStyles.set(idx, { ...edgeStyles.get(idx), ...props });
      continue;
    }
    // track subgraph membership from plain node declarations inside the block
    if (currentGroup) {
      const idm = /^([A-Za-z_][\w]*(?:[.-][\w]+)*)/.exec(line);
      if (idm && !currentGroup.members.includes(idm[1])) currentGroup.members.push(idm[1]);
    }
  }

  return renderGraphSvg(g, {
    title: fm.title || undefined,
    theme,
    nodeStyles: nodeStyles.size ? nodeStyles : undefined,
    groups: groups.length ? groups : undefined,
    edgeStyles: edgeStyles.size ? edgeStyles : undefined,
  });
}
