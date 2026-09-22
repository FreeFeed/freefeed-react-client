/**
 * Per-block HTML renderer — one block at a time (not the full document).
 * Vendored from md-notes, returns inner HTML for a single BlockNode.
 */
import type { BlockNode } from './md/blocks.js';
import { renderInline, escapeHtml as escapeText } from './md/inline.js';
import type { InlineContext } from './md/inline.js';
import { renderMermaidSvg } from './md/mermaid.js';
import { renderMathHtml } from './md/math.js';
import { highlightCode, isHighlightable } from './md/highlight.js';

function slugForHeading(text: string): string {
  return text.replace(/[`*_~[\]()#!]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'heading';
}

function escapeAttrId(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function alignCls(a: string | null): string {
  return a ? ` class="${a}"` : '';
}

type RenderCtx = InlineContext & { ids?: Set<string> };

export function blockHtml(block: BlockNode, opts: RenderCtx = {}): string {
  const ids = opts.ids ?? new Set<string>();
  switch (block.type) {
    case 'heading': {
      const lvl = Math.min(6, Math.max(1, block.level));
      if (!block.id) {
        const base = slugForHeading(block.text);
        let id = base;
        let k = 2;
        while (ids.has(id)) id = `${base}-${k++}`;
        ids.add(id);
        block.id = id;
      }
      return `<h${lvl} id="${escapeAttrId(block.id)}">${renderInline(block.text, opts)}</h${lvl}>`;
    }
    case 'paragraph': {
      let html = '';
      for (let k = 0; k < block.lines.length; k++) {
        const l = block.lines[k];
        if (k > 0) {
          const prev = block.lines[k - 1];
          html += /[\\]$/.test(prev) || /[ \t]{2}$/.test(prev) ? '<br>' : ' ';
        }
        html += renderInline(l.endsWith('\\') ? l.slice(0, -1) : l, opts);
      }
      return `<p>${html}</p>`;
    }
    case 'code':
      if (/^(mermaid|stateDiagram(-v2)?)$/i.test(block.lang)) {
        const svg = renderMermaidSvg(block.code);
        if (svg) return `<div class="doc-mermaid-view">${svg}</div>`;
        return `<div class="doc-mermaid" data-lang="${block.lang}">${escapeText(block.code)}</div>`;
      }
      const hl = block.lang && isHighlightable(block.lang) ? highlightCode(block.code, block.lang) : '';
      return `<pre><code>${hl || escapeText(block.code)}</code></pre>`;
    case 'math':
      return `<div class="doc-math-block" title="${escapeAttrId(block.tex)}">${renderMathHtml(block.tex)}</div>`;
    case 'dl': {
      const parts: string[] = ['<dl class="doc-dl">'];
      for (const e of block.entries) {
        for (const t of e.terms) parts.push(`<dt>${renderInline(t, opts)}</dt>`);
        for (const d of e.defs) parts.push(`<dd>${d.map((l) => renderInline(l, opts)).join(' ')}</dd>`);
      }
      parts.push('</dl>');
      return parts.join('');
    }
    case 'quote':
      return `<blockquote>${block.children.map((c) => blockHtml(c, { ...opts, ids })).join('')}</blockquote>`;
    case 'list': {
      const tag = block.ordered ? 'ol' : 'ul';
      const lis = block.items.map((it) => {
        const inner = it.blocks.map((b) => blockHtml(b, { ...opts, ids })).join('');
        if (it.task) {
          return `<li class="doc-task"><input type="checkbox" class="doc-task-check"${it.checked ? ' checked' : ''}> ${inner}</li>`;
        }
        return `<li>${inner}</li>`;
      }).join('');
      return `<${tag} class="doc-list">${lis}</${tag}>`;
    }
    case 'table':
      return `<table>${[
        '<thead><tr>',
        ...block.header.map((h, i) => `<th${alignCls(block.aligns[i])}>${renderInline(h, opts)}</th>`),
        '</tr></thead><tbody>',
        ...block.rows.map((r) => `<tr>${r.map((cell, i) => `<td${alignCls(block.aligns[i])}>${renderInline(cell, opts)}</td>`).join('')}</tr>`),
        '</tbody>',
      ].join('')}</table>`;
    case 'hr':
      return '';
  }
}