/* global CONFIG */
import { Fragment } from 'react';

import { ARROWS, EMAIL, FOREIGN_MENTION, HASHTAG, LINK, MENTION } from 'social-text-tokenizer';
import { emailHref, linkHref, prettyEmail, prettyLink } from 'social-text-tokenizer/prettifiers';
import { FRIENDFEED_POST } from '../utils/link-types';
import {
  arrowsLevel,
  trimOrigin,
  isLocalLink,
  LINE_BREAK,
  PARAGRAPH_BREAK,
  shortCodeToService,
  REDDIT_LINK,
  redditLinkHref,
  SHORT_LINK,
  isShortLink,
  CODE_INLINE,
  CODE_BLOCK,
} from '../utils/parse-text';
import { INITIAL_CHECKBOX, isChecked } from '../utils/initial-checkbox';
import UserName from './user-name';
import { InitialCheckbox } from './initial-checkbox';
import { Anchor, Link } from './linkify-links';
import CodeBlock from './code-block';
import { MediaLink } from './media-links/media-link';
import { freefeedAttachmentId } from './media-links/helpers';

const { searchEngine } = CONFIG.search;
const MAX_URL_LENGTH = 50;

/**
 * @param {import('social-text-tokenizer').Token} token
 * @param {string} key
 * @param {string} text
 * @param {any} params
 * @returns {React.JSX.Element}
 */
export function tokenToElement(token, key, text, params) {
  switch (token.type) {
    case MENTION:
      return (
        <UserName
          key={key}
          user={{ username: token.text.slice(1).toLowerCase() }}
          userHover={params.userHover}
        >
          {token.text}
        </UserName>
      );

    case EMAIL:
      return (
        <Anchor key={key} href={emailHref(token.text)}>
          {prettyEmail(token.text)}
        </Anchor>
      );

    case HASHTAG: {
      if (searchEngine) {
        return (
          <Anchor key={key} href={searchEngine + encodeURIComponent(token.text)}>
            {token.text}
          </Anchor>
        );
      }

      return (
        <Link key={key} to={{ pathname: '/search', query: { q: token.text } }}>
          <bdi>{token.text}</bdi>
        </Link>
      );
    }

    case ARROWS: {
      if (!params.arrowHover && !params.arrowClick) {
        break;
      }
      return (
        <span
          key={key}
          className="arrow-span"
          data-arrows={arrowsLevel(token.text)}
          onMouseEnter={params.arrowHover.hover}
          onMouseLeave={params.arrowHover.leave}
          onClick={params.arrowClick}
        >
          {token.text}
        </span>
      );
    }

    case LINK:
      return renderLink(token, key, text);

    case SHORT_LINK:
      return (
        <Link key={key} to={token.text}>
          {token.text}
        </Link>
      );

    case REDDIT_LINK:
      return (
        <Anchor key={key} href={redditLinkHref(token.text)}>
          {token.text}
        </Anchor>
      );

    case FOREIGN_MENTION: {
      const [username, service] = token.text.split('@', 2);
      const srv = shortCodeToService[service];
      if (!srv) {
        break;
      }

      const url = srv.linkTpl.replace(/{}/g, username);
      return (
        <Anchor key={key} href={url} title={`${srv.title} link`}>
          {token.text}
        </Anchor>
      );
    }

    case LINE_BREAK:
      return (
        // ' ' is here for proper render in READMORE_STYLE_COMPACT mode
        <Fragment key={key}>
          {' '}
          <br />
        </Fragment>
      );

    case PARAGRAPH_BREAK:
      return (
        // ' ' is here for proper render in READMORE_STYLE_COMPACT mode
        <span key={key} className="p-break">
          <br /> <br />
        </span>
      );

    case INITIAL_CHECKBOX:
      return <InitialCheckbox key={key} checked={isChecked(token.text)} />;

    case CODE_INLINE: {
      const ticks = token.text.match(/^`+/)[0];
      const body = token.text.slice(ticks.length, -ticks.length);
      return (
        <code key={key} className="inline-code">
          <span className="code--backticks">{ticks}</span>
          {body}
          <span className="code--backticks">{ticks}</span>
        </code>
      );
    }

    case CODE_BLOCK:
      return <CodeBlock key={key} text={token.text} />;
  }
  return token.text;
}

function renderLink(token, key, text) {
  const href = linkHref(token.text);
  const isBareLink = text.charAt(token.offset - 1) === '!';
  const attId = freefeedAttachmentId(token.text);
  const previewLabel = attId ? attId.slice(0, 8) : null;
  const displayText = previewLabel ?? prettyLink(token.text, MAX_URL_LENGTH);

  if (isBareLink) {
    return (
      <Anchor key={key} href={href}>
        {displayText}
      </Anchor>
    );
  }

  if (isLocalLink(token.text)) {
    const localPart = trimOrigin(token.text);
    let m, linkText;
    // Special shortening of post links
    if ((m = /^[^/]+\/[\w-]+\/[\da-f]{8}-/.exec(localPart))) {
      linkText = `${m[0]}\u2026`;
    } else if (isShortLink(localPart)) {
      linkText = localPart;
    } else {
      linkText = displayText;
    }
    return (
      <Link key={key} to={localPart}>
        {linkText}
      </Link>
    );
  }

  if (FRIENDFEED_POST.test(href)) {
    return (
      <Link key={key} to={{ pathname: '/archivePost', query: { url: href } }}>
        {displayText}
      </Link>
    );
  }

  return (
    <MediaLink key={key} href={href}>
      {displayText}
    </MediaLink>
  );
}
