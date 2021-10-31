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
} from 'social-text-tokenizer';

import {
  tokenizerStartSpoiler,
  tokenizerEndSpoiler,
  StartSpoiler,
  EndSpoiler,
} from './spoiler-tokens';

const {
  textFormatter: { tldList, foreignMentionServices },
  siteDomains,
} = CONFIG;

export class Link extends TLink {
  localDomains = [];
  hostname = null;
  path = '/';

  constructor(link, localDomains) {
    super(link.offset, link.text);

    this.localDomains = localDomains;

    const m = this.href.match(/^https?:\/\/([^/]+)(.*)/i);
    if (m) {
      this.hostname = m[1].toLowerCase();
      this.path = m[2] || '/';
    }
  }

  get isLocal() {
    const p = this.localDomains.indexOf(this.hostname);
    if (p === -1) {
      return false;
    } else if (p === 0) {
      // First domain in localDomains list is the domain of main site.
      // These links are always local.
      return true;
    }

    // Other domains in localDomains list are alternative frontends or mirrors.
    // Such links should be treated as remote if theay lead to the domain root.
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

// Make sure that the list of tokens contains only
// valid pairs of StartSpoiler/EndSpoiler tokens
const validateSpoilerTags = (tokenizer) => {
  return function (text) {
    const validated = [];
    let startSpoilerIndex = -1;
    const tokens = tokenizer(text);

    tokens.forEach((token, i) => {
      if (token instanceof StartSpoiler) {
        if (startSpoilerIndex !== -1) {
          // previous StartSpoiler is invalid
          validated[startSpoilerIndex] = null;
        }
        startSpoilerIndex = i;
        validated.push(token);
      } else if (token instanceof EndSpoiler) {
        if (startSpoilerIndex !== -1) {
          startSpoilerIndex = -1;
          validated.push(token);
        }
      } else {
        validated.push(token);
      }
    });

    if (startSpoilerIndex !== -1) {
      // un-closed StartSpoiler
      validated[startSpoilerIndex] = null;
    }

    return validated.filter(Boolean);
  };
};

const tokenize = withText(
  validateSpoilerTags(
    combine(
      hashTags(),
      emails(),
      mentions(),
      foreignMentions(),
      links({ tldRe }),
      arrows(/\u2191+|\^([1-9]\d*|\^*)/g),
      tokenizerStartSpoiler,
      tokenizerEndSpoiler,
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
