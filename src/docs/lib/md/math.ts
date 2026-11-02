/**
 * Mini LaTeX math → HTML renderer (pure TS, no dependencies).
 *
 * Typesets a practical subset: superscripts/subscripts (^, _), fractions
 * (\frac), square roots (\sqrt), Greek letters, common operators/arrows,
 * function names (\sin …), \text{…}, and brace groups. Unknown commands
 * degrade gracefully to their literal names, and everything is escaped —
 * the output can never inject markup.
 */

import { escapeHtml } from './inline.js';

const SYMBOLS: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
  tau: 'τ', upsilon: 'υ', phi: 'φ', varphi: 'ϕ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
  Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', ast: '∗', circ: '∘',
  leq: '≤', le: '≤', geq: '≥', ge: '≥', neq: '≠', ne: '≠', approx: '≈',
  equiv: '≡', sim: '∼', simeq: '≃', cong: '≅', propto: '∝', ll: '≪', gg: '≫',
  infty: '∞', partial: '∂', nabla: '∇', forall: '∀', exists: '∃', nexists: '∄',
  in: '∈', notin: '∉', ni: '∋', subset: '⊂', supset: '⊃', subseteq: '⊆',
  supseteq: '⊇', cup: '∪', cap: '∩', emptyset: '∅', varnothing: '∅',
  rightarrow: '→', leftarrow: '←', Rightarrow: '⇒', Leftarrow: '⇐',
  leftrightarrow: '↔', Leftrightarrow: '⇔', mapsto: '↦', uparrow: '↑',
  downarrow: '↓', to: '→', gets: '←',
  sum: '∑', prod: '∏', coprod: '∐', int: '∫', iint: '∬', iiint: '∭',
  oint: '∮', sqrtsym: '√', angle: '∠', perp: '⊥', parallel: '∥',
  therefore: '∴', because: '∵', prime: '′', degree: '°', ell: 'ℓ',
  aleph: 'ℵ', hbar: 'ℏ', Re: 'ℜ', Im: 'ℑ', wp: '℘',
  ldots: '…', cdots: '⋯', vdots: '⋮', ddots: '⋱',
  langle: '⟨', rangle: '⟩', lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋',
  quad: '\u2003', qquad: '\u2003\u2003',
};

const FUNCTIONS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh', 'log', 'ln', 'lg', 'exp', 'det', 'dim', 'deg',
  'max', 'min', 'sup', 'inf', 'lim', 'gcd', 'mod', 'arg', 'Pr', 'hom',
]);

/** Symbols that get thin spacing on both sides (binary operators/relations). */
const BIN_SYMBOLS = new Set([
  'times', 'cdot', 'div', 'pm', 'mp', 'leq', 'le', 'geq', 'ge', 'neq', 'ne',
  'approx', 'equiv', 'sim', 'simeq', 'cong', 'propto', 'll', 'gg',
  'in', 'notin', 'subset', 'supset', 'subseteq', 'supseteq', 'cup', 'cap',
  'rightarrow', 'leftarrow', 'to', 'gets', 'leftrightarrow', 'Leftrightarrow',
  'Rightarrow', 'Leftarrow', 'mapsto',
]);

/** Render a TeX math string into styled HTML. */
export function renderMathHtml(tex: string): string {
  try {
    return new MathParser(tex).parseSequence(undefined);
  } catch {
    return escapeHtml(tex); // malformed input → show it verbatim
  }
}

class MathParser {
  private i = 0;
  constructor(private src: string) {}

  /** Parse atoms until `stop` character or end of input. */
  parseSequence(stop?: string): string {
    const tokens: string[] = [];
    for (;;) {
      this.skipSpace();
      if (this.eof()) break;
      const c = this.peek();
      if (stop && c === stop) break;
      if (c === '^' || c === '_') {
        this.i++;
        const script = this.parseAtom().html;
        const base = tokens.pop() ?? '';
        tokens.push(c === '^' ? `${base}<sup>${script}</sup>` : `${base}<sub>${script}</sub>`);
        continue;
      }
      if (stop && c === '}') throw new Error('unexpected }');
      const atom = this.parseAtom();
      if (atom.html !== '') tokens.push(atom.bin ? ` ${atom.html} ` : atom.html);
    }
    return tokens.join('').trim();
  }

  private parseAtom(): { html: string; bin: boolean } {
    this.skipSpace();
    if (this.eof()) return { html: '', bin: false };
    const c = this.peek();

    if (c === '{') {
      this.i++;
      const inner = this.parseSequence('}');
      this.expect('}');
      return { html: inner, bin: false };
    }

    if (c === '\\') {
      this.i++;
      let name = '';
      while (!this.eof() && /[a-zA-Z]/.test(this.peek())) name += this.next();
      if (name === '') {
        // escaped punctuation and spacing commands
        const ch = this.next();
        return { html: ch === ',' || ch === ';' || ch === ':' ? ' ' : escapeHtml(ch), bin: false };
      }
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const a = this.parseAtom().html;
        const b = this.parseAtom().html;
        return { html: `<span class="mfrac"><span>${a}</span><span>${b}</span></span>`, bin: false };
      }
      if (name === 'sqrt') {
        this.skipSpace();
        if (this.peek() === '[') {
          while (!this.eof() && this.next() !== ']') { /* optional root degree */ }
        }
        const a = this.parseAtom().html;
        return { html: `<span class="msqrt">√<span class="mrad">${a}</span></span>`, bin: false };
      }
      if (name === 'text' || name === 'mathrm' || name === 'textrm' || name === 'operatorname') {
        const a = this.parseAtom().html;
        return { html: `<span class="mtext">${a}</span>`, bin: false };
      }
      if (name === 'left' || name === 'right') {
        this.skipSpace();
        const d = this.next(); // the delimiter itself
        return { html: escapeHtml(d === '.' ? '' : d), bin: false };
      }
      if (BIN_SYMBOLS.has(name)) return { html: SYMBOLS[name], bin: true };
      if (SYMBOLS[name] !== undefined) return { html: SYMBOLS[name], bin: false };
      if (FUNCTIONS.has(name)) return { html: `<span class="mtext">${name}</span>`, bin: false };
      return { html: escapeHtml(name), bin: false }; // unknown command → literal name
    }

    // plain character
    this.i++;
    return { html: escapeHtml(c), bin: '+-=<>'.includes(c) };
  }

  // -- cursor helpers -------------------------------------------------------
  private eof(): boolean {
    return this.i >= this.src.length;
  }
  private peek(): string {
    return this.src[this.i];
  }
  private next(): string {
    return this.src[this.i++];
  }
  private skipSpace(): void {
    while (!this.eof() && /\s/.test(this.peek())) this.i++;
  }
  private expect(ch: string): void {
    if (this.peek() !== ch) throw new Error(`expected ${ch}`);
    this.i++;
  }
}
