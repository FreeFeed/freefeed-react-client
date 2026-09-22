/**
 * gitGraph and mindmap renderers. Pure TS → inline SVG.
 */

import { escapeHtml } from './inline.js';

// ---------------------------------------------------------------------------
// gitGraph
// ---------------------------------------------------------------------------

const GIT_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function renderGitSvg(src: string): string | null {
  if (!/^\s*gitGraph\b/.test(src)) return null;

  interface Lane { name: string; color: string; y: number }
  interface CommitDot { lane: number; x: number; label?: string; tag?: string; type: 'commit' | 'merge' }

  const lanes: Lane[] = [{ name: 'main', color: GIT_COLORS[0], y: 46 }];
  const laneByName = new Map<string, number>([['main', 0]]);
  let current = 0;
  const dots: CommitDot[] = [];
  const merges: { fromLane: number; toLane: number; x: number }[] = [];
  const branchOuts: { fromLane: number; toLane: number; x: number }[] = [];

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^gitGraph\b/.test(line)) continue;

    let m = /^commit(?:\s+(.*))?$/.exec(line);
    if (m) {
      const rest = m[1] ?? '';
      const tagM = /tag:\s*"([^"]*)"/.exec(rest);
      dots.push({ lane: current, x: dots.length * 64 + 60, label: undefined, tag: tagM?.[1], type: 'commit' });
      continue;
    }
    m = /^branch\s+(\S+)/.exec(line);
    if (m) {
      if (!laneByName.has(m[1])) {
        const parentLane = current;
        const lane: Lane = { name: m[1], color: GIT_COLORS[lanes.length % GIT_COLORS.length], y: 46 + lanes.length * 66 };
        lanes.push(lane);
        laneByName.set(m[1], lanes.length - 1);
        const x = dots.length * 64 + 60;
        dots.push({ lane: lanes.length - 1, x, label: undefined, tag: undefined, type: 'commit' });
        const parentLast = [...dots].reverse().find((d) => d.lane === parentLane && d.x < x);
        if (parentLast) branchOuts.push({ fromLane: parentLane, toLane: lanes.length - 1, x });
      }
      current = laneByName.get(m[1])!;
      continue;
    }
    m = /^(checkout|switch)\s+(\S+)/.exec(line);
    if (m) {
      if (laneByName.has(m[2])) current = laneByName.get(m[2])!;
      continue;
    }
    m = /^merge\s+(\S+)/.exec(line);
    if (m) {
      const from = laneByName.get(m[1]);
      if (from !== undefined) {
        merges.push({ fromLane: from, toLane: current, x: dots.length * 64 + 60 });
        dots.push({ lane: current, x: dots.length * 64 + 60, type: 'merge' });
      }
      continue;
    }
  }

  if (dots.length === 0) return null;
  const W = dots.length * 64 + 80;
  const H = 46 + lanes.length * 66 + 20;

  /** Orthogonal path with rounded corners through the given points. */
  const roundedPath = (pts: [number, number][], r = 12): string => {
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [px2, py2] = pts[i - 1];
      const [cx2, cy2] = pts[i];
      const [nx2, ny2] = pts[i + 1];
      // trim straight segments so the corner arc fits
      const inLen = Math.hypot(cx2 - px2, cy2 - py2);
      const outLen = Math.hypot(nx2 - cx2, ny2 - cy2);
      const rr = Math.min(r, inLen / 2, outLen / 2);
      const t1x = cx2 + (px2 - cx2) / (inLen || 1) * rr;
      const t1y = cy2 + (py2 - cy2) / (inLen || 1) * rr;
      const t2x = cx2 + (nx2 - cx2) / (outLen || 1) * rr;
      const t2y = cy2 + (ny2 - cy2) / (outLen || 1) * rr;
      d += ` L ${t1x.toFixed(1)} ${t1y.toFixed(1)} Q ${cx2.toFixed(1)} ${cy2.toFixed(1)} ${t2x.toFixed(1)} ${t2y.toFixed(1)}`;
    }
    const lastPt = pts[pts.length - 1];
    d += ` L ${lastPt[0].toFixed(1)} ${lastPt[1].toFixed(1)}`;
    return d;
  };

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" class="mermaid-svg" role="img" aria-label="git graph">`,
  );

  // dotted full-width lane guides (under everything)
  for (const lane of lanes) {
    parts.push(
      `<line x1="${(lane.name.length * 7 + 26).toFixed(0)}" y1="${lane.y}" x2="${W - 16}" y2="${lane.y}" stroke="${lane.color}" stroke-width="1.6" stroke-dasharray="1 7" stroke-linecap="round" opacity="0.45"/>`,
    );
  }

  // branch connectors — almost vertical, slight rounding, thick
  for (const bo of branchOuts) {
    const fromY = lanes[bo.fromLane].y;
    const toY = lanes[bo.toLane].y;
    const prevX = dots.filter((d) => d.lane === bo.fromLane && d.x < bo.x).slice(-1)[0]?.x ?? bo.x - 64;
    parts.push(
      `<path d="${roundedPath([[prevX, fromY], [bo.x, fromY], [bo.x, toY]], 14)}" fill="none" stroke="${lanes[bo.toLane].color}" stroke-width="4" stroke-linecap="round"/>`,
    );
  }

  // merge connectors — almost vertical, slight rounding, thick
  for (const mg of merges) {
    const fromY = lanes[mg.fromLane].y;
    const toY = lanes[mg.toLane].y;
    const srcX = dots.filter((d) => d.lane === mg.fromLane && d.x <= mg.x).slice(-1)[0]?.x ?? mg.x - 64;
    parts.push(
      `<path d="${roundedPath([[srcX, fromY], [mg.x, fromY], [mg.x, toY]], 14)}" fill="none" stroke="var(--border-strong, #6b7280)" stroke-width="4" stroke-linecap="round"/>`,
    );
  }

  // colored commit-to-commit segments on top of the dotted guides
  for (let li = 0; li < lanes.length; li++) {
    const laneDots = dots.filter((d) => d.lane === li).sort((a, b) => a.x - b.x);
    for (let k = 1; k < laneDots.length; k++) {
      parts.push(`<line x1="${laneDots[k - 1].x}" y1="${lanes[li].y}" x2="${laneDots[k].x}" y2="${lanes[li].y}" stroke="${lanes[li].color}" stroke-width="2.5"/>`);
    }
  }

  // branch name chips
  for (const lane of lanes) {
    parts.push(
      `<rect x="6" y="${lane.y - 14}" width="${(lane.name.length * 7 + 16).toFixed(0)}" height="22" rx="11" fill="${lane.color}" opacity="0.15"/>`,
      `<text x="14" y="${(lane.y + 1).toFixed(1)}" font-size="11.5" fill="currentColor">${escapeHtml(lane.name)}</text>`,
    );
  }

  // commit dots
  for (const d of dots) {
    const lane = lanes[d.lane];
    parts.push(`<circle cx="${d.x}" cy="${lane.y}" r="8" fill="${surface()}" stroke="${lane.color}" stroke-width="3"/>`);
    if (d.tag) {
      parts.push(
        `<rect x="${d.x - d.tag.length * 4 - 8}" y="${lane.y - 34}" width="${d.tag.length * 8 + 16}" height="19" rx="9" fill="${lane.color}" opacity="0.85"/>`,
        `<text x="${d.x}" y="${lane.y - 21}" text-anchor="middle" font-size="10.5" fill="#fff">${escapeHtml(d.tag)}</text>`,
      );
    }
  }

  parts.push('</svg>');
  return parts.join('');

  function surface(): string {
    return 'var(--surface, #fff)';
  }
}

// ---------------------------------------------------------------------------
// mindmap — two layouts: left-to-right tree and hub-spoke radial.
// Both are embedded; the UI's Tree/Radial bookmarks swap viewBox + visibility
// via the data-view-* / data-size-* attributes on the <svg>.
// ---------------------------------------------------------------------------

interface MmNode { text: string; shape: 'plain' | 'square' | 'round' | 'circle'; children: MmNode[] }
interface MmWithDepth extends MmNode { depth: number; children: MmWithDepth[] }
interface MmLaid extends MmWithDepth { x: number; y: number; w: number; h: number; kids: MmLaid[] }

const MM_LEAF_H = 44;
const MM_LEVEL_W = 190;
const MM_HUB_RING = 165;
const MM_PAD = 18;

const mmSizeOf = (text: string, depth: number): { w: number; h: number } => ({
  w: Math.min(240, Math.max(56, text.length * 7.2 + (depth === 0 ? 40 : 28))),
  h: depth === 0 ? 40 : 30,
});
const mmFontSize = (depth: number): number => (depth === 0 ? 14 : depth === 1 ? 12.5 : 11.5);

function parseMindmap(src: string): MmWithDepth | null {
  const lines: { indent: number; text: string }[] = [];
  for (let line of src.split('\n')) {
    if (!line.trim() || line.trim().startsWith('%%')) continue;
    if (/^mindmap\b/.test(line.trim())) continue;
    const indent = line.match(/^\s*/)![0].replace(/\t/g, '  ').length;
    lines.push({ indent, text: line.trim() });
  }
  if (lines.length === 0) return null;
  let idx = 0;
  const parseLevel = (indent: number): MmWithDepth => {
    const entry = lines[idx++];
    let text = entry.text;
    let shape: MmNode['shape'] = 'plain';
    let sm = /^(?:\w+)?\(\((.+)\)\)$/.exec(text);
    if (sm) { text = sm[1]; shape = 'circle'; }
    else if (/^\[(.+)\]$/.test(text)) { text = text.slice(1, -1); shape = 'square'; }
    else if (/^\((.+)\)$/.test(text)) { text = text.slice(1, -1); shape = 'round'; }
    else {
      sm = /^\{\{(.+)\}\}$/.exec(text);
      if (sm) { text = sm[1]; shape = 'round'; }
    }
    const node: MmWithDepth = { text, shape, children: [], depth: indent };
    while (idx < lines.length && lines[idx].indent > indent) {
      node.children.push(parseLevel(lines[idx].indent));
    }
    return node;
  };
  return parseLevel(lines[0].indent);
}

interface MmLaid extends MmWithDepth { x: number; y: number; w: number; h: number; fs: number }

function mmToLaid(n: MmWithDepth, depth: number): MmLaid {
  const size = mmSizeOf(n.text, depth);
  return {
    ...n,
    depth,
    ...size,
    fs: mmFontSize(depth),
    x: 0,
    y: 0,
    kids: n.children.map((c) => mmToLaid(c, depth + 1)),
  };
}

function mmFlatten(n: MmLaid): MmLaid[] {
  const out: MmLaid[] = [n];
  for (const k of n.kids) out.push(...mmFlatten(k));
  return out;
}

function mmBounds(nodes: MmLaid[]): { minx: number; miny: number; maxx: number; maxy: number } {
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
  for (const n of nodes) {
    minx = Math.min(minx, n.x - n.w / 2); maxx = Math.max(maxx, n.x + n.w / 2);
    miny = Math.min(miny, n.y - n.h / 2); maxy = Math.max(maxy, n.y + n.h / 2);
  }
  return { minx, miny, maxx, maxy };
}

function mmShift(nodes: MmLaid[], dx: number, dy: number): void {
  for (const n of nodes) { n.x += dx; n.y += dy; }
}

export function renderMindmapSvg(src: string): string | null {
  const surface = () => 'var(--surface, #fff)';
  const accent = () => 'var(--accent, #4f46e5)';
  const root = parseMindmap(src);
  if (!root) return null;

  // ---- left-to-right tree ---------------------------------------------------
  const lrRoot = mmToLaid(root, 0);
  let leafCursor = 0;
  let lrMaxDepth = 0;
  const lrAssign = (n: MmLaid): void => {
    lrMaxDepth = Math.max(lrMaxDepth, n.depth);
    n.x = MM_PAD + n.depth * MM_LEVEL_W + n.w / 2;
    if (n.kids.length === 0) {
      n.y = leafCursor * MM_LEAF_H + MM_LEAF_H / 2;
      leafCursor++;
      return;
    }
    for (const k of n.kids) lrAssign(k);
    n.y = (n.kids[0].y + n.kids[n.kids.length - 1].y) / 2;
  };
  lrAssign(lrRoot);
  const lrNodes = mmFlatten(lrRoot);
  const lb = mmBounds(lrNodes);
  mmShift(lrNodes, -lb.minx + MM_PAD, -lb.miny + MM_PAD);
  const lrW = lb.maxx - lb.minx + MM_PAD * 2;
  const lrH = lb.maxy - lb.miny + MM_PAD * 2;

  // ---- hub-spoke radial -------------------------------------------------------
  const hubRoot = mmToLaid(root, 0);
  const countLeaves = (n: MmLaid): number =>
    n.kids.length ? n.kids.reduce((s2, k) => s2 + countLeaves(k), 0) : 1;
  const HUB_PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  let topIdx = -1;
  interface HubLaid extends MmLaid { ang: number; rr: number; col: string }
  const hubAssign = (n: HubLaid, a0: number, a1: number, color: string): void => {
    const mid = (a0 + a1) / 2;
    const r = n.depth === 0 ? 0 : MM_HUB_RING + (n.depth - 1) * 150;
    n.x = Math.cos(mid) * r;
    n.y = Math.sin(mid) * r;
    (n as HubLaid).ang = mid;
    (n as HubLaid).rr = r;
    (n as HubLaid).col = color;
    if (n.kids.length === 0) return;
    let c0 = a0;
    const total = countLeaves(n);
    for (const k of n.kids as HubLaid[]) {
      const span = (a1 - a0) * (countLeaves(k as HubLaid) / total);
      const kcol = n.depth === 0 ? HUB_PALETTE[++topIdx % HUB_PALETTE.length] : color;
      (k as HubLaid).col = kcol;
      hubAssign(k as HubLaid, c0, c0 + span, kcol);
      c0 += span;
    }
  };
  hubAssign(hubRoot as unknown as HubLaid, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2, accent());
  const hubNodes = mmFlatten(hubRoot);
  const hb = mmBounds(hubNodes);
  mmShift(hubNodes, -hb.minx + MM_PAD, -hb.miny + MM_PAD);
  const hubW = hb.maxx - hb.minx + MM_PAD * 2;
  const hubH = hb.maxy - hb.miny + MM_PAD * 2;

  const vbLr = `0 0 ${Math.ceil(lrW)} ${Math.ceil(lrH)}`;
  const vbHub = `0 0 ${Math.ceil(hubW)} ${Math.ceil(hubH)}`;

  // ---- SVG --------------------------------------------------------------------
  const uid = `mm${Math.floor(Math.random() * 1e9)}`;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbLr}" width="${Math.ceil(lrW)}" height="${Math.ceil(lrH)}" class="mermaid-svg mindmap-svg" role="img" aria-label="mindmap" data-view-lr="${vbLr}" data-view-hub="${vbHub}" data-size-lr="${Math.ceil(lrW)},${Math.ceil(lrH)}" data-size-hub="${Math.ceil(hubW)},${Math.ceil(hubH)}">`,
    '<defs>'
    + `<linearGradient id="mm-g-${uid}" x1="0" y1="0" x2="1" y2="1">`
    + '<stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient>'
    + `<filter id="mm-soft-${uid}" x="-20%" y="-20%" width="140%" height="140%">`
    + '<feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.16"/></filter>'
    + '</defs>',
  );

  const drawTree = (): void => {
    const wire = (n: MmLaid): void => {
      for (const k of n.kids) {
        const mx = (n.x + n.w / 2 + k.x - k.w / 2) / 2;
        parts.push(
          `<path d="M ${(n.x + n.w / 2).toFixed(1)} ${n.y.toFixed(1)} L ${mx.toFixed(1)} ${n.y.toFixed(1)} L ${mx.toFixed(1)} ${k.y.toFixed(1)} L ${(k.x - k.w / 2).toFixed(1)} ${k.y.toFixed(1)}" fill="none" stroke="var(--border-strong, #999)" stroke-width="1.5"/>`,
        );
        wire(k);
      }
    };
    wire(lrRoot);
    for (const n of mmFlatten(lrRoot)) {
      const x = n.x - n.w / 2;
      const yy = n.y - n.h / 2;
      const fs = mmFontSize(n.depth);
      if (n.shape === 'circle') {
        const r = Math.max(n.h, n.w) / 2;
        parts.push(`<ellipse cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" rx="${r.toFixed(1)}" ry="${(r * 0.62).toFixed(1)}" fill="${surface()}" stroke="${accent()}" stroke-width="${n.depth === 0 ? 2 : 1.4}"/>`);
      } else {
        const rx = n.depth === 0 ? 10 : n.shape === 'square' ? 2 : n.h / 2;
        parts.push(`<rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${n.w.toFixed(1)}" height="${n.h.toFixed(1)}" rx="${rx.toFixed(1)}" fill="${surface()}" stroke="${accent()}" stroke-width="${n.depth === 0 ? 2 : 1.4}"/>`);
      }
      parts.push(`<text x="${n.x.toFixed(1)}" y="${(n.y + fs * 0.36).toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="${n.depth <= 1 ? 700 : 400}" fill="currentColor">${escapeHtml(n.text)}</text>`);
    }
  };

  const drawHub = (): void => {
    interface HubLaid extends MmLaid { ang: number; rr: number; col: string }
    const all = mmFlatten(hubRoot) as (HubLaid & MmLaid)[];
    const meta = (n: MmLaid): HubLaid => n as unknown as HubLaid;

    parts.push(
      '<defs>'
      + `<linearGradient id="mm-g-${uid}" x1="0" y1="0" x2="1" y2="1">`
      + '<stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient>'
      + `<filter id="mm-soft-${uid}" x="-20%" y="-20%" width="140%" height="140%">`
      + '<feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.16"/></filter></defs>',
    );

    const wire = (parent: MmLaid, child: MmLaid, color: string, width: number): void => {
      const p2 = parent as unknown as HubLaid;
      const c2 = child as unknown as HubLaid;
      const midAng = ((p2.ang ?? 0) + (c2.ang ?? 0)) / 2;
      const midR = (((p2.rr ?? 0) + (c2.rr ?? 0)) / 2) || 60;
      const cxp = hubRoot.x + Math.cos(midAng) * midR;
      const cyp = hubRoot.y + Math.sin(midAng) * midR;
      parts.push(
        `<path d="M ${parent.x.toFixed(1)} ${parent.y.toFixed(1)} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${child.x.toFixed(1)} ${child.y.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${width.toFixed(2)}" stroke-linecap="round" opacity="0.78"/>`,
      );
    };

    const walkBranch = (n: MmLaid, col: string, width: number): void => {
      for (const k of n.kids) {
        const kc = (meta(k) as HubLaid).col ?? col;
        wire(n, k, kc, width);
        walkBranch(k, kc, Math.max(1, width - 0.35));
      }
    };
    for (const k of hubRoot.kids) {
      const kc = (meta(k) as HubLaid).col ?? accent();
      const cxp = hubRoot.x + Math.cos((meta(k) as HubLaid).ang) * ((meta(k) as HubLaid).rr * 0.4);
      const cyp = hubRoot.y + Math.sin((meta(k) as HubLaid).ang) * ((meta(k) as HubLaid).rr * 0.4);
      parts.push(
        `<path d="M ${hubRoot.x.toFixed(1)} ${hubRoot.y.toFixed(1)} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${k.x.toFixed(1)} ${k.y.toFixed(1)}" fill="none" stroke="${kc}" stroke-width="2.4" stroke-linecap="round" opacity="0.8"/>`,
      );
      walkBranch(k, kc, 2);
    }

    for (const n of all) {
      const hl = meta(n) as HubLaid;
      const x = n.x - n.w / 2;
      const yy = n.y - n.h / 2;
      const fs = mmFontSize(n.depth);
      if (n.depth === 0) {
        parts.push(
          `<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="${(Math.max(n.w, n.h) / 2 + 6).toFixed(1)}" fill="url(#mm-g-${uid})" filter="url(#mm-soft-${uid})"/>`,
          `<text x="${n.x.toFixed(1)}" y="${(n.y + 5).toFixed(1)}" text-anchor="middle" font-size="${fs + 1}" font-weight="800" fill="#fff">${escapeHtml(n.text)}</text>`,
        );
      } else if (n.depth === 1) {
        parts.push(
          `<g filter="url(#mm-soft-${uid})"><rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${n.w.toFixed(1)}" height="${n.h.toFixed(1)}" rx="${(n.h / 2).toFixed(1)}" fill="${hl.col}"/></g>`,
          `<text x="${n.x.toFixed(1)}" y="${(n.y + fs * 0.36).toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="#fff">${escapeHtml(n.text)}</text>`,
        );
      } else {
        parts.push(
          `<rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${n.w.toFixed(1)}" height="${n.h.toFixed(1)}" rx="${(n.h / 2).toFixed(1)}" fill="${surface()}" stroke="${hl.col}" stroke-width="1.4"/>`,
          `<text x="${n.x.toFixed(1)}" y="${(n.y + fs * 0.36).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="currentColor">${escapeHtml(n.text)}</text>`,
        );
      }
    }
  };

  parts.push('<g class="g-lr">');
  drawTree();
  parts.push('</g>');
  parts.push('<g class="g-hub" style="display:none">');
  drawHub();
  parts.push('</g>');

  parts.push('</svg>');
  return parts.join('');
}
