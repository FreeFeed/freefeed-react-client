import React from 'react';
import { Link } from 'react-router';
import { Mention, Email, HashTag, Arrows, Link as TLink } from 'social-text-tokenizer';

import config from '../config';
import { parseText } from '../utils/parse-text';
import { highlightString } from '../utils/search-highlighter';
import { FRIENDFEED_POST } from '../utils/link-types';
import UserName from './user-name';


const MAX_URL_LENGTH = 50;
const searchConfig = config.search;

export default class Linkify extends React.Component {
  parseCounter = 0;

  processStrings(children, processor, excludeTags) {
    if (typeof children === 'string') {
      return processor(children);
    } else if (React.isValidElement(children) && !excludeTags.includes(children.type)) {
      return React.cloneElement(children, {},
        this.processStrings(children.props.children, processor, excludeTags)
      );
    } else if (Array.isArray(children)) {
      return children.map((ch) => this.processStrings(ch, processor, excludeTags));
    }
    return children;
  }

  parseString = (text) => {
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
            user={{ username: token.text.substring(1) }}
            userHover={this.props.userHover}
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
        if (searchConfig.searchEngine) {
          return anchorEl(
            searchConfig.searchEngine + encodeURIComponent(token.text),
            token.text,
          );
        }

        return linkEl(
          { pathname: '/search', query: { qs: token.text } },
          <bdi>{token.text}</bdi>,
        );
      }

      if (token instanceof Arrows && this.props.arrowHover) {
        return (
          <span
            className="arrow-span"
            // eslint-disable-next-line react/jsx-no-bind
            onMouseEnter={() => this.props.arrowHover.hover(token.text.length)}
            onMouseLeave={this.props.arrowHover.leave}
            key={key}
          >{token.text}
          </span>
        );
      }

      if (token instanceof TLink) {
        if (token.isLocal) {
          return linkEl(token.localURI, token.shorten(MAX_URL_LENGTH));
        }

        if (token.href.match(FRIENDFEED_POST)) {
          return linkEl(
            { pathname: '/archivePost', query: { url: token.href } },
            token.shorten(MAX_URL_LENGTH),
          );
        }

        return anchorEl(token.href, token.shorten(MAX_URL_LENGTH));
      }

      return (token.text);
    });
  };

  render() {
    this.parseCounter = 0;
    const hl = this.props.highlightTerms;
    const parsed = this.processStrings(this.props.children, this.parseString, ['a', 'button', UserName]);
    if (!hl || hl.length === 0) {
      return <span className="Linkify" dir="auto">{parsed}</span>;
    }
    const highlighted = this.processStrings(parsed, (str) => highlightString(str, hl), ['button']);
    return <span className="Linkify" dir="auto">{highlighted}</span>;
  }
}

function anchorElWithKey(key) {
  return function (href, content) {
    return (
      <a href={href} target="_blank" dir="ltr" key={key}>{content}</a>
    );
  };
}

function linkElWithKey(key) {
  return function (to, content) {
    return (
      <Link to={to} dir="ltr" key={key}>{content}</Link>
    );
  };
}

