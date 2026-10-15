/**
 * Additional mermaid diagram families: sequenceDiagram, stateDiagram(-v2),
 * pie. Pure TS → inline SVG, same styling conventions as flowcharts.
 */

import { escapeHtml } from './inline.js';
import { renderGraphSvg } from './mermaid.js';
import type { MermaidGraph } from './mermaid.js';

const PAD = 24;

// ---------------------------------------------------------------------------
// sequence diagrams — frames, activations, dividers, autonumber, boxes
// ---------------------------------------------------------------------------

interface SeqParticipant { id: string; label: string; actor: boolean }
interface SeqMessage {
  from: string;
  to: string;
  text: string;
  dotted: boolean;
  head: 'filled' | 'open' | 'cross' | 'none';
  number?: number;
}
interface SeqNote { over: string[]; pos: 'over' | 'left' | 'right'; text: string }
type SeqLeaf =
  | { type: 'msg'; msg: SeqMessage }
  | { type: 'note'; note: SeqNote }
  | { type: 'divider'; text: string };
interface SeqBlock { label?: string; items: SeqNode[] }
interface SeqFrame { type: 'frame'; kind: string; title: string; blocks: SeqBlock[] }
type SeqNode = SeqLeaf | SeqFrame;

const SEQ_FRAME_KINDS = new Set(['loop', 'alt', 'opt', 'par', 'critical', 'break', 'box']);
const SEQ_ELSE_LABELS = new Set(['else', 'and', 'option']);

function parseSequence(src: string): {
  title?: string;
  participants: SeqParticipant[];
  root: SeqNode[];
  activationSpans: Map<string, [number, number][]>;
  totalRows: number;
  autonumber: { start: number; step: number } | null;
  boxes: { title: string; from: number; to: number }[];
} | null {
  if (!/^\s*sequenceDiagram\b/.test(src)) return null;
  let seqTitle = '';
  const participants: SeqParticipant[] = [];
  const byId = new Map<string, SeqParticipant>();
  const root: SeqNode[] = [];
  const stack: { frame?: SeqFrame; items: SeqNode[] }[] = [{ items: root }];
  const boxes: { title: string; from: number; to: number }[] = [];
  let openBox: { title: string; from: number; to: number } | null = null;
  let autonumber: { start: number; step: number } | null = null;
  let msgCount = 0;
  let rowCounter = 0;
  const activationSpans = new Map<string, [number, number][]>();
  const openActivations = new Map<string, number>();

  const participant = (id: string, label?: string, actor?: boolean): SeqParticipant => {
    let p = byId.get(id);
    if (!p) {
      p = { id, label: label ?? id, actor: actor ?? false };
      byId.set(id, p);
      participants.push(p);
    } else if (label) p.label = label;
    return p;
  };
  const activate = (id: string): void => {
    openActivations.set(id, rowCounter);
  };
  const deactivate = (id: string): void => {
    const openAt = openActivations.get(id);
    if (openAt === undefined) return;
    openActivations.delete(id);
    const spans = activationSpans.get(id) ?? [];
    spans.push([openAt, rowCounter]);
    activationSpans.set(id, spans);
  };

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+\s*$/, '');
    if (!line || line.startsWith('%%')) continue;

    // init/theme directives tolerated
    if (/^%%\{/.test(line)) continue;

    let tm2 = /^title\s+(.+)$/i.exec(line);
    if (tm2) { seqTitle = tm2[1].trim(); continue; }

    let m = /^(participant|actor)\s+(?:"([^"]*)"\s+as\s+|(\S+)(?:\s+as\s+(.+))?)/i.exec(line);
    if (m) {
      const id = m[3] ?? m[2];
      participant(id, (m[4] ?? m[2] ?? '').trim() || undefined, m[1].toLowerCase() === 'actor');
      continue;
    }

    m = /^autonumber(?:\s+(\d+)(?:\s+(\d+))?)?$/i.exec(line);
    if (m) {
      autonumber = { start: m[1] ? parseInt(m[1]) : 1, step: m[2] ? parseInt(m[2]) : 1 };
      continue;
    }

    m = /^(activate|deactivate)\s+(\S+)$/i.exec(line);
    if (m) {
      participant(m[2]);
      if (m[1].toLowerCase() === 'activate') activate(m[2]);
      else deactivate(m[2]);
      continue;
    }

    m = /^box(?:\s+(?:#[0-9a-f]+)?\s*(.*))?$/i.exec(line);
    if (m) {
      openBox = { title: (m[1] ?? '').trim(), from: participants.length, to: participants.length - 1 };
      boxes.push(openBox);
      stack.push({ items: [] });
      continue;
    }

    const frameKind = line.split(/\s+/)[0].toLowerCase();
    if (SEQ_FRAME_KINDS.has(frameKind)) {
      const title = line.slice(frameKind.length).trim();
      if (frameKind === 'box') continue;
      const frame: SeqFrame = { type: 'frame', kind: frameKind, title, blocks: [{ items: [] }] };
      stack[stack.length - 1].items.push(frame);
      stack.push({ frame, items: frame.blocks[0].items });
      continue;
    }
    if (SEQ_ELSE_LABELS.has(frameKind)) {
      const top = stack[stack.length - 1];
      if (top.frame) {
        top.frame.blocks.push({ label: line.slice(frameKind.length).trim() || undefined, items: [] });
        top.items = top.frame.blocks[top.frame.blocks.length - 1].items;
        continue;
      }
      continue;
    }
    if (/^end$/i.test(line)) {
      if (stack.length > 1) {
        const closedTop = stack.pop()!;
        if (closedTop.frame?.kind === undefined && openBox) {
          openBox.to = participants.length - 1;
          openBox = null;
          // box pseudo-items are dropped; grouping is positional
        }
      }
      continue;
    }

    m = /^==\s*(.+?)\s*==$/.exec(line);
    if (m) {
      stack[stack.length - 1].items.push({ type: 'divider', text: m[1] });
      rowCounter++;
      continue;
    }

    m = /^Note\s+(left of|right of|over)\s+([^:\s][^:]*)\s*:\s*(.+)$/i.exec(line);
    if (m) {
      stack[stack.length - 1].items.push({
        type: 'note',
        note: {
          over: m[2].split(',').map((s2) => s2.trim()),
          pos: m[1].toLowerCase() as SeqNote['pos'],
          text: m[3].trim(),
        },
      });
      rowCounter++;
      continue;
    }

    m = /^([A-Za-z_][\w]*)([-+]?(?:->>|-->>|-x|-\)|->|-->|--))([-+]?)([A-Za-z_][\w]*)\s*:\s*(.*)$/.exec(line);
    if (m) {
      const [, fromRaw, sig, plusMinus, toRaw, text] = m;
      const fromP = participant(fromRaw);
      const toP = participant(toRaw);
      void fromP; void toP;
      const activateTarget = plusMinus === '+';
      const deactivateSource = plusMinus === '-';
      msgCount++;
      stack[stack.length - 1].items.push({
        type: 'msg',
        msg: {
          from: fromRaw,
          to: toRaw,
          text: text.trim(),
          dotted: sig.startsWith('--'),
          head: sig.endsWith('>>') ? 'filled' : sig.includes('x') ? 'cross' : sig.endsWith(')') ? 'open' : 'none',
          number: autonumber ? autonumber.start + (msgCount - 1) * autonumber.step : undefined,
        },
      });
      rowCounter++;
      if (activateTarget) activate(toRaw);
      if (deactivateSource) deactivate(fromRaw);
      continue;
    }
    // loop/alt bookkeeping verbs and anything unknown: skipped
  }

  // close dangling activations at final row
  for (const [id, openAt] of openActivations) {
    const spans = activationSpans.get(id) ?? [];
    spans.push([openAt, Math.max(rowCounter - 1, openAt)]);
    activationSpans.set(id, spans);
  }
  // drop empty box records
  const realBoxes = boxes.filter((b) => b.to >= b.from);
  return { participants, root, activationSpans, totalRows: rowCounter, autonumber, boxes: realBoxes, title: seqTitle };
}

export function renderSequenceSvg(src: string): string | null {
  const parsed = parseSequence(src);
  if (!parsed || parsed.participants.length === 0) return null;
  const { participants, root, activationSpans, boxes, title } = parsed;

  const colW = participants.map((p) => Math.max(84, p.label.length * 7.4 + 30));
  const colX: number[] = [];
  let acc = PAD + 40;
  for (const w of colW) {
    colX.push(acc + w / 2);
    acc += w + 24;
  }
  const colOf = (id: string): number => {
    const idx = participants.findIndex((p) => p.id === id);
    return idx >= 0 ? colX[idx] : colX[0];
  };
  const W = acc + 16;

  // measure pass
  const MSG_H = 48;
  const NOTE_H = 42;
  const DIV_H = 38;
  const FRAME_HEAD = 34;
  const FRAME_FOOT = 12;
  const BLOCK_LABEL_H = 26;
  function measure(items: SeqNode[]): number {
    let h = 0;
    for (const n of items) {
      if (n.type === 'frame') {
        h += FRAME_HEAD;
        for (let i = 0; i < n.blocks.length; i++) {
          if (i > 0) h += BLOCK_LABEL_H;
          h += measure(n.blocks[i].items);
        }
        h += FRAME_FOOT;
      } else if (n.type === 'divider') h += DIV_H;
      else h += n.type === 'note' ? NOTE_H : MSG_H;
    }
    return h;
  }
  const contentH = measure(root);

  const TOP_H = 44 + (title ? 24 : 0);
  const H = TOP_H + contentH + 36;

  const parts: string[] = [];
  // frame backgrounds collected during drawing, spliced right after the
  // <svg> open tag so they render behind everything AND stay valid XML
  // (parts.unshift put them BEFORE the root element)
  const bg: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}" class="mermaid-svg" role="img" aria-label="sequence diagram">`,
  );
  if (title) {
    parts.push(`<text x="${(W / 2).toFixed(1)}" y="${(TOP_H - 22).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);
  }
  const lineColor = 'var(--border-strong, #6b7280)';
  const surface = 'var(--surface, #fff)';

  // lifelines
  for (let i = 0; i < participants.length; i++) {
    parts.push(
      `<line x1="${colX[i]}" y1="${TOP_H}" x2="${colX[i]}" y2="${H - 20}" stroke="${lineColor}" stroke-dasharray="3 4" opacity="0.55"/>`,
    );
  }
  // participant header boxes (with optional box grouping)
  let bi = 0;
  for (let i = 0; i < participants.length; i++) {
    const inBox = boxes.find((b) => i >= b.from && i <= b.to);
    if (inBox) {
      const lastIdx = Math.min(inBox.to, participants.length - 1);
      const x1 = colX[i] - colW[i] / 2 - 10;
      const x2 = colX[lastIdx] + colW[lastIdx] / 2 + 10;
      parts.push(
        `<rect x="${x1.toFixed(1)}" y="2" width="${(x2 - x1).toFixed(1)}" height="${TOP_H + 8}" rx="6" fill="none" stroke="var(--accent, #4f46e5)" stroke-dasharray="5 4"/>`,
      );
      if (inBox.title) parts.push(`<text x="${(x1 + 6).toFixed(1)}" y="14" font-size="10.5" fill="currentColor">${escapeHtml(inBox.title)}</text>`);
      void bi++;
    }
    const w = colW[i];
    const x = colX[i] - w / 2;
    parts.push(
      `<rect x="${x.toFixed(1)}" y="18" width="${w.toFixed(1)}" height="30" rx="6" fill="${surface}" stroke="var(--accent, #4f46e5)" stroke-width="1.5"/>`,
      `<text x="${colX[i].toFixed(1)}" y="37" text-anchor="middle" font-size="12.5" fill="currentColor">${escapeHtml(participants[i].label)}</text>`,
    );
  }

  const drawHead = (x: number, yy: number, dir: 1 | -1, msg: SeqMessage): string => {
    const c = lineColor;
    if (msg.head === 'filled') return `<path d="M ${x} ${yy} l ${-9 * dir} -4.5 v 9 z" fill="${c}"/>`;
    if (msg.head === 'open') return `<path d="M ${x - 9 * dir} ${yy - 4.5} L ${x} ${yy} L ${x - 9 * dir} ${yy + 4.5}" fill="none" stroke="${c}"/>`;
    if (msg.head === 'cross') return `<path d="M ${x - 8 * dir} ${yy - 5} L ${x + 2 * dir} ${yy + 5} M ${x - 8 * dir} ${yy + 5} L ${x + 2 * dir} ${yy - 5}" stroke="${c}"/>`;
    return '';
  };

  // collect referenced participants per subtree for frame widths
  const colsOfItems = (items: SeqNode[]): number[] => {
    const out: number[] = [];
    const walk = (list: SeqNode[]): void => {
      for (const n of list) {
        if (n.type === 'msg') { out.push(colOf(n.msg.from), colOf(n.msg.to)); }
        else if (n.type === 'note') { for (const o of n.note.over) out.push(colOf(o)); }
        else if (n.type === 'frame') for (const b of n.blocks) walk(b.items);
      }
    };
    walk(items);
    return out.length ? out : [colX[0]];
  };

  const drawItems = (items: SeqNode[], startY: number): number => {
    let y = startY;
    for (const n of items) {
      if (n.type === 'frame') {
        const cols = colsOfItems([n]);
        const fx1 = Math.min(...cols) - 34;
        const fx2 = Math.max(...cols) + 34;
        const innerH = measure(n.blocks.map((b) => ({ items: b.items })).flatMap(() => [])).valueOf();
        void innerH;
        let fy = y;
        const totalFrameH = FRAME_HEAD + n.blocks.reduce((acc2, b, i2) => acc2 + (i2 > 0 ? BLOCK_LABEL_H : 0) + measure(b.items), 0) + FRAME_FOOT;
        fy = y + FRAME_HEAD;
        for (let bi2 = 0; bi2 < n.blocks.length; bi2++) {
          const blk = n.blocks[bi2];
          if (bi2 > 0) {
            parts.push(
              `<line x1="${fx1}" y1="${fy + BLOCK_LABEL_H / 2}" x2="${fx2}" y2="${fy + BLOCK_LABEL_H / 2}" stroke="var(--border, #ccc)" stroke-dasharray="4 3"/>`,
              `<text x="${(fx1 + 8).toFixed(1)}" y="${(fy + BLOCK_LABEL_H / 2 - 3).toFixed(1)}" font-size="11" fill="currentColor">${escapeHtml(blk.label ?? '')}</text>`,
            );
            fy += BLOCK_LABEL_H;
          }
          fy = drawItems(blk.items, fy);
        }
        fy += FRAME_FOOT / 2;
        bg.push(
          `<rect x="${fx1.toFixed(1)}" y="${y.toFixed(1)}" width="${(fx2 - fx1).toFixed(1)}" height="${totalFrameH.toFixed(1)}" rx="6" fill="none" stroke="var(--border, #bbb)" stroke-width="1.2"/>`,
          `<text x="${(fx1 + 10).toFixed(1)}" y="${(y + 14).toFixed(1)}" font-size="11.5" font-weight="600" fill="currentColor">${escapeHtml(`${n.kind}${n.title ? ` [${n.title}]` : ''}`)}</text>`,
        );
        y = fy + FRAME_FOOT / 2;
        continue;
      }
      if (n.type === 'divider') {
        parts.push(
          `<rect x="${PAD}" y="${(y + 6).toFixed(1)}" width="${(W - PAD * 2).toFixed(1)}" height="24" fill="var(--surface-2, #eee)" stroke="var(--border, #ccc)" rx="4"/>`,
          `<text x="${(W / 2).toFixed(1)}" y="${(y + 22).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="600" fill="currentColor">${escapeHtml(n.text)}</text>`,
        );
        y += DIV_H;
        continue;
      }
      if (n.type === 'note') {
        const xs = n.note.over.map(colOf);
        const cxNote = n.note.pos === 'over'
          ? (Math.min(...xs) + Math.max(...xs)) / 2
          : n.note.pos === 'left' ? xs[0] - 70 : xs[0] + 70;
        const tw = Math.max(60, n.note.text.length * 6.4 + 18);
        parts.push(
          `<rect x="${(cxNote - tw / 2).toFixed(1)}" y="${(y + 6).toFixed(1)}" width="${tw.toFixed(0)}" height="26" rx="4" fill="var(--accent-soft, #eef)" stroke="var(--border, #ccc)"/>`,
          `<text x="${cxNote.toFixed(1)}" y="${(y + 23).toFixed(1)}" text-anchor="middle" font-size="11.5" fill="currentColor">${escapeHtml(n.note.text)}</text>`,
        );
        y += NOTE_H;
        continue;
      }
      // message
      const msg = n.msg;
      const x1 = colOf(msg.from);
      const x2 = colOf(msg.to);
      const dash = msg.dotted ? ' stroke-dasharray="4 4"' : '';
      if (msg.from === msg.to) {
        parts.push(
          `<path d="M ${x1} ${(y + 20).toFixed(1)} h 36 v 18 h -30" fill="none" stroke="${lineColor}"${dash}/>`,
          `<text x="${x1 + 44}" y="${(y + 33).toFixed(1)}" font-size="11.5" fill="currentColor">${escapeHtml(msg.text)}</text>`,
        );
      } else {
        const dir: 1 | -1 = x2 > x1 ? 1 : -1;
        const headX = msg.head === 'none' ? x2 : x2 - 2 * dir;
        parts.push(`<line x1="${x1}" y1="${y + 20}" x2="${headX.toFixed(1)}" y2="${y + 20}" stroke="${lineColor}"${dash}/>`);
        parts.push(drawHead(x2, y + 20, dir, msg));
        const label = (msg.number !== undefined ? `${msg.number}. ` : '') + msg.text;
        parts.push(
          `<text x="${((x1 + x2) / 2).toFixed(1)}" y="${(y + 12).toFixed(1)}" text-anchor="middle" font-size="11.5" fill="currentColor">${escapeHtml(label)}</text>`,
        );
      }
      y += MSG_H;
    }
    return y;
  };

  // activation bars drawn before messages: compute their pixel spans from row order.
  // Rows are laid out sequentially over leaves; approximate by mapping row index →
  // proportional position across the content area.
  drawItems(root, TOP_H + 4);
  // frame backgrounds render behind everything: splice them in right after
  // the <svg> open tag (+ title)
  parts.splice(title ? 2 : 1, 0, ...bg);
  const bottomY = H - 24;
  for (const [pid, spans] of activationSpans) {
    const cxAct = colOf(pid);
    for (const [r0, r1] of spans) {
      const y0 = TOP_H + 4 + r0 * ((contentH || 1) / Math.max(parsed.totalRows, 1));
      const y1 = TOP_H + 4 + (r1 + 1) * ((contentH || 1) / Math.max(parsed.totalRows, 1));
      parts.push(
        `<rect x="${(cxAct - 5).toFixed(1)}" y="${y0.toFixed(1)}" width="10" height="${Math.max(14, y1 - y0).toFixed(1)}" rx="3" fill="var(--surface-2, #eee)" stroke="var(--accent, #4f46e5)" opacity="0.9"/>`,
      );
    }
    void bottomY;
  }

  parts.push('</svg>');
  return parts.join('');
}

// ---------------------------------------------------------------------------

// pie charts
// ---------------------------------------------------------------------------

const PIE_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export function renderPieSvg(src: string): string | null {
  if (!/^\s*pie\b/.test(src)) return null;
  let title = '';
  const header = /^pie(?:\s+showData)?(?:\s+title\s+(.*?))?\s*;?\s*$/i.exec(src.split('\n').map((l) => l.trim().replace(/;+\s*$/, '')).find((l) => /^pie\b/.test(l)) ?? '');
  if (header?.[1]) title = header[1].trim();
  const slices: { label: string; value: number }[] = [];
  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+\s*$/, '');
    if (!line || line.startsWith('%%') || /^pie\b/.test(line) || /^showData\b/i.test(line)) continue;
    let m = /^title\s+(.+)$/i.exec(line);
    if (m) {
      title = m[1].trim();
      continue;
    }
    m = /^"([^"]+)"\s*:\s*([\d.]+)$/.exec(line) ?? /^([\w\u00C0-\uFFFF][\w\s-]*?)\s*:\s*([\d.]+)$/.exec(line);
    if (m) slices.push({ label: m[1].trim(), value: parseFloat(m[2]) });
  }
  if (slices.length === 0) return null;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;

  const W = 460;
  const H = Math.max(240, 40 + slices.length * 24);
  const cx = 140;
  const cy = H / 2 + (title ? 8 : 0);
  const r = Math.min(95, H / 2 - 20);

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H.toFixed(0)}" width="${W}" height="${H.toFixed(0)}" class="mermaid-svg" role="img" aria-label="pie chart">`,
  );
  if (title) {
    parts.push(`<text x="${W / 2}" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);
  }

  let angle = -Math.PI / 2;
  slices.forEach((s, i) => {
    const frac = s.value / total;
    const a1 = angle + frac * Math.PI * 2;
    const x0 = cx + r * Math.cos(angle);
    const y0 = cy + r * Math.sin(angle);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = frac > 0.5 ? 1 : 0;
    const color = PIE_COLORS[i % PIE_COLORS.length];
    parts.push(
      `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${color}" stroke="var(--surface, #fff)" stroke-width="1.5"/>`,
    );
    const mid = (angle + a1) / 2;
    if (frac >= 0.04) {
      parts.push(
        `<text x="${(cx + r * 0.62 * Math.cos(mid)).toFixed(1)}" y="${(cy + r * 0.62 * Math.sin(mid) + 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#fff">${Math.round(frac * 100)}%</text>`,
      );
    }
    // legend
    const ly = 36 + i * 24;
    parts.push(
      `<rect x="300" y="${ly}" width="13" height="13" rx="3" fill="${color}"/>`,
      `<text x="320" y="${ly + 11}" font-size="12" fill="currentColor">${escapeHtml(s.label)} — ${s.value}</text>`,
    );
    angle = a1;
  });

  parts.push('</svg>');
  return parts.join('');
}

// ---------------------------------------------------------------------------
// state diagrams
// ---------------------------------------------------------------------------


const ID = '(?:\\[\\*\\]|[\\w\\u00C0-\\uFFFF][\\w\\u00C0-\\uFFFF-]*)'; // Unicode-aware state identifier

export function renderStateSvg(src: string): string | null {
  if (!/^\s*stateDiagram(-v2)?\b/.test(src)) return null;
  let stTitle = '';
  const labels = new Map<string, string>();
  const edges: MermaidGraph['edges'] = [];
  const nodeIds: string[] = [];
  const seen = new Set<string>();
  const pseudoShapes = new Map<string, 'fork' | 'join' | 'diamond'>();
  const compositeMembers = new Map<string, string[]>();
  const externallyReferenced = new Set<string>();

  const ID_RE = new RegExp(ID, 'g');
  const EDGE_RE = new RegExp(`^(\\[\\*\\]|${ID})\\s*-->\\s*(\\[\\*\\]|${ID})(?:\\s*:\\s*(.*))?$`);
  const STATE_AS_RE = new RegExp(`^state\\s+"([^"]*)"\\s+as\\s+(${ID})$`);
  const STATE_RE = new RegExp(`^state\\s+(${ID})$`);
  const STATE_LABEL_RE = new RegExp(`^(${ID})\\s*:\\s*(.+)$`);
  const STATE_PSEUDO_RE = new RegExp(`^state\\s+(${ID})\\s*<<(fork|join|choice)>>`);

  const node = (id: string, _shape?: string): string => {
    if (!seen.has(id)) {
      seen.add(id);
      nodeIds.push(id);
    }
    return id;
  };

  // pass 1 — collect composites & pseudo shapes
  let depth = 0;
  let curComp: string | null = null;
  for (let line of src.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('%%')) continue;
    if (/^stateDiagram(-v2)?\b/.test(line)) continue;

    let m = /^title\s+(.+)$/i.exec(line);
    if (m) { stTitle = m[1].trim(); continue; }

    let pm = STATE_PSEUDO_RE.exec(line);
    if (pm) {
      pseudoShapes.set(pm[1], pm[2] === 'choice' ? 'diamond' : pm[2] as 'fork' | 'join');
      node(pm[1], 'round');
      continue;
    }

    if (/\{\s*$/.test(line)) {
      depth++;
      if (depth === 1) {
        const am = STATE_AS_RE.exec(line) ?? STATE_RE.exec(line) ?? /^(\w+)/.exec(line);
        const id = am?.[2] ?? am?.[1];
        if (id) {
          curComp = id;
          if (!compositeMembers.has(id)) compositeMembers.set(id, []);
          node(id, 'round');
        }
      }
      continue;
    }

    if (depth > 0) {
      if (/^}/.test(line)) { depth--; if (depth === 0) curComp = null; continue; }
      const tm = EDGE_RE.exec(line);
      if (tm && curComp) {
        const members = compositeMembers.get(curComp)!;
        for (const raw of [tm[1], tm[2]]) {
          if (raw !== '[*]' && !members.includes(raw)) members.push(raw);
        }
      }
      continue;
    }

    const em = EDGE_RE.exec(line) ?? STATE_AS_RE.exec(line) ?? STATE_LABEL_RE.exec(line);
    if (em) {
      for (const cand of [em[1], em[2]]) {
        if (cand && compositeMembers.has(cand)) externallyReferenced.add(cand);
      }
    }
  }

  // pass 2 — full parse
  depth = 0;
  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^stateDiagram(-v2)?\b/.test(line)) continue;
    if (STATE_PSEUDO_RE.test(line)) continue;
    if (/^state\s+"[^"]*"\s+as\s+\w+\s*\{/.test(line)) continue;
    if (/\{\s*$/.test(line)) continue;

    let m = STATE_AS_RE.exec(line);
    if (m) {
      labels.set(m[2], m[1]);
      node(m[2], 'round');
      continue;
    }

    m = EDGE_RE.exec(line);
    if (m) {
      const from = m[1] === '[*]' ? node('__start__', 'start') : node(m[1], 'round');
      const to = m[2] === '[*]' ? node('__end__', 'end') : node(m[2], 'round');
      edges.push({ from, to, label: m[3]?.trim() || undefined, style: 'normal', arrow: true });
      continue;
    }

    m = STATE_LABEL_RE.exec(line);
    if (m) {
      if (!labels.has(m[1])) labels.set(m[1], m[2].trim());
      node(m[1], 'round');
      continue;
    }
  }

  if (nodeIds.length === 0) return null;

  const nodes = nodeIds.map((id): MermaidGraph['nodes'][number] => ({
    id,
    label: id === '__start__' || id === '__end__' ? '' : labels.get(id) ?? id,
    shape: id === '__start__' ? 'start' as const
      : id === '__end__' ? 'end' as const
      : pseudoShapes.get(id) ?? 'round' as const,
  }));

  const groups = [...compositeMembers.entries()]
    .filter(([id, members]) => members.length > 0 && !externallyReferenced.has(id))
    .map(([id, members]) => ({ title: labels.get(id) ?? id, members }));

  return renderGraphSvg(
    { direction: 'TB', nodes, edges },
    { title: stTitle || undefined, groups: groups.length ? groups : undefined },
  );
}

// gantt charts
// ---------------------------------------------------------------------------

const DAY_MS = 86_400_000;

function parseGanttDate(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  return Date.UTC(+m[1], +m[2] - 1, +m[3]);
}

function parseDuration(s: string): number | null {
  const m = /^(\d+(?:\.\d+)?)\s*([dwm])$/i.exec(s.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  return unit === 'w' ? n * 7 : unit === 'h' ? n / 24 : n;
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function renderGanttSvg(src: string): string | null {
  if (!/^\s*gantt\b/.test(src)) return null;

  let title = '';
  let section = '';
  let todayMarker: string | null = 'line';
  interface Row {
    kind: 'section';
    label: string;
  }
  interface Bar {
    kind: 'task';
    label: string;
    status: string;
    start: number;
    days: number;
    milestone: boolean;
  }
  type Row2 = Row | Bar;
  const rows: Row2[] = [];
  const placedById = new Map<string, { start: number; days: number }>();

  for (let line of src.split('\n')) {
    line = line.trim().replace(/;+\s*$/, '');
    if (!line || line.startsWith('%%')) continue;
    if (/^gantt\b/.test(line)) continue;

    let m = /^title\s+(.+)$/i.exec(line);
    if (m) { title = m[1].trim(); continue; }
    m = /^(?:todayMarker)\s+(\w+)/i.exec(line);
    if (m) { todayMarker = m[1].toLowerCase() === 'off' ? null : (m[1] === 'on' ? 'line' : m[1]); continue; }
    if (/^(dateFormat|axisFormat|excludes|includes)\b/i.test(line)) continue; // accepted, ISO assumed

    m = /^section\s+(.+)$/i.exec(line);
    if (m) {
      section = m[1].trim();
      rows.push({ kind: 'section', label: section });
      continue;
    }

    const ci = line.indexOf(':');
    if (ci < 0) continue;
    const label = line.slice(0, ci).trim();
    const meta = line.slice(ci + 1).split(',').map((p) => p.trim()).filter(Boolean);
    if (meta.length < 2) continue;

    let status = '';
    let milestone = false;
    let id = '';
    // leading tags until we find the start token
    let i = 0;
    for (; i < meta.length - 2; i++) {
      const p = meta[i];
      if (/^(done|active|crit|crit,done)$/i.test(p)) status = p.toLowerCase();
      else if (/^milestone$/i.test(p)) milestone = true;
      else if (!parseGanttDate(p) && !/^after\s+/i.test(p)) id = p;
      else break;
    }
    const startTok = meta[i] ?? '';
    const durTok = meta[i + 1] ?? '';

    let start: number | null = parseGanttDate(startTok);
    if (start === null && /^after\s+\S+$/i.test(startTok)) {
      const refId = startTok.split(/\s+/)[1];
      const ref = placedById.get(refId) ?? placedById.get(label) ?? undefined;
      if (ref) start = ref.start + Math.max(ref.days, 0) * DAY_MS;
    }
    let days: number | null = parseDuration(durTok);
    if (days === null) {
      const endD = parseGanttDate(durTok);
      if (endD !== null && start !== null) days = Math.max(1, Math.round((endD - start) / DAY_MS));
    }
    if (milestone) { start = start ?? 0; days = 0; }
    if (start === null || days === null) continue;

    const bar: Bar = { kind: 'task', label, status: status.replace(',done', ''), start, days, milestone };
    rows.push(bar);
    if (id) placedById.set(id, bar);

  }

  const tasks = rows.filter((r): r is Bar => r.kind === 'task');
  if (tasks.length === 0) return null;
  const minStart = Math.min(...tasks.map((t) => t.start));
  const maxEnd = Math.max(...tasks.map((t) => t.start + Math.max(t.days, 0) * DAY_MS));
  const totalDays = Math.max(1, Math.ceil((maxEnd - minStart) / DAY_MS));

  const LABEL_W = 190;
  const RIGHT_PAD = 24;
  const dayW = totalDays <= 14 ? 26 : totalDays <= 45 ? 13 : totalDays <= 120 ? 6 : 3;
  const plotW = Math.max(240, totalDays * dayW);
  const W = LABEL_W + plotW + RIGHT_PAD;

  type Section = { kind: 'section'; label: string };
  const H = 34 + rows.reduce((s, r) => s + (r.kind === 'section' ? 34 : 32), 0) + 40 + (title ? 22 : 0);
  const top = (title ? 22 : 0) + 10;
  const xOf = (t: number) => LABEL_W + ((t - minStart) / DAY_MS) * dayW;

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" width="${W.toFixed(0)}" height="${H.toFixed(0)}" class="mermaid-svg" role="img" aria-label="gantt chart">`,
  );
  if (title) {
    parts.push(`<text x="${W / 2}" y="16" text-anchor="middle" font-size="15" font-weight="600" fill="currentColor">${escapeHtml(title)}</text>`);
  }

  // time grid + axis labels
  const stepCandidates = [1, 2, 7, 14, 30, 60];
  const stepDays = stepCandidates.find((s) => totalDays / s <= 10) ?? 90;
  const gridColor = 'var(--border, #e5e7eb)';
  for (let d = 0; d <= totalDays; d += stepDays) {
    const gx = LABEL_W + d * dayW;
    parts.push(`<line x1="${gx.toFixed(1)}" y1="${top}" x2="${gx.toFixed(1)}" y2="${top + H - top - 34}" stroke="${gridColor}" stroke-width="1" opacity="0.6"/>`);
    const dt = new Date(minStart + d * DAY_MS);
    parts.push(
      `<text x="${(gx + 3).toFixed(1)}" y="${top - 4}" font-size="10" fill="var(--text-dim, #888)">${MONTHS_SHORT[dt.getUTCMonth()]} ${dt.getUTCDate()}</text>`,
    );
  }
  if (todayMarker) {
    const today = xOf(Date.now());
    if (today >= LABEL_W && today <= LABEL_W + plotW) {
      parts.push(`<line x1="${today.toFixed(1)}" y1="${top}" x2="${today.toFixed(1)}" y2="${top + H - top - 34}" stroke="#ef4444" stroke-width="1.5" opacity="0.8"/>`);
    }
  }

  let y = top;
  const STATUS_COLORS: Record<string, string> = {
    done: '#10b981',
    active: '#3b82f6',
    crit: '#ef4444',
  };

  for (const r of rows) {
    if (r.kind === 'section') {
      y += 8;
      parts.push(`<text x="8" y="${y + 14}" font-size="12" font-weight="700" fill="currentColor">${escapeHtml(r.label)}</text>`);
      y += 26;
      continue;
    }
    const by = y + 6;
    if (r.milestone) {
      const mx = xOf(r.start);
      const s = 9;
      parts.push(
        `<path d="M ${mx.toFixed(1)} ${(by + 4).toFixed(1)} l ${s} ${-s} l ${s} ${s} l ${-s} ${s} z" fill="#0ea5e9" stroke="none"/>`,
        `<text x="${((mx + s) + 4).toFixed(1)}" y="${(by + 11).toFixed(1)}" font-size="11" fill="currentColor">${escapeHtml(r.label)}</text>`,
      );
    } else {
      const bx = xOf(r.start);
      const bw = Math.max(4, r.days * dayW);
      const color =
        r.status.includes('crit') ? (STATUS_COLORS.crit)
        : r.status.includes('done') ? (STATUS_COLORS.done)
        : r.status.includes('active') ? (STATUS_COLORS.active)
        : '#818cf8';
      parts.push(
        `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="18" rx="${Math.min(9, bw / 2)}" fill="${color}" opacity="${r.status.includes('crit') ? '1' : '0.92'}"/>`,
        `<text x="${(LABEL_W - 8).toFixed(1)}" y="${(by + 13).toFixed(1)}" text-anchor="end" font-size="12" fill="currentColor">${escapeHtml(r.label)}</text>`,
      );
    }
    y += 32;
  }

  parts.push('</svg>');
  return parts.join('');
}
