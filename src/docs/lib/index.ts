/**
 * Markdown rendering library — vendored from md-notes.
 * Pure TypeScript, zero runtime dependencies.
 *
 * Parser + renderer with support for:
 * - GFM tables, task lists, definition lists
 * - Fenced code blocks with syntax highlighting
 * - Math ($$ ... $$)
 * - Mermaid diagrams (flowcharts, sequence, gantt, class, state, pie, git, mindmap, er, journey, quadrant, sankey, c4, xychart, timeline)
 * - Footnotes, link references
 * - Injection-safe HTML output
 */

import { parseBlocks, renderBlocksHtml, extractDefinitions } from './md/blocks.js';
import type { BlockNode, RenderOptions } from './md/blocks.js';
import { renderMathHtml } from './md/math.js';
import { renderMermaidSvg } from './md/mermaid.js';
import { parseFrontmatter } from './frontmatter.js';
import type { Meta } from './frontmatter.js';

export interface ParsedDoc {
  meta: Meta | null;
  blocks: BlockNode[];
  refs: Map<string, { url: string; title?: string }>;
  footnotes: Map<string, string[]>;
}

export function parseMarkdown(source: string): ParsedDoc {
  const { meta, body } = parseFrontmatter(source);
  const defs = extractDefinitions(body);
  return {
    meta,
    blocks: parseBlocks(defs.cleaned),
    refs: defs.refs,
    footnotes: defs.footnotes,
  };
}

export function renderHtml(source: string, opts?: RenderOptions): string {
  const doc = parseMarkdown(source);
  return renderBlocksHtml(doc.blocks, opts);
}

export { renderBlocksHtml, parseBlocks, renderMathHtml, renderMermaidSvg };
export type { BlockNode, RenderOptions, Meta };