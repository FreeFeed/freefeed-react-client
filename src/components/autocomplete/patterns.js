import { Characters } from 'social-text-tokenizer/utils';

// There should be no alphanumeric characters right before the "@" (to exclude
// email-like strings)
export const defaultUsernameAnchor = /(^|[^a-z\d])@/gi;
export const defaultHashtagAnchor = /(^|[^a-z\d])#/gi;

export const usernamePattern = /^[a-z\d-]+/i;

const nonHashtagChars = new Characters(
  [0x0000, 0x0020], // Non-printable
  0x007f, // Non-printable
  [0x0080, 0x00a0], // Non-printable
  [0x0021, 0x002f], // Space and punctuation
  [0x003a, 0x0040], // Punctuation
  [0x005b, 0x0060], // Punctuation
  [0x007b, 0x007e], // Punctuation
  [0x00a1, 0x00bf],
  0x00d7,
  0x00f7,
  [0x2000, 0x206f],
);

export const hashtagPattern = new RegExp(
  `^([^${nonHashtagChars}]+(?:[_-][^${nonHashtagChars}]+)*)`,
);
