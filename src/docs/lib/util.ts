/** Small pure helpers shared by core + tests. */

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

let counter = 0;

/** Uniquish id: crypto when available, otherwise time+random (pure TS fallback). */
export function uid(): string {
  const g: unknown = (globalThis as Record<string, unknown>).crypto;
  if (g && typeof (g as { randomUUID?: () => string }).randomUUID === 'function') {
    try {
      return ((g as { randomUUID: () => string }).randomUUID() ?? '').replace(/-/g, '').slice(0, 12);
    } catch {
      /* fall through */
    }
  }
  counter = (counter + 1) % 46_656;
  let s = '';
  const rand = Math.random().toString(36).slice(2);
  for (let i = 0; i < 9; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return Date.now().toString(36) + counter.toString(36).padStart(2, '0') + rand.slice(0, 4);
}

export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return s || 'note';
}

/** Compact human timestamp for UI chrome ("Mar 4, 15:02"). */
export function formatTime(ts: number): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** ISO timestamp for exports. */
export function isoTime(ts: number): string {
  return new Date(ts).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Normalize a tag name (lowercase, trimmed, stray punctuation removed). */
export function normalizeTag(raw: string): string {
  const t = raw
    .trim()
    .toLowerCase()
    .replace(/^#+/, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
  return /^[a-z0-9][a-z0-9_-]*$/.test(t) ? t : '';
}

/** Split a tag input (comma separated) into clean unique tags. */
export function parseTagInput(raw: string): string[] {
  const out = new Set<string>();
  for (const part of raw.split(',')) {
    const t = normalizeTag(part);
    if (t) out.add(t);
  }
  return [...out];
}
