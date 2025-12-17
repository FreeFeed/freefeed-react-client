const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * During normalization, only alphanumeric characters are left for each
 * grapheme. If a grapheme does not contain any such characters, it is skipped.
 *
 * The purpose of Mapping is to highlight matching characters. It maps the
 * code-point indices of the normalized string to the code-point indices of the
 * _graphemes_ of the input string.  Non-letter graphemes are not highlighted,
 * so they do not appear in the mapping.
 *
 * Example:
 * ```
 * "ﬁn (lánd)" (á has two codepoints) -> "finland" + reverse mapping:
 * [[0], [0], [1], [4], [5, 6], [7], [8]]
 * f -> ﬁ [0]
 * i -> ﬁ [0] // two output codepoints correspond to the same input grapheme
 * n -> n [1]
 * l -> l [4]
 * a -> á [5, 6] // input grapheme consists of 2 codepoints
 * n -> n [7]
 * d -> d [8]
 * ```
 *
 * @param {string} input
 * @returns {{ output: string, mapping: number[][] }}
 */
export function normalizeHashtag(input) {
  let output = '';
  const mapping = [];
  for (const { segment, index } of graphemeSegmenter.segment(input)) {
    const letters = segment
      .normalize('NFKD')
      // Preserve cyrillic 'short i' (convert it back to NFC)
      .replace(/\u0418\u0306/g, '\u0419')
      .replace(/\u0438\u0306/g, '\u0439')
      .replace(/[^\p{L}\p{N}]+/gu, '')
      .normalize('NFC')
      .toLowerCase();

    if (!letters) {
      continue;
    }

    const inputIndices = Array.from(segment, (_, i) => index + i);
    for (const letter of letters) {
      output += letter;
      mapping.push(inputIndices);
    }
  }

  return { output, mapping };
}
