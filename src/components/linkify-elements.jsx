/* global CONFIG */
import { Fragment } from 'react';
import { Arrows, Email, ForeignMention, HashTag, Mention } from 'social-text-tokenizer';

import { FRIENDFEED_POST } from '../utils/link-types';
import { LineBreak, ParagraphBreak, shortCodeToService, Link as TLink } from '../utils/parse-text';
import { InitialCheckbox as InitialCheckboxToken } from '../utils/initial-checkbox';
import UserName from './user-name';
import { getMediaType } from './media-viewer';
import { MediaOpener } from './media-opener';
import { InitialCheckbox } from './initial-checkbox';
import { Anchor, Link } from './linkify-links';

const { searchEngine } = CONFIG.search;
const MAX_URL_LENGTH = 50;

export function tokenToElement(token, key, params) {
  if (token instanceof Mention) {
    return (
      <UserName
        key={key}
        user={{ username: token.text.slice(1).toLowerCase() }}
        userHover={params.userHover}
      >
        {token.text}
      </UserName>
    );
  }

  if (token instanceof Email) {
    return (
      <Anchor key={key} href={`mailto:${token.text}`}>
        {token.pretty}
      </Anchor>
    );
  }

  if (token instanceof HashTag) {
    if (searchEngine) {
      return (
        <Anchor key={key} href={searchEngine + encodeURIComponent(token.text)}>
          {token.pretty}
        </Anchor>
      );
    }

    return (
      <Link key={key} to={{ pathname: '/search', query: { q: token.text } }}>
        <bdi>{token.text}</bdi>
      </Link>
    );
  }

  if (token instanceof Arrows && (params.arrowHover || params.arrowClick)) {
    return (
      <span
        key={key}
        className="arrow-span"
        data-arrows={token.level}
        onMouseEnter={params.arrowHover.hover}
        onMouseLeave={params.arrowHover.leave}
        onClick={params.arrowClick}
      >
        {token.text}
      </span>
    );
  }

  if (token instanceof TLink) {
    if (token.isLocal) {
      let m, text;
      // Special shortening of post links
      if ((m = /^[^/]+\/[\w-]+\/[\da-f]{8}-/.exec(token.pretty))) {
        text = `${m[0]}\u2026`;
      } else {
        text = token.shorten(MAX_URL_LENGTH);
      }
      return (
        <Link key={key} to={token.localURI}>
          {text}
        </Link>
      );
    }

    if (token.href.match(FRIENDFEED_POST)) {
      return (
        <Link key={key} to={{ pathname: '/archivePost', query: { url: token.href } }}>
          {token.shorten(MAX_URL_LENGTH)}
        </Link>
      );
    }

    if (params.showMedia) {
      const mediaType = getMediaType(token.href);
      if (mediaType) {
        return (
          <MediaOpener
            key={key}
            url={token.href}
            mediaType={mediaType}
            attachmentsRef={params.attachmentsRef}
            showMedia={params.showMedia}
          >
            {token.shorten(MAX_URL_LENGTH)}
          </MediaOpener>
        );
      }
    }

    return (
      <Anchor key={key} href={token.href}>
        {token.shorten(MAX_URL_LENGTH)}
      </Anchor>
    );
  }

  if (token instanceof ForeignMention) {
    const srv = shortCodeToService[token.service];
    if (srv) {
      const url = srv.linkTpl.replace(/{}/g, token.username);
      return (
        <Anchor key={key} href={url} title={`${srv.title} link`}>
          {token.text}
        </Anchor>
      );
    }
  }

  if (token instanceof LineBreak) {
    return (
      // ' ' is here for proper render in READMORE_STYLE_COMPACT mode
      <Fragment key={key}>
        {' '}
        <br />
      </Fragment>
    );
  }

  if (token instanceof ParagraphBreak) {
    // ' ' is here for proper render in READMORE_STYLE_COMPACT mode
    return (
      <span key={key} className="p-break">
        <br /> <br />
      </span>
    );
  }

  if (token instanceof InitialCheckboxToken) {
    return <InitialCheckbox key={key} checked={token.checked} />;
  }

  return token.text;
}
