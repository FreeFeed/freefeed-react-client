/**
 * Minimal YAML-subset frontmatter: `key: value` lines, inline lists `[a, b]`,
 * optional quotes. Enough for note metadata; no external parser needed.
 */

export type MetaValue = string | string[];
export type Meta = Record<string, MetaValue>;

const DELIM = /^\s*---\s*$|^\s*\.\.\.\s*$/;

/** Parse leading frontmatter from a document. Returns null if absent/invalid. */
export function parseFrontmatter(text: string): { meta: Meta | null; body: string } {
  const lines = text.split('\n');
  if (lines[0] === undefined || !DELIM.test(lines[0])) return { meta: null, body: text };

  let close = -1;
  for (let i = 1; i < Math.min(lines.length, 60); i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    if (DELIM.test(l)) {
      close = i;
      break;
    }
    if (!/^[A-Za-z_][\w-]*:/.test(l)) return { meta: null, body: text }; // not frontmatter-shaped
  }
  if (close === -1) return { meta: null, body: text };

  const meta: Meta = {};
  for (let i = 1; i < close; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    meta[m[1]] = parseValue(m[2].trim());
  }
  return { meta, body: lines.slice(close + 1).join('\n').replace(/^\n+/, '') };
}

function parseValue(raw: string): MetaValue {
  if (raw.startsWith('[') && raw.endsWith(']')) {
    const inner = raw.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((p) => unquote(p.trim())).filter(Boolean);
  }
  return unquote(raw);
}

function unquote(s: string): string {
  if (s.length >= 2 && ((s[0] === '"' && s.endsWith('"')) || (s[0] === "'" && s.endsWith("'")))) {
    return s.slice(1, -1).replace(/\\(["'\\])/g, '$1');
  }
  return s;
}

export interface MetaToSerialize extends Record<string, MetaValue | undefined> {}

/** Serialize a metadata object into the frontmatter block (without body). */
export function serializeFrontmatter(meta: MetaToSerialize): string {
  const lines = ['---'];
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      lines.push(`${key}: ${value.length ? `[${value.join(', ')}]` : '[]'}`);
    } else if (value !== '') {
      lines.push(`${key}: ${quoteIfNeeded(String(value))}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

function quoteIfNeeded(s: string): string {
  if (/[:\[\],#]/.test(s) || s !== s.trim()) return `"${s.replace(/"/g, '\\"')}"`;
  return s;
}
