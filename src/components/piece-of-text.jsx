import { useCallback, useMemo, useState } from 'react';

import {
  READMORE_STYLE_COMFORT,
  READMORE_STYLE_COMPACT,
} from '../utils/frontend-preferences-options';

import Linkify from './linkify';
import { ButtonLink } from './button-link';

// Texts longer than thresholdTextLength should be cut to shortenedTextLength
const thresholdTextLength = 800;
const shortenedTextLength = 600;

// Texts with less than thresholdLineBreaks should not be collapsed
const thresholdTextLines = 5;

// Suffix to add to the shortened text
const suffix = '...';

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

  const newText = text.slice(0, Math.max(0, cutIndex));
  return newText + suffix;
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
      <ButtonLink key="read-more" className="read-more" onClick={expandText}>
        Expand
      </ButtonLink>,
    ];
  }

  // The text is long
  const shortenedText = shortenText(normalizedText, shortenedTextLength);

  return [
    <span key="text" dir="auto">
      {shortenedText}
    </span>,
    ' ',
    <ButtonLink key="read-more" className="read-more" onClick={expandText}>
      Read more
    </ButtonLink>,
  ];
};

const getExpandedText = (text) => {
  return text.trim();
};

export default function PieceOfText({
  text = '',
  isExpanded: passedIsExpanded = false,
  readMoreStyle,
  userHover,
  arrowHover,
  arrowClick,
  highlightTerms,
  showMedia,
}) {
  const [isExpanded, setIsExpanded] = useState(
    () => passedIsExpanded || readMoreStyle === READMORE_STYLE_COMFORT,
  );

  const expandText = useCallback(() => setIsExpanded(true), []);

  const textToRender = useMemo(
    () => (isExpanded ? getExpandedText(text) : getCollapsedText(text, expandText)),
    [expandText, isExpanded, text],
  );

  const noBreaks =
    readMoreStyle === READMORE_STYLE_COMPACT &&
    // If textToRender is not a string, it includes an Expand button, so we
    // shouldn't show line breaks.
    typeof textToRender !== 'string';

  return (
    <Linkify
      className={noBreaks && 'text-no-breaks'}
      userHover={userHover}
      arrowHover={arrowHover}
      arrowClick={arrowClick}
      highlightTerms={highlightTerms}
      showMedia={showMedia}
    >
      {textToRender}
    </Linkify>
  );
}
