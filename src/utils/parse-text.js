/* global CONFIG */
import {
  withTexts,
  combine,
  hashtags,
  emails,
  mentions,
  foreignMentions,
  links,
  arrows,
  LINK,
} from 'social-text-tokenizer';

import { linkHref } from 'social-text-tokenizer/prettifiers';
import { makeToken, reTokenizer, wordAdjacentChars } from 'social-text-tokenizer/utils';
import { withCharsAfter, withCharsBefore, withFilters } from 'social-text-tokenizer/filters';
import { checkboxParser } from './initial-checkbox';
import { SPOILER_END, SPOILER_START, spoilerTags, validateSpoilerTags } from './spoiler-tokens';

const {
  textFormatter: { tldList, foreignMentionServices },
  siteDomains,
} = CONFIG;

const shortLinkRe = /\/[a-z\d-]{3,35}\/[\da-f]{6,10}(?:#[\da-f]{4,6})?/gi;
const shortLinkExactRe = /^\/[a-z\d-]{3,35}\/[\da-f]{6,10}(?:#[\da-f]{4,6})?$/i;

/**
 * @param {string} text
 * @param {string[]} localDomains
 * @returns {boolean}
 */
export function isLocalLink(text, localDomains = siteDomains) {
  let url;
  try {
    url = new URL(linkHref(text));
  } catch {
    return false;
  }

  const p = localDomains.indexOf(url.host);
  if (p === -1) {
    return false;
  } else if (p === 0) {
    // First domain in localDomains list is the domain of main site.
    // These links are always local.
    return true;
  }

  // Other domains in localDomains list are alternative frontends or mirrors.
  // Such links should be treated as remote if they lead to the domain root.
  return url.pathname + url.search !== '/';
}

/**
 * @param {string} text - Part of URL without origin (i.e. /path?query#hash)
 * @returns {boolean}
 */
export function isShortLink(text) {
  return shortLinkExactRe.test(text);
}

export function trimOrigin(text) {
  let url;
  try {
    url = new URL(linkHref(text));
  } catch {
    return text;
  }
  return url.pathname + url.search + url.hash;
}

export function arrowsLevel(text) {
  if (/\d/.test(text)) {
    return Number(text.replace(/\D/g, ''));
  }
  return text.length;
}

const tldRe = [...tldList]
  // Putting the longest TLDs first to capture them before their substrings.
  // Example pairs: DEV / DE, PLACE / PL
  .sort((a, b) => {
    if (a.length > b.length) {
      return -1;
    } else if (a.length < b.length) {
      return 1;
    } else if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    }
    return 0;
  })
  .join('|');

export const LINE_BREAK = 'LINE_BREAK';
export const PARAGRAPH_BREAK = 'PARAGRAPH_BREAK';
export const REDDIT_LINK = 'REDDIT_LINK';
export const SHORT_LINK = 'SHORT_LINK';

const redditLinks = withFilters(
  reTokenizer(/\/?r\/[A-Za-z\d]\w{1,20}/g, makeToken(REDDIT_LINK)),
  withCharsBefore(wordAdjacentChars.withoutChars('/')),
  withCharsAfter(wordAdjacentChars.withoutChars('/')),
);

export function redditLinkHref(text) {
  if (!text.startsWith('/')) {
    text = `/${text}`;
  }
  return `https://www.reddit.com${text}`;
}

const shortLinks = withFilters(
  reTokenizer(shortLinkRe, makeToken(SHORT_LINK)),
  withCharsBefore(wordAdjacentChars.withoutChars('/')),
  withCharsAfter(wordAdjacentChars.withoutChars('/')),
);

export const lineBreaks = reTokenizer(/[^\S\n]*\n\s*/g, (offset, text) => {
  if (text.indexOf('\n') === text.lastIndexOf('\n')) {
    return makeToken(LINE_BREAK)(offset, text);
  }
  return makeToken(PARAGRAPH_BREAK)(offset, text);
});

export const parseText = withTexts(
  validateSpoilerTags(
    combine(
      hashtags(),
      emails(),
      mentions(),
      foreignMentions(),
      links({ tldRe }),
      arrows(/\u2191+|\^([1-9]\d*|\^*)/g),
      shortLinks,
      redditLinks,
      spoilerTags,
      checkboxParser,
      lineBreaks,
    ),
  ),
);

export function getFirstLinkToEmbed(text) {
  let isInSpoiler = false;

  const firstLink = parseText(text).find((token) => {
    if (token.type === SPOILER_START) {
      isInSpoiler = true;
    }

    if (token.type === SPOILER_END) {
      isInSpoiler = false;
    }

    if (isInSpoiler || token.type !== LINK) {
      return false;
    }

    return (
      !isLocalLink(token.text) &&
      /^https?:\/\//i.test(token.text) &&
      text.charAt(token.offset - 1) !== '!'
    );
  });

  return firstLink ? linkHref(firstLink.text) : undefined;
}

export const shortCodeToService = {};
for (const srv of foreignMentionServices) {
  for (const code of srv.shortCodes) {
    shortCodeToService[code] = srv;
  }
}
