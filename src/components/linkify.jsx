/* global CONFIG */
import { isValidElement, cloneElement, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { Mention, Email, HashTag, ForeignMention } from 'social-text-tokenizer';
import { faImage } from '@fortawesome/free-regular-svg-icons';
import { faFilm as faVideo } from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faYoutube, faVimeo } from '@fortawesome/free-brands-svg-icons';
import classnames from 'classnames';

import { Arrows, Link as TLink, parseText, shortCodeToService } from '../utils/parse-text';
import { highlightString } from '../utils/search-highlighter';
import { FRIENDFEED_POST } from '../utils/link-types';
import { getMediaType } from './media-viewer';

import { Icon } from './fontawesome-icons';
import UserName from './user-name';
import ErrorBoundary from './error-boundary';

const MAX_URL_LENGTH = 50;
const { searchEngine } = CONFIG.search;
const noop = () => {};

export default function Linkify({
  children,
  showMedia,
  userHover,
  arrowHover = noop,
  arrowClick,
  highlightTerms: hl = [],
}) {
  const attachmentsRef = useRef([]);

  const formatted = useMemo(() => {
    // attachmentsRef.current.length = 0;
    let fm = processStrings(children, parseString, ['a', 'button', UserName], {
      showMedia,
      userHover,
      arrowHover,
      arrowClick,
      attachmentsRef,
    });
    if (hl.length > 0) {
      fm = processStrings(fm, (str) => highlightString(str, hl), ['button']);
    }
    return fm;
  }, [arrowClick, arrowHover, children, hl, showMedia, userHover]);

  return (
    <div className="Linkify" dir="auto" role="region">
      <ErrorBoundary>{formatted}</ErrorBoundary>
    </div>
  );
}

/**
 * Recursive process text content of React children
 *
 * @param {import('react').ReactChildren | import('react').ReactNode} children
 * @param {(text: string, params: object) => string} processor
 * @param {string[]} excludeTags
 * @param {object} params
 * @returns {import('react').ReactNode[]}
 */
function processStrings(children, processor, excludeTags = [], params = {}) {
  if (typeof children === 'string') {
    return processor(children, params);
  } else if (isValidElement(children) && !excludeTags.includes(children.type)) {
    return cloneElement(
      children,
      {},
      processStrings(children.props.children, processor, excludeTags, params),
    );
  } else if (Array.isArray(children)) {
    return children.map((ch) => processStrings(ch, processor, excludeTags, params));
  }
  return children;
}

function parseString(text, { userHover, arrowHover, arrowClick, showMedia, attachmentsRef }) {
  if (text === '') {
    return [];
  }

  return parseText(text).map((token, i) => {
    const key = i;

    const anchorEl = anchorElWithKey(key);
    const linkEl = linkElWithKey(key);

    if (token instanceof Mention) {
      return (
        <UserName
          user={{ username: token.text.slice(1).toLowerCase() }}
          userHover={userHover}
          key={key}
        >
          {token.text}
        </UserName>
      );
    }

    if (token instanceof Email) {
      return anchorEl(`mailto:${token.text}`, token.pretty);
    }

    if (token instanceof HashTag) {
      if (searchEngine) {
        return anchorEl(searchEngine + encodeURIComponent(token.text), token.text);
      }

      return linkEl({ pathname: '/search', query: { q: token.text } }, <bdi>{token.text}</bdi>);
    }

    if (token instanceof Arrows && arrowHover) {
      return (
        <span
          className="arrow-span"
          data-arrows={token.level}
          onMouseEnter={arrowHover.hover}
          onMouseLeave={arrowHover.leave}
          onClick={arrowClick}
          key={key}
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
        return linkEl(token.localURI, text);
      }

      if (token.href.match(FRIENDFEED_POST)) {
        return linkEl(
          { pathname: '/archivePost', query: { url: token.href } },
          token.shorten(MAX_URL_LENGTH),
        );
      }

      if (showMedia) {
        const mediaType = getMediaType(token.href);
        if (mediaType) {
          return (
            <MediaOpener
              key={key}
              url={token.href}
              mediaType={mediaType}
              attachmentsRef={attachmentsRef}
              showMedia={showMedia}
            >
              {token.shorten(MAX_URL_LENGTH)}
            </MediaOpener>
          );
        }
      }

      return anchorEl(token.href, token.shorten(MAX_URL_LENGTH));
    }

    if (token instanceof ForeignMention) {
      const srv = shortCodeToService[token.service];
      if (srv) {
        const url = srv.linkTpl.replace(/{}/g, token.username);
        return anchorEl(url, token.text, `${srv.title} link`);
      }
    }

    return token.text;
  });
}

function MediaOpener({ url, mediaType, attachmentsRef, showMedia, children }) {
  const media = useMemo(() => {
    const m = { url, id: 'comment', mediaType };
    attachmentsRef.current.push(m);
    return m;
  }, [attachmentsRef, mediaType, url]);

  const openMedia = useCallback(
    (e) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      e.preventDefault();
      showMedia({
        attachments: attachmentsRef.current,
        index: attachmentsRef.current.indexOf(media),
      });
    },
    [attachmentsRef, media, showMedia],
  );

  const mediaIcon =
    {
      instagram: faInstagram,
      T_YOUTUBE_VIDEO: faYoutube,
      T_VIMEO_VIDEO: faVimeo,
      image: faImage,
    }[mediaType] || faVideo;

  return (
    <a
      href={url}
      target="_blank"
      dir="ltr"
      onClick={openMedia}
      className={classnames('media-link', mediaType)}
      title="Click to view in Lightbox"
    >
      <span className="icon-bond">
        <Icon icon={mediaIcon} className="media-icon" />
      </span>
      {children}
    </a>
  );
}

function anchorElWithKey(key) {
  return function (href, content, title = null) {
    return (
      <a href={href} target="_blank" dir="ltr" key={key} title={title}>
        {content}
      </a>
    );
  };
}

function linkElWithKey(key) {
  return function (to, content, title = null) {
    return (
      <Link to={to} dir="ltr" key={key} title={title}>
        {content}
      </Link>
    );
  };
}
