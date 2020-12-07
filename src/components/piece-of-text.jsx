import React from 'react';

import { READMORE_STYLE_COMFORT } from '../utils/frontend-preferences-options';

import Spoiler from './spoiler';
import Linkify from './linkify';

const spoilerRegex = /<(spoiler|спойлер)>(?:(?!(<(spoiler|спойлер)>|<\/(spoiler|спойлер)>)).)*<\/(spoiler|спойлер)>/gi;

// Texts longer than thresholdTextLength should be cut to shortenedTextLength
const thresholdTextLength = 800;
const shortenedTextLength = 600;

// Texts with less than thresholdLineBreaks should not be collapsed
const thresholdTextLines = 5;

// Suffix to add to the shortened text
const suffix = '...';

// Separator element for "paragraphs"
const paragraphBreak = (
  <div className="p-break">
    <br />
  </div>
);

// Shorten text without cutting words
const shortenText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }

  // Calculate max length taking into account the suffix
  const maxTextLength = maxLength - suffix.length;

  // Find the last space before maxTextLength
  const lastSpacePosition = text.lastIndexOf(' ', maxTextLength + 1);

  // Handle the case with a very long first word (i.e., no spaces before maxTextLength)
  const cutIndex = lastSpacePosition > -1 ? lastSpacePosition : maxTextLength;

  const newText = text.substr(0, cutIndex);
  return newText + suffix;
};

// Inject an element between every element in array.
// It's similar to array.join(separator), but returns an array, not a string.
const injectSeparator = (array, separator) => {
  if (array.length < 2) {
    return array;
  }

  const result = [];

  array.forEach((item, i) => {
    result.push(<span key={`item-${i}`}>{item}</span>);
    result.push(React.cloneElement(separator, { key: `separator-${i}` }, separator.props.children));
  });

  result.pop();

  return result;
};

// Replace single newlines with <br/> and trim every line
const brAndTrim = (text) => {
  const lines = text.split(/\n/g).map((line) => line.trim());
  return injectSeparator(lines, <br />);
};

const getCollapsedText = (text, expandText) => {
  const trimmedText = text.trim();
  const normalizedText = trimmedText.replace(/\s+/g, ' ');

  if (normalizedText.length <= thresholdTextLength) {
    if (text.split(/\n/).length < thresholdTextLines) {
      // The text is short and has less than threshold newlines
      return getExpandedText(text);
    }

    // The text is short but has some newlines
    return [
      <span key="text" dir="auto">
        {normalizedText}
      </span>,
      ' ',
      <a key="read-more" className="read-more" onClick={expandText}>
        Expand
      </a>,
    ];
  }

  // The text is long
  const shortenedText = shortenText(normalizedText, shortenedTextLength);

  return [
    <span key="text" dir="auto">
      {shortenedText}
    </span>,
    ' ',
    <a key="read-more" className="read-more" onClick={expandText}>
      Read more
    </a>,
  ];
};

const getExpandedText = (text) => {
  const trimmedText = text.trim();

  if (!/\n/.test(trimmedText)) {
    return trimmedText;
  }

  const paragraphs = trimmedText.split(/\n\s*\n/g).map(brAndTrim);

  return injectSeparator(paragraphs, paragraphBreak);
};

const splitIntoSpoilerBlocks = (input) => {
  if (typeof input === 'string') {
    const spoilersInText = input.matchAll(spoilerRegex);

    if (!spoilersInText) {
      return input;
    }

    let i = 0;
    const newNodes = [];

    for (const spoilerMatch of spoilersInText) {
      const [content] = spoilerMatch;
      const from = spoilerMatch.index;
      const to = from + content.length;

      if (from > i) {
        newNodes.push(input.slice(i, from));
      }
      i = to;

      const tagBefore = content.slice(0, 9);
      const spoilerText = content.slice(9, -10);
      const tagAfter = content.slice(-10);

      newNodes.push(
        <React.Fragment key={`spoiler-${from}`}>
          <span key="spoiler-before">{tagBefore}</span>
          <Spoiler key="spoiler">{spoilerText}</Spoiler>
          <span key="spoiler-after">{tagAfter}</span>
        </React.Fragment>,
      );
    }

    if (i < input.length) {
      newNodes.push(input.slice(i));
    }

    return newNodes;
  }

  if (Array.isArray(input)) {
    return input.map(splitIntoSpoilerBlocks);
  }

  if (React.isValidElement(input)) {
    return React.cloneElement(input, {}, splitIntoSpoilerBlocks(input.props.children));
  }
};

export default class PieceOfText extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isExpanded: !!props.isExpanded || props.readMoreStyle === READMORE_STYLE_COMFORT,
    };
  }

  expandText() {
    this.setState({ isExpanded: true });
  }

  render() {
    if (!this.props.text) {
      return <span />;
    }

    const text = splitIntoSpoilerBlocks(
      this.state.isExpanded
        ? getExpandedText(this.props.text)
        : getCollapsedText(this.props.text, this.expandText.bind(this)),
    );

    return (
      <Linkify
        userHover={this.props.userHover}
        arrowHover={this.props.arrowHover}
        highlightTerms={this.props.highlightTerms}
        showMedia={this.props.showMedia}
      >
        {text}
      </Linkify>
    );
  }
}
