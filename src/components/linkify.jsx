/*global Raven*/
import React from 'react';
import { Link } from 'react-router';
import { shorten } from 'ff-url-finder';

import config from '../config';
import { finder } from '../utils';
import { highlightString } from '../utils/search-highlighter';
import { LINK, AT_LINK, LOCAL_LINK, EMAIL, HASHTAG, ARROW, FRIENDFEED_POST } from '../utils/link-types';
import UserName from './user-name';

const MAX_URL_LENGTH = 50;
const searchConfig = config.search;

class Linkify extends React.Component {
  createLinkElement({ type, username }, displayedLink, href) {
    const props = { key: `match${++this.idx}`, dir: 'ltr' };

    if (type == AT_LINK || type == LOCAL_LINK) {
      props['to'] = href;
      if (type == AT_LINK && this.userHover) {
        props['onMouseEnter'] = () => this.userHover.hover(username);
        props['onMouseLeave'] = this.userHover.leave;
      }

      return React.createElement(
        Link,
        props,
        displayedLink
      );
    } else if (type == HASHTAG) {
      props['dir'] = 'auto';
      props['href'] = href;
      props['target'] = '_blank';

      return React.createElement(
        'a',
        props,
        displayedLink
      );
    } else if (type == ARROW) {
      props['className'] = 'arrow-span';
      props['onMouseEnter'] = () => this.arrowHover.hover(displayedLink.length);
      props['onMouseLeave'] = this.arrowHover.leave;

      return React.createElement(
        'span',
        props,
        displayedLink
      );
    } else {  // eslint-disable-line no-else-return
      if (href.match(FRIENDFEED_POST)) {
        return React.createElement(
          Link,
          { key: props.key, to: { pathname: '/archivePost', query: { url: href } } },
          displayedLink
        );
      }

      props['href'] = href;
      props['target'] = '_blank';

      return React.createElement(
        'a',
        props,
        displayedLink
      );
    }
  }

  parseCounter = 0;
  idx = 0;

  parseString(string) {
    const elements = [];
    if (string === '') {
      return elements;
    }

    this.idx = 0;

    try {
      finder.parse(string).map((it) => {
        let displayedLink = it.text;
        let href;

        if (it.type === LINK) {
          displayedLink = shorten(it.text, MAX_URL_LENGTH).replace(/^https?:\/\//, '');
          href = it.url;
        } else if (it.type === AT_LINK) {
          elements.push(
            <UserName
              user={{ username: it.username }}
              userHover={this.userHover}
              key={`match${++this.idx}`}
            >
              {it.text}
            </UserName>
          );
          return;
        } else if (it.type === LOCAL_LINK) {
          displayedLink = shorten(it.text, MAX_URL_LENGTH).replace(/^https?:\/\//, '');
          href = it.uri;
        } else if (it.type === EMAIL) {
          href = `mailto:${it.address}`;
        } else if (it.type === HASHTAG) {
          if (searchConfig.searchEngine) {
            href = searchConfig.searchEngine + encodeURIComponent(it.text);
          } else {
            it.type = LOCAL_LINK;
            href = { pathname: '/search', query: { qs: it.text } };
            displayedLink = <bdi>{displayedLink}</bdi>;
          }
        } else if (it.type === ARROW && this.arrowHover) {
          // pass
        } else {
          elements.push(it.text);
          return;
        }

        const linkElement = this.createLinkElement(it, displayedLink, href);

        elements.push(linkElement);
      });

      return (elements.length === 1) ? elements[0] : elements;
    } catch (err) {
      if (typeof Raven !== 'undefined') {
        Raven.captureException(err, { level: 'error', tags: { area: 'component/linkify' }, extra: { string } });
      }
    }
    return [string];
  }

  parse(children, hlTerms = []) {
    let parsed = children;

    if (typeof children === 'string' && hlTerms.length > 0) {
      parsed = this.parse(highlightString(children, hlTerms), []);
    } else if (typeof children === 'string') {
      parsed = this.parseString(children);
    } else if (React.isValidElement(children) && (children.type !== 'a') && (children.type !== 'button')) {
      parsed = React.cloneElement(
        children,
        { key: `parse${++this.parseCounter}` },
        this.parse(children.props.children, hlTerms)
      );
    } else if (children instanceof Array) {
      parsed = children.map((child) => {
        return this.parse(child, hlTerms);
      });
    }

    return parsed;
  }

  render() {
    this.parseCounter = 0;
    this.userHover = this.props.userHover;
    this.arrowHover = this.props.arrowHover;
    const parsedChildren = this.parse(this.props.children, this.props.highlightTerms);

    return <span className="Linkify" dir="auto">{parsedChildren}</span>;
  }
}

export default Linkify;
