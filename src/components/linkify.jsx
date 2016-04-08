import React from 'react';
import {Link} from 'react-router';
import {finder} from '../utils';
import {shorten} from 'ff-url-finder';
import {LINK, AT_LINK, LOCAL_LINK, EMAIL} from '../utils/link-types';

const MAX_URL_LENGTH = 50;

const arrowDetector = /(↑+|\^+)W?/g;
const defaultFunction = _ => _;
const getArrowProps = ({hover = defaultFunction, leave= defaultFunction}={}, text) => ({
  className:'arrow-span',
  onMouseEnter: _ => hover(text.length),
  onMouseLeave: leave
});

class Linkify extends React.Component {
  createLinkElement({type, username}, displayedLink, href) {
    let props = { key: `match${++this.idx}` };

    if (type == AT_LINK || type == LOCAL_LINK) {
      props['to'] = href;
      if (type == AT_LINK && this.userHover) {
        props['onMouseEnter'] = _ => this.userHover.hover(username);
        props['onMouseLeave'] = this.userHover.leave;
      };

      return React.createElement(
        Link,
        props,
        displayedLink
      );
    } else {
      props['href'] = href;
      props['target'] = '_blank';

      return React.createElement(
        'a',
        props,
        displayedLink
      );
    }
  }

  createArrowElement(arrows) {
    return React.createElement(
      'span',
      {
        ...getArrowProps(this.arrowHover, arrows),
        key: `match${++this.idx}`,
      },
      arrows
    );
  }

  parseCounter = 0
  idx = 0

  parseArrows(text) {
    const pieces = text.split(arrowDetector);
    const resPieces = pieces.map(piece => {
      if (piece.match(arrowDetector)) {
        return this.createArrowElement(piece);
      }
      return piece;
    });


    return resPieces;
  }

  parseString(string) {
    let elements = [];
    if (string === '') {
      return elements;
    }

    this.idx = 0;

    try {
      finder.parse(string).map(it => {
        let displayedLink;
        let href;

        if (it.type === LINK) {
          displayedLink = shorten(it.text, MAX_URL_LENGTH);
          href = it.url;
        } else if (it.type === AT_LINK) {
          displayedLink = it.text;
          href = `/${it.username}`;
        } else if (it.type === LOCAL_LINK) {
          displayedLink = shorten(it.text, MAX_URL_LENGTH);
          href = it.uri;
        } else if (it.type === EMAIL) {
          displayedLink = it.text;
          href = `mailto:${it.address}`;
        } else {
          const textWithArrows = this.parseArrows(it.text);
          elements = elements.concat(textWithArrows);
          return;
        }

        let linkElement = this.createLinkElement(it, displayedLink, href);

        elements.push(linkElement);
      });

      return (elements.length === 1) ? elements[0] : elements;
    }
    catch (err) {
      console.log('Error while liknifying text', string, err);
    }
    return [string];
  }

  parse(children) {
    let parsed = children;

    if (typeof children === 'string') {
      parsed = this.parseString(children);
    } else if (React.isValidElement(children) && (children.type !== 'a') && (children.type !== 'button')) {
      parsed = React.cloneElement(
        children,
        {key: `parse${++this.parseCounter}`},
        this.parse(children.props.children)
      );
    } else if (children instanceof Array) {
      parsed = children.map(child => {
        return this.parse(child);
      });
    }

    return parsed;
  }

  render() {
    this.parseCounter = 0;
    this.userHover = this.props.userHover;
    this.arrowHover = this.props.arrowHover;
    const parsedChildren = this.parse(this.props.children);

    return <span className='Linkify'>{parsedChildren}</span>;
  }
}

export default Linkify;
