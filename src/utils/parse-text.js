import { URL as nodeURL } from 'url';
import { includes } from 'lodash';
import {
  withText,
  combine,
  hashTags,
  emails,
  mentions,
  links,
  arrows,
  Link as TLink,
} from 'social-text-tokenizer';

import config from '../config';

// Webpack can not fully emulate WHATWG URL API object for now,
// so we use global.URL in browser and nodeURL in node.
// see https://github.com/webpack/node-libs-browser/issues/69
const URL = nodeURL || global.URL;

export class Link extends TLink {
  url = null;

  constructor(link) {
    super(link.offset, link.text);
    this.url = new URL(this.href);
  }

  get isLocal() {
    return includes(config.siteDomains, this.url.hostname);
  }

  get localURI() {
    return this.url.pathname + this.url.search + this.url.hash;
  }
}

const tokenize = withText(combine(hashTags, emails, mentions, links, arrows));

const enhanceLinks = (token) => (token instanceof TLink) ? new Link(token) : token;

export const parseText = (text) => tokenize(text).map(enhanceLinks);

export function getFirstLinkToEmbed(text) {
  return parseText(text)
    .filter((token) => (
      token instanceof Link
      && !token.isLocal
      && /^https?:\/\//i.test(token.text)
      && text.charAt(token.offset - 1) !== '!'
    ))
    .map((it) => it.href)[0];
}
