/**
 * Remaining mermaid diagram families, pure TS → inline SVG:
 *   journey · quadrantChart · timeline · C4* · sankey-beta · xychart-beta
 */

import { escapeHtml } from './inline.js';

const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
const surface = 'var(--surface, #fff)';
const dim = 'var(--text-dim, #888)';
const borderC = 'var(--border, #ccc)';
const accent = 'var(--accent, #4f46e5)';

function svgOpen(w: number, h: number, label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(0)} ${h.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" class="mermaid-svg" role="img" aria-label="${escapeHtml(label)}">`;
}

// ---------------------------------------------------------------------------
// journey
// ---------------------------------------------------------------------------

export function renderJourneySvg(src: string): string | null {
  if (!/^\s*journey\b/.test(src)) return null;
  let title = '';
  const sections: { name: string; tasks: { text: string; score: number; actors: string[] }[] }[] = [];
  let cur: { name: string; tasks: { text: string; score: number; actors: string[] }[] } | null = null;

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^journey\b/.test(line)) continue;
    let m = /^title\s+(.+)$/i.exec(line);
    if (m) { title = m[1].trim(); continue; }
    m = /^section\s+(.+)$/i.exec(line);
    if (m) {
      cur = { name: m[1].trim(), tasks: [] };
      sections.push(cur);
      continue;
    }
    m = /^([^:]+):\s*(-?\d+)\s*:\s*(.*)$/.exec(line);
    if (m) {
      const task = { text: m[1].trim(), score: Math.max(1, Math.min(5, parseInt(m[2]))), actors: m[3].split(',').map((a) => a.trim()).filter(Boolean) };
      if (!cur) { cur = { name: '', tasks: [] }; sections.push(cur); }
      cur.tasks.push(task);
    }
  }
  if (sections.length === 0 || sections.every((s) => s.tasks.length === 0)) return null;

  const SCORE_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];
  const FACE = ['✕', '◔_◔', '•__•', '‿', 'ᕕ'];
  const CELL_W = 130;
  const W = Math.max(...sections.map((s) => s.tasks.length), 3) * CELL_W + 40;
  const totalH = (title ? 34 : 14) + sections.length * (96 + 14);
  let y = title ? 34 : 14;
  const parts: string[] = [svgOpen(W, totalH, 'journey')];
  if (title) {
    parts.push(`<text x="20" y="${y - 8}" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);
  }
  for (const sec of sections) {
    // section panel
    const panelH = 96;
    parts.push(`<rect x="16" y="${y}" width="${W - 32}" height="${panelH}" rx="10" fill="${surface}" stroke="${borderC}"/>`);
    parts.push(`<text x="28" y="${y + 20}" font-size="13" font-weight="700" fill="currentColor">${escapeHtml(sec.name)}</text>`);
    sec.tasks.forEach((t, i) => {
      const cx = 36 + i * CELL_W + CELL_W / 2 - 10;
      const cy = y + 52;
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="17" fill="${SCORE_COLORS[t.score - 1]}"/>`,
        `<text x="${cx}" y="${cy + 4.5}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${FACE[t.score - 1]}</text>`,
        `<text x="${cx}" y="${cy + 38}" text-anchor="middle" font-size="11.5" fill="currentColor">${escapeHtml(t.text)}</text>`,
        `<text x="${cx}" y="${cy + 53}" text-anchor="middle" font-size="10" fill="${dim}">${escapeHtml(t.actors.join(', '))}</text>`,
      );
    });
    y += panelH + 14;
  }
  parts.push('</svg>');
  return parts.join('');
}

// ---------------------------------------------------------------------------
// quadrantChart
// ---------------------------------------------------------------------------

export function renderQuadrantSvg(src: string): string | null {
  if (!/^\s*quadrantChart\b/.test(src)) return null;
  let title = '';
  const quadrants: (string | null)[] = [null, null, null, null]; // 1 tr, 2 tl, 3 bl, 4 br
  let xLabels: [string, string] = ['Low', 'High'];
  let yLabels: [string, string] = ['Low', 'High'];
  const points: { text: string; x: number; y: number }[] = [];

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^quadrantChart\b/.test(line)) continue;
    let m = /^title\s+(.+)$/i.exec(line);
    if (m) { title = m[1].trim(); continue; }
    m = /^x-axis\s+(.+)$/i.exec(line);
    if (m) { const p = m[1].split('-->').map((s) => s.trim()); xLabels = [p[0] ?? '', p[1] ?? '']; continue; }
    m = /^y-axis\s+(.+)$/i.exec(line);
    if (m) { const p = m[1].split('-->').map((s) => s.trim()); yLabels = [p[0] ?? '', p[1] ?? '']; continue; }
    m = /^quadrant-(\d)\s+(.+)$/i.exec(line);
    if (m) { quadrants[parseInt(m[1]) - 1] = m[2].trim(); continue; }
    m = /^(.+?):\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]$/.exec(line);
    if (m) points.push({ text: m[1].trim(), x: parseFloat(m[2]), y: parseFloat(m[3]) });
  }
  if (points.length === 0 && !title && quadrants.every((q) => !q)) return null;

  const SIZE = 380;
  const PADL = 56;
  const PADT = title ? 52 : 28;
  const W = SIZE + PADL + 30;
  const H = SIZE + PADT + 34;
  const px = (v: number) => PADL + v * SIZE;
  const py = (v: number) => PADT + (1 - v) * SIZE;

  const parts: string[] = [svgOpen(W, H, 'quadrant chart')];
  if (title) parts.push(`<text x="${W / 2}" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);
  parts.push(`<rect x="${PADL}" y="${PADT}" width="${SIZE}" height="${SIZE}" fill="none" stroke="${borderC}"/>`,
    `<line x1="${PADL + SIZE / 2}" y1="${PADT}" x2="${PADL + SIZE / 2}" y2="${PADT + SIZE}" stroke="${borderC}"/>`,
    `<line x1="${PADL}" y1="${PADT + SIZE / 2}" x2="${PADL + SIZE}" y2="${PADT + SIZE / 2}" stroke="${borderC}"/>`);
  const qText = [
    { t: quadrants[1], x: PADL + 14, y: PADT + 24, anchor: 'start' },
    { t: quadrants[0], x: PADL + SIZE - 14, y: PADT + 24, anchor: 'end' },
    { t: quadrants[2], x: PADL + 14, y: PADT + SIZE - 14, anchor: 'start' },
    { t: quadrants[3], x: PADL + SIZE - 14, y: PADT + SIZE - 14, anchor: 'end' },
  ];
  for (const q of qText) {
    if (!q.t) continue;
    parts.push(`<text x="${q.x}" y="${q.y}" text-anchor="${q.anchor}" font-size="13" font-weight="600" fill="${dim}">${escapeHtml(q.t)}</text>`);
  }
  parts.push(
    `<text x="${PADL + SIZE / 2}" y="${H - 8}" text-anchor="middle" font-size="12" fill="${dim}">${escapeHtml(xLabels[0])} ← ${escapeHtml(xLabels[1])}</text>`,
    `<text x="16" y="${PADT + SIZE / 2}" font-size="12" fill="${dim}" transform="rotate(-90 16 ${PADT + SIZE / 2})" text-anchor="middle">${escapeHtml(yLabels[0])} ← ${escapeHtml(yLabels[1])}</text>`,
  );
  for (const p of points) {
    const cx = px(Math.max(0, Math.min(1, p.x)));
    const cy = py(Math.max(0, Math.min(1, p.y)));
    parts.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="7" fill="${accent}" opacity="0.9"/>`,
      `<text x="${(cx + 11).toFixed(1)}" y="${(cy + 4).toFixed(1)}" font-size="11.5" fill="currentColor">${escapeHtml(p.text)}</text>`,
    );
  }
  parts.push('</svg>');
  return parts.join('');
}

// ---------------------------------------------------------------------------
// timeline
// ---------------------------------------------------------------------------

export function renderTimelineSvg(src: string): string | null {
  if (!/^\s*timeline\b/.test(src)) return null;
  interface Period { period: string; events: string[] }
  const sections: { name?: string; periods: Period[] }[] = [{ periods: [] }];
  let title = '';
  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^timeline\b/.test(line)) continue;
    let m = /^title\s+(.+)$/i.exec(line);
    if (m) { title = m[1].trim(); continue; }
    m = /^section\s+(.+)$/i.exec(line);
    if (m) { sections.push({ name: m[1].trim(), periods: [] }); continue; }
    const ci = line.indexOf(':');
    const period = ci === -1 ? line : line.slice(0, ci).trim();
    const events = ci === -1 ? [] : line.slice(ci + 1).split(':').map((e) => e.trim()).filter(Boolean);
    sections[sections.length - 1].periods.push({ period, events });
  }
  const allPeriods = sections.flatMap((s) => s.periods);
  if (allPeriods.length === 0) return null;

  const SPINE_X = 150;
  const ROW_H = 44;
  const SEC_H = 40;
  let H = title ? 40 : 16;
  for (const s of sections) {
    if (s.name) H += SEC_H;
    H += s.periods.length * ROW_H;
  }
  H += 24;
  const W = 560;

  const parts: string[] = [svgOpen(W, H, 'timeline')];
  if (title) parts.push(`<text x="${SPINE_X}" y="26" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);
  parts.push(`<line x1="${SPINE_X}" y1="${title ? 44 : 20}" x2="${SPINE_X}" y2="${H - 16}" stroke="${borderC}" stroke-width="2"/>`);

  let y = title ? 52 : 28;
  let colorIdx = 0;
  for (const s of sections) {
    if (s.name) {
      const c = PALETTE[colorIdx++ % PALETTE.length];
      parts.push(
        `<rect x="${SPINE_X + 26}" y="${y}" width="${(W - SPINE_X - 48).toFixed(0)}" height="28" rx="6" fill="${c}" opacity="0.14"/>`,
        `<text x="${SPINE_X + 38}" y="${y + 19}" font-size="13" font-weight="700" fill="currentColor">${escapeHtml(s.name)}</text>`,
      );
      y += SEC_H;
    }
    for (const p of s.periods) {
      const dotColor = PALETTE[(colorIdx + 1) % PALETTE.length];
      parts.push(`<circle cx="${SPINE_X}" cy="${y + 14}" r="6" fill="${dotColor}"/>`);
      parts.push(`<text x="${SPINE_X - 16}" y="${y + 19}" text-anchor="end" font-size="13" font-weight="700" fill="currentColor">${escapeHtml(p.period)}</text>`);
      p.events.forEach((ev, i) => {
        parts.push(
          `<rect x="${SPINE_X + 26}" y="${y + 2 + i * 26}" width="${Math.max(70, ev.length * 6.6 + 16).toFixed(0)}" height="22" rx="5" fill="${surface}" stroke="${borderC}"/>`,
          `<text x="${SPINE_X + 36}" y="${y + 17 + i * 26}" font-size="11.5" fill="currentColor">${escapeHtml(ev)}</text>`,
        );
      });
      const rowsUsed = Math.max(1, p.events.length);
      y += Math.max(rowsUsed * 26 + 10, ROW_H);
    }
  }
  void allPeriods;
  parts.push('</svg>');
  return parts.join('');
}

// ---------------------------------------------------------------------------
// C4 Context / Container / Component / Dynamic
// ---------------------------------------------------------------------------

interface C4El { id: string; kind: string; label: string; desc: string; boundary: string | null }
interface C4Rel { from: string; to: string; label: string; style: 'solid' | 'dashed' | 'bi' | 'back' }

export function renderC4Svg(src: string): string | null {
  if (!/^\s*C4(Context|Container|Component|Dynamic)\b/.test(src)) return null;
  let title = '';
  const els: C4El[] = [];
  const rels: C4Rel[] = [];
  const boundaries: { id: string; name: string; members: string[] }[] = [];
  const byId = new Map<string, C4El>();
  let depth = 0;
  let curBoundary: { id: string; name: string } | null = null;

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^C4(Context|Container|Component|Dynamic)\b/.test(line)) continue;

    let m = /^title\s+(.+)$/i.exec(line);
    if (m) { title = m[1].trim(); continue; }

    if (/^(Enterprise_Boundary|System_Boundary|Container_Boundary|Boundary)\s*\(\s*(\w+)\s*,\s*"?([^"]*)"?\s*\)\s*\{?\s*$/i.test(line)) {
      const bm = /^(Enterprise_Boundary|System_Boundary|Container_Boundary|Boundary)\s*\(\s*(\w+)\s*,\s*"?([^"]*)"?\s*\)/i.exec(line)!;
      boundaries.push({ id: bm[2], name: bm[3], members: [] });
      curBoundary = { id: bm[2], name: bm[3] };
      if (/\{\s*$/.test(line)) depth++;
      continue;
    }
    if (/^\}\s*$/.test(line)) {
      depth = Math.max(0, depth - 1);
      curBoundary = null;
      continue;
    }

    m = /^(Person|Person_Ext|System|System_Ext|SystemDb|SystemDb_Ext|SystemQueue|SystemQueue_Ext|Container|Container_Ext|ContainerDb|Component|ComponentDb)\s*\(\s*([\w.]+)\s*,\s*"([^"]*)"\s*(?:,\s*"([^"]*)")?[^)]*\)/i.exec(line);
    if (m) {
      const el: C4El = {
        id: m[2],
        kind: m[1],
        label: m[3],
        desc: (m[4] ?? '').trim(),
        boundary: depth > 0 ? curBoundary?.id ?? null : null,
      };
      els.push(el);
      byId.set(el.id, el);
      if (el.boundary) boundaries.find((b) => b.id === el.boundary)?.members.push(el.id);
      continue;
    }

    m = /^Rel(_Back|Bi)?\s*\(\s*([\w.]+)\s*,\s*([\w.]+)\s*(?:,\s*"([^"]*)")?[^)]*\)/i.exec(line);
    if (m) {
      rels.push({
        from: m[2],
        to: m[3],
        label: m[4]?.trim() ?? '',
        style: m[1]?.toLowerCase() === 'birel' ? 'bi' : m[1] ? 'back' : 'solid',
      });
      continue;
    }
    // UpdateElementStyle/AddRelTag etc.: skipped
  }
  if (els.length === 0) return null;

  // grid layout: 3 columns, declaration order
  const COLS = 3;
  const NODE_W = 200;
  const NODE_H = 74;
  const GX = 60;
  const GY = 64;
  const pos = new Map<string, Placed>();
  els.forEach((el, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    pos.set(el.id, { x: 40 + col * (NODE_W + GX) + NODE_W / 2, y: (title ? 54 : 30) + row * (NODE_H + GY) + NODE_H / 2, w: NODE_W, h: NODE_H });
  });
  const colsX = [...pos.values()].map((p) => p.x + p.w / 2);
  const rowsY = [...pos.values()].map((p) => p.y + p.h / 2);
  const W = Math.max(...colsX) + NODE_W / 2 + 40;
  const H = Math.max(...rowsY) + NODE_H / 2 + 40;

  const parts: string[] = [svgOpen(W, H, 'C4 diagram')];
  if (title) parts.push(`<text x="${W / 2}" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);

  // boundary boxes behind
  for (const b of boundaries) {
    const memberPos = b.members.map((mid) => pos.get(mid)).filter(Boolean) as Placed[];
    if (memberPos.length === 0) continue;
    const x1 = Math.min(...memberPos.map((p) => p.x - p.w / 2)) - 18;
    const y1 = Math.min(...memberPos.map((p) => p.y - p.h / 2)) - 32;
    const x2 = Math.max(...memberPos.map((p) => p.x + p.w / 2)) + 18;
    const y2 = Math.max(...memberPos.map((p) => p.y + p.h / 2)) + 14;
    parts.push(
      `<rect x="${x1.toFixed(1)}" y="${y1.toFixed(1)}" width="${(x2 - x1).toFixed(1)}" height="${(y2 - y1).toFixed(1)}" rx="8" fill="none" stroke="${borderC}" stroke-dasharray="7 5"/>`,
      `<text x="${(x1 + 10).toFixed(1)}" y="${(y1 + 17).toFixed(1)}" font-size="12" font-weight="600" fill="${dim}">${escapeHtml(b.name)}</text>`,
    );
  }

  const lineColor = 'var(--border-strong, #6b7280)';
  // relations
  for (const r of rels) {
    const a = pos.get(r.from);
    const b = pos.get(r.to);
    if (!a || !b) continue;
    const dashAttr = r.style !== 'solid' ? ' stroke-dasharray="6 4"' : '';
    parts.push(
      `<path d="M ${(a.x + a.w / 2 - 8).toFixed(1)} ${a.y.toFixed(1)} L ${(a.x + a.w / 2 - 8).toFixed(1)} ${(a.y - 18).toFixed(1)} L ${(b.x - b.w / 2 + 8).toFixed(1)} ${(b.y - 18).toFixed(1)} L ${(b.x - b.w / 2 + 8).toFixed(1)} ${b.y.toFixed(1)}" fill="none" stroke="${lineColor}"${dashAttr} marker-end="url(#ma)"/>`,
    );
    if (r.label) {
      const lx = ((a.x + b.x) / 2);
      const ly = Math.min(a.y, b.y) - 26;
      const tw = r.label.length * 6.2 + 10;
      parts.push(
        `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" font-size="11" fill="${dim}">${escapeHtml(r.label)}</text>`,
      );
      void tw;
    }
  }
  parts.push('<defs><marker id="ma" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>');

  // element boxes
  for (const el of els) {
    const p = pos.get(el.id)!;
    const x = p.x - p.w / 2;
    const y = p.y - p.h / 2;
    const ext = el.kind.includes('_Ext');
    const isPerson = el.kind.startsWith('Person');
    parts.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${p.w.toFixed(1)}" height="${p.h.toFixed(1)}" rx="${isPerson ? p.h / 2 : 8}" fill="${surface}" stroke="${ext ? borderC : accent}" stroke-width="1.6"${el.kind.includes('Db') ? ' stroke-dasharray="5 3"' : ''}/>`,
      `<text x="${p.x.toFixed(1)}" y="${(p.y - 4).toFixed(1)}" text-anchor="middle" font-size="12.5" font-weight="700" fill="currentColor">${escapeHtml(el.label)}</text>`,
    );
    if (el.desc) {
      parts.push(
        `<text x="${p.x.toFixed(1)}" y="${(p.y + 14).toFixed(1)}" text-anchor="middle" font-size="10.5" fill="${dim}">${escapeHtml(el.desc.length > 34 ? `${el.desc.slice(0, 33)}…` : el.desc)}</text>`,
      );
    }
    parts.push(
      `<text x="${(x + 8).toFixed(1)}" y="${(y + 14).toFixed(1)}" font-size="9.5" fill="${dim}">[${escapeHtml(el.kind.replace('_Ext', '') )}${ext ? ': external' : ''}]</text>`,
    );
  }

  parts.push('</svg>');
  return parts.join('');
}

interface Placed { x: number; y: number; w: number; h: number }

// ---------------------------------------------------------------------------
// sankey-beta
// ---------------------------------------------------------------------------

export function renderSankeySvg(src: string): string | null {
  if (!/^\s*sankey(-beta)?\b/.test(src)) return null;
  const links: { from: string; to: string; value: number }[] = [];
  for (let line of src.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('%%') || /^sankey/.test(line)) continue;
    // CSV: optionally quoted fields
    const fields = line.match(/("([^"]*)")|([^,]+)/g)?.map((f) => f.replace(/^"|"$/g, '').trim()) ?? [];
    if (fields.length !== 3) continue;
    const value = parseFloat(fields[2]);
    if (Number.isNaN(value) || value <= 0) continue;
    links.push({ from: fields[0], to: fields[1], value });
  }
  if (links.length === 0) return null;

  const names: string[] = [];
  const seenName = new Set<string>();
  for (const l of [links, links].flat()) {
    if (!seenName.has(l.from)) { seenName.add(l.from); names.push(l.from); }
    if (!seenName.has(l.to)) { seenName.add(l.to); names.push(l.to); }
  }
  const outSum = new Map<string, number>();
  const inSum = new Map<string, number>();
  for (const l of links) {
    outSum.set(l.from, (outSum.get(l.from) ?? 0) + l.value);
    inSum.set(l.to, (inSum.get(l.to) ?? 0) + l.value);
  }

  // column assignment: 0 = only source, 2 = only target, 1 = both
  const colOf = new Map<string, 0 | 1 | 2>();
  for (const n of names) {
    colOf.set(n, outSum.has(n) && inSum.has(n) ? 1 : outSum.has(n) ? 0 : 2);
  }

  const SCALE_H = 340;
  const NODE_W = 22;
  const GAP = 14;
  const maxValue = (n: string) => Math.max(outSum.get(n) ?? 0, inSum.get(n) ?? 0);
  const totalMaxPerCol = [0, 1, 2].map((c) =>
    Math.max(names.filter((n) => colOf.get(n) === c).reduce((s2, n) => s2 + maxValue(n) + GAP, -GAP), 1),
  );
  const unit = Math.min(...totalMaxPerCol.map((t) => SCALE_H / t));
  const H = Math.max(...totalMaxPerCol.map((_, c) => totalMaxPerCol[c] * unit)) + 40;
  const colX = [60, 300, 540];
  const W = 640;

  // stack nodes per column
  const nodeGeom = new Map<string, { x: number; y: number; h: number }>();
  const colCursor = [30, 30, 30];
  for (let c = 0; c < 3; c++) {
    for (const n of names.filter((nn) => colOf.get(nn) === c)) {
      const h = maxValue(n) * unit;
      nodeGeom.set(n, { x: colX[c], y: colCursor[c], h });
      colCursor[c] += h + GAP;
    }
  }

  const parts: string[] = [svgOpen(W, Math.max(H, 120), 'sankey diagram'), '<defs>'];
  parts.push('</defs>');
  const linkColors = PALETTE;
  // ribbons
  const usedOut = new Map<string, number>();
  const usedIn = new Map<string, number>();
  links.forEach((l, i) => {
    const gFrom = nodeGeom.get(l.from)!;
    const gTo = nodeGeom.get(l.to)!;
    const h = l.value * unit;
    const y0 = gFrom.y + (usedOut.get(l.from) ?? 0);
    const y1 = gTo.y + (usedIn.get(l.to) ?? 0);
    usedOut.set(l.from, (usedOut.get(l.from) ?? 0) + h);
    usedIn.set(l.to, (usedIn.get(l.to) ?? 0) + h);
    const x0 = gFrom.x + NODE_W;
    const x1 = gTo.x;
    const mx = (x0 + x1) / 2;
    parts.push(
      `<path d="M ${x0} ${y0.toFixed(1)} C ${mx} ${y0.toFixed(1)}, ${mx} ${y1.toFixed(1)}, ${x1} ${y1.toFixed(1)} L ${x1} ${(y1 + h).toFixed(1)} C ${mx} ${(y1 + h).toFixed(1)}, ${mx} ${(y0 + h).toFixed(1)}, ${x0} ${(y0 + h).toFixed(1)} Z" fill="${linkColors[i % linkColors.length]}" opacity="0.45"><title>${escapeHtml(`${l.from} → ${l.to}: ${l.value}`)}</title></path>`,
    );
  });
  // ribbon value labels
  const usedOut2 = new Map<string, number>();
  const usedIn2 = new Map<string, number>();
  links.forEach((l) => {
    const gF = nodeGeom.get(l.from)!;
    const gT = nodeGeom.get(l.to)!;
    const h = l.value * unit;
    const y0 = gF.y + (usedOut2.get(l.from) ?? 0);
    const y1 = gT.y + (usedIn2.get(l.to) ?? 0);
    usedOut2.set(l.from, (usedOut2.get(l.from) ?? 0) + h);
    usedIn2.set(l.to, (usedIn2.get(l.to) ?? 0) + h);
    if (h < 13) return; // too thin for a label
    const mx = (gF.x + NODE_W + gT.x) / 2;
    const my = Math.max(y0, y1) + h / 2;
    parts.push(
      `<text x="${mx.toFixed(1)}" y="${(my + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="600" fill="currentColor">${escapeHtml(String(l.value))}</text>`,
    );
  });

  // nodes + labels (totals appended)
  for (const n of names) {
    const gN = nodeGeom.get(n)!;
    const total = maxValue(n);
    parts.push(
      `<rect x="${gN.x}" y="${gN.y.toFixed(1)}" width="${NODE_W}" height="${gN.h.toFixed(1)}" fill="${accent}"/>`,
      `<text x="${gN.x + (colOf.get(n) === 2 ? NODE_W + 6 : -6)}" y="${(gN.y + 13).toFixed(1)}" text-anchor="${colOf.get(n) === 2 ? 'start' : 'end'}" font-size="12" fill="currentColor">${escapeHtml(`${n} · ${total}`)}</text>`,
    );
  }
  parts.push('</svg>');
  return parts.join('');
}

// ---------------------------------------------------------------------------
// xychart-beta
// ---------------------------------------------------------------------------

export function renderXychartSvg(src: string): string | null {
  if (!/^\s*xychart(-beta)?\b/.test(src)) return null;
  let title = '';
  let yTitle = '';
  let xTitle = '';
  const xCats: string[] = [];
  let yRange: [number, number] | null = null;
  const series: { type: 'bar' | 'line'; values: number[] }[] = [];

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^xychart(-beta)?\b/.test(line)) continue;
    let m = /^title\s+"?([^"].*?)?"?\s*$/i.exec(line);
    if (m) { title = (m[1] ?? '').trim(); continue; }
    m = /^x-axis\s+"([^"]*)"\s*\[(.*)\]$/i.exec(line);
    if (m) { xTitle = m[1]; xCats.push(...m[2].split(',').map((c) => c.trim().replace(/^"|"$/g, ''))); continue; }
    m = /^x-axis\s+\[(.*)\]$/i.exec(line);
    if (m) { xCats.push(...m[1].split(',').map((c) => c.trim().replace(/^"|"$/g, ''))); continue; }
    m = /^x-axis\s+(\w+)\s+(.+)$/i.exec(line);
    if (m) { xTitle = m[1]; continue; } // ranged x-axis: treated as categories-less
    m = /^y-axis\s+"?([^"]*?)"?\s+(-?[\d.]+)\s*-->\s*(-?[\d.]+)$/i.exec(line);
    if (m) { yTitle = m[1]; yRange = [parseFloat(m[2]), parseFloat(m[3])]; continue; }
    m = /^y-axis\s+(-?[\d.]+)\s*-->\s*(-?[\d.]+)$/i.exec(line);
    if (m) { yRange = [parseFloat(m[1]), parseFloat(m[2])]; continue; }
    m = /^(bar|line)\s+(.+)$/i.exec(line);
    if (m) {
      const values = [...m[2].matchAll(/-?[\d.]+/g)].map((v) => parseFloat(v[0]));
      series.push({ type: m[1].toLowerCase() as 'bar' | 'line', values });
    }
  }
  if (series.length === 0 || (xCats.length === 0 && series.every((s) => s.values.length === 0))) return null;

  const catCount = Math.max(xCats.length, ...series.map((s) => s.values.length));
  while (xCats.length < catCount) xCats.push(String(xCats.length + 1));

  const allVals = series.flatMap((s) => s.values);
  const dataMin = Math.min(...allVals, 0);
  const dataMax = Math.max(...allVals, 1);
  const yMin = yRange ? yRange[0] : Math.floor(dataMin);
  const yMax = yRange ? yRange[1] : Math.ceil(dataMax);

  const M = { l: 64, r: 24, t: title ? 40 : 18, b: 46 };
  const PLOT_W = 430;
  const PLOT_H = 250;
  const W = M.l + PLOT_W + M.r;
  const H = M.t + PLOT_H + M.b;
  const px = (i: number) => M.l + ((i + 0.5) / catCount) * PLOT_W;
  const py = (v: number) => M.t + (1 - (v - yMin) / Math.max(yMax - yMin, 1e-9)) * PLOT_H;

  const parts: string[] = [svgOpen(W, H, 'xy chart')];
  if (title) parts.push(`<text x="${W / 2}" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);
  parts.push(`<rect x="${M.l}" y="${M.t}" width="${PLOT_W}" height="${PLOT_H}" fill="${surface}" stroke="${borderC}"/>`);

  // y ticks (5 divisions)
  for (let k = 0; k <= 5; k++) {
    const v = yMin + ((yMax - yMin) * k) / 5;
    const yy = py(v);
    parts.push(
      `<line x1="${M.l}" y1="${yy.toFixed(1)}" x2="${M.l + PLOT_W}" y2="${yy.toFixed(1)}" stroke="${borderC}" opacity="0.6"/>`,
      `<text x="${M.l - 8}" y="${(yy + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="${dim}">${Number.isInteger(v) ? v : v.toFixed(1)}</text>`,
    );
  }
  // x labels
  xCats.forEach((c, i) => {
    parts.push(`<text x="${px(i).toFixed(1)}" y="${M.t + PLOT_H + 18}" text-anchor="middle" font-size="11" fill="${dim}">${escapeHtml(c)}</text>`);
  });
  if (xTitle) parts.push(`<text x="${M.l + PLOT_W / 2}" y="${H - 6}" text-anchor="middle" font-size="11.5" fill="${dim}">${escapeHtml(xTitle)}</text>`);
  if (yTitle) parts.push(`<text x="14" y="${M.t + PLOT_H / 2}" transform="rotate(-90 14 ${M.t + PLOT_H / 2})" text-anchor="middle" font-size="11.5" fill="${dim}">${escapeHtml(yTitle)}</text>`);

  // bars first
  const barSeries = series.filter((s) => s.type === 'bar');
  if (barSeries.length > 0) {
    const slot = PLOT_W / catCount;
    const bw = Math.min(38, (slot * 0.72) / barSeries.length);
    barSeries.forEach((s, si) => {
      s.values.forEach((v, i) => {
        const bx = px(i) - (bw * barSeries.length) / 2 + si * bw;
        const by = py(Math.max(v, yMin));
        parts.push(
          `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${Math.max(1, M.t + PLOT_H - by).toFixed(1)}" fill="${PALETTE[si % PALETTE.length]}"/>`,
        );
      });
    });
  }
  // lines over bars
  series.filter((s) => s.type === 'line').forEach((s, li) => {
    const pts = s.values.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(' ');
    parts.push(
      `<polyline points="${pts}" fill="none" stroke="${PALETTE[(li + 3) % PALETTE.length]}" stroke-width="2.4"/>`,
    );
    s.values.forEach((v, i) => parts.push(`<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="3.4" fill="${PALETTE[(li + 3) % PALETTE.length]}"/>`));
  });

  parts.push('</svg>');
  return parts.join('');
}
