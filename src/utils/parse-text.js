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


export class Link extends TLink {
  hostname = null;

  constructor(link) {
    super(link.offset, link.text);
    const m = this.href.match(/^https?:\/\/([^/]+)/i);
    if (m) {
      this.hostname = m[1].toLowerCase();
    }
  }

  get isLocal() {
    return this.hostname && includes(config.siteDomains, this.hostname);
  }

  get localURI() {
    return this.hostname ? this.href.replace(/^https?:\/\/[^/]+/i, '') : '';
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
