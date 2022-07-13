export function normalizeHashtag(text) {
  return (
    text
      .normalize('NFKD')
      // Preserve cyrillic 'short i' (convert it back to NFC)
      .replace(/\u0418\u0306/g, '\u0419')
      .replace(/\u0438\u0306/g, '\u0439')
      .replace(/\p{M}/gu, '') // remove unicode Marks
      .normalize('NFC')
      .toLowerCase()
      // replace ukrainian CYRILLIC SMALL LETTER GHE WITH UPTURN by CYRILLIC SMALL LETTER GHE
      .replace(/\u0491/g, '\u0433')
      .replace(/[_-]/g, '')
  ); // join parts of hashtag to ignore separators;
}
