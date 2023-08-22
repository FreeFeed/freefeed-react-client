/* global CONFIG */
import {
  withText,
  combine,
  hashTags,
  emails,
  mentions,
  foreignMentions,
  links,
  arrows,
  Link as TLink,
  Arrows as TArrows,
  Token,
} from 'social-text-tokenizer';

import { byRegexp, wordAdjacentChars } from 'social-text-tokenizer/cjs/lib';
import { checkboxParser } from './initial-checkbox';
import {
  EndSpoiler,
  StartSpoiler,
  tokenizerEndSpoiler,
  tokenizerStartSpoiler,
  validateSpoilerTags,
} from './spoiler-tokens';

const {
  textFormatter: { tldList, foreignMentionServices },
  siteDomains,
} = CONFIG;

const shortLinkRe = /\/[a-z\d-]{3,35}\/[\da-f]{6,10}(?:#[\da-f]{4,6})?/gi;
const shortLinkExactRe = /^\/[a-z\d-]{3,35}\/[\da-f]{6,10}(?:#[\da-f]{4,6})?$/i;

export class Link extends TLink {
  localDomains = [];
  hostname = null;
  path = '/';
  link;
  isShort = false;

  constructor(link, localDomains) {
    super(link.offset, link.text);
    this.link = link;
    this.localDomains = localDomains;
    this.isShort = shortLinkExactRe.test(link.text);

    const m = this.href.match(/^https?:\/\/([^/]+)(.*)/i);
    if (m) {
      this.hostname = m[1].toLowerCase();
      this.path = m[2] || '/';
    } else if (this.isShort) {
      this.path = link.text;
    }
  }

  get pretty() {
    if (this.isShort || (this.isLocal && shortLinkExactRe.test(this.path))) {
      return this.path;
    }
    return super.pretty;
  }

  get isLocal() {
    // Short links are always local
    if (this.isShort) {
      return true;
    }
    const p = this.localDomains.indexOf(this.hostname);
    if (p === -1) {
      return false;
    } else if (p === 0) {
      // First domain in localDomains list is the domain of main site.
      // These links are always local.
      return true;
    }

    // Other domains in localDomains list are alternative frontends or mirrors.
    // Such links should be treated as remote if they lead to the domain root.
    return this.path !== '/';
  }

  get localURI() {
    return this.path;
  }
}

export class Arrows extends TArrows {
  constructor(token) {
    super(token.offset, token.text);
  }

  get level() {
    if (/\d/.test(this.text)) {
      return Number(this.text.replace(/\D/g, ''));
    }
    return this.text.length;
  }
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

export class RedditLink extends TLink {
  get href() {
    let path = this.text;
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }
    return `https://www.reddit.com${path}`;
  }
}

const redditLinks = () => {
  const beforeChars = new RegExp(`[${wordAdjacentChars.clone().removeChars('/')}]`);
  const afterChars = new RegExp(`[${wordAdjacentChars.clone().removeChars('/')}]`);
  return byRegexp(/\/?r\/[A-Za-z\d]\w{1,20}/g, (offset, text, match) => {
    const charBefore = match.input.charAt(offset - 1);
    const charAfter = match.input.charAt(offset + text.length);
    if (charBefore !== '' && !beforeChars.test(charBefore)) {
      return null;
    }
    if (charAfter !== '' && !afterChars.test(charAfter)) {
      return null;
    }

    return new RedditLink(offset, text);
  });
};

const shortLinks = () => {
  const beforeChars = new RegExp(`[${wordAdjacentChars.clone().removeChars('/')}]`);
  const afterChars = new RegExp(`[${wordAdjacentChars.clone().removeChars('/')}]`);
  return byRegexp(shortLinkRe, (offset, text, match) => {
    const charBefore = match.input.charAt(offset - 1);
    const charAfter = match.input.charAt(offset + text.length);
    if (charBefore !== '' && !beforeChars.test(charBefore)) {
      return null;
    }
    if (charAfter !== '' && !afterChars.test(charAfter)) {
      return null;
    }

    return new TLink(offset, text);
  });
};

export class LineBreak extends Token {}
export class ParagraphBreak extends Token {}

/**
 * @param {string} text
 * @returns {(LineBreak | ParagraphBreak)[]}
 */
export function lineBreaks(text) {
  return [...text.matchAll(/[^\S\n]*\n\s*/g)].map((m) => {
    if (m[0].indexOf('\n') === m[0].lastIndexOf('\n')) {
      return new LineBreak(m.index, m[0]);
    }
    return new ParagraphBreak(m.index, m[0]);
  });
}

const tokenize = withText(
  validateSpoilerTags(
    combine(
      hashTags(),
      emails(),
      mentions(),
      foreignMentions(),
      links({ tldRe }),
      shortLinks(),
      redditLinks(),
      arrows(/\u2191+|\^([1-9]\d*|\^*)/g),
      tokenizerStartSpoiler,
      tokenizerEndSpoiler,
      checkboxParser,
      lineBreaks,
    ),
  ),
);

const enhanceToken = (token) => {
  if (token instanceof TLink) {
    return new Link(token, siteDomains);
  } else if (token instanceof TArrows) {
    return new Arrows(token);
  }
  return token;
};

export const parseText = (text) => tokenize(text).map(enhanceToken);

export function getFirstLinkToEmbed(text) {
  let isInSpoiler = false;

  const firstLink = parseText(text).find((token) => {
    if (token instanceof StartSpoiler) {
      isInSpoiler = true;
    }

    if (token instanceof EndSpoiler) {
      isInSpoiler = false;
    }

    if (!(token instanceof Link) || isInSpoiler) {
      return false;
    }

    return (
      !token.isLocal && /^https?:\/\//i.test(token.text) && text.charAt(token.offset - 1) !== '!'
    );
  });

  return firstLink ? firstLink.href : undefined;
}

export const shortCodeToService = {};
for (const srv of foreignMentionServices) {
  for (const code of srv.shortCodes) {
    shortCodeToService[code] = srv;
  }
}
