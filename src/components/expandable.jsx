import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useEvent } from 'react-use-event-hook';
import { useSelector } from 'react-redux';
import { ButtonLink } from './button-link';
import { Icon } from './fontawesome-icons';
import style from './expandable.module.scss';

// Pixel areas (before the UI scale applied) of the folded text rectangles for
// posts and comments. The Expandable component reduces the height of the text
// to approximately match this area.

const foldedAreas = {
  post: 600 * 130,
  comment: 500 * 110,
  postAnonymous: 860 * 130, // No sidebar, so we need more pixels
  commentAnonymous: 700 * 110,
};

export function Expandable({
  children,
  expanded: givenExpanded = false,
  tail = null,
  panelClass = null,
  contentType = 'post', // or 'comment'
}) {
  const authenticated = useSelector((state) => state.authenticated);
  const uiScale = useSelector((state) => state.uiScale ?? 100) / 100;

  if (contentType !== 'comment' && contentType !== 'post') {
    throw new Error('Unsupported content type');
  }

  const foldedArea = foldedAreas[contentType + (authenticated ? '' : 'Anonymous')];
  const scaledFoldedArea = foldedArea * uiScale * uiScale;
  // Don't fold content that is smaller than this
  const scaledMaxUnfoldedArea = scaledFoldedArea * 1.5;

  const content = useRef(null);
  // Null means content doesn't need to be expandable
  const [maxHeight, setMaxHeight] = useState(null);

  const [expandedByUser, setExpandedByUser] = useState(false);
  const expand = useEvent(() => setExpandedByUser(true));

  const expanded = expandedByUser || givenExpanded;
  const clipped = maxHeight !== null && !expanded;

  // Update the maxHeight when the content dimensions changes
  const update = useEvent(({ width, height }) => {
    if (width * height < scaledMaxUnfoldedArea) {
      setMaxHeight(null);
    } else {
      let targetHeight = scaledFoldedArea / width;
      targetHeight = align(content.current, targetHeight);
      setMaxHeight(`${targetHeight}px`);
    }
  });

  // We use the layout effect just once, to set the initial height without
  // flickering.
  useLayoutEffect(
    () => {
      if (!expanded) {
        update(content.current.getBoundingClientRect());
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Update the maxHeight when the content resizes
  useEffect(() => {
    if (!expanded) {
      return observeResizeOf(content.current, ({ contentRect }) => update(contentRect));
    }
  }, [expanded, update]);

  return (
    <>
      <div
        className={clipped ? style.clippedContent : null}
        style={{ maxHeight: expanded ? null : maxHeight }}
      >
        <div ref={content}>{children}</div>
      </div>
      {clipped && (
        <div className={cn('expand-button', panelClass)}>
          <ButtonLink className={style.button} tag="i" onClick={expand} aria-hidden>
            <Icon icon={faChevronDown} className={style.icon} /> Read more
          </ButtonLink>{' '}
          {tail}
        </div>
      )}
    </>
  );
}

/**
 * Align the given offset to the bottom of the closest text line box
 *
 * Text rects cover only the glyph area of the font, which can be smaller or
 * larger than the line box (it depends on the browser and on the font). So we
 * extend every rect by the half-leading to get the real line box. Cutting at
 * the line box bottom keeps the same spacing between the last visible line and
 * the "Read more" button as between the text lines.
 *
 * @param {Element} rootElement
 * @param {number} targetOffset
 * @returns {number}
 */
function align(rootElement, targetOffset) {
  const { top } = rootElement.getBoundingClientRect();

  // Iterate over all the text nodes and collect the line boxes
  const nodeIterator = document.createNodeIterator(rootElement, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  const lines = [];
  let node;
  mainLoop: while ((node = nodeIterator.nextNode())) {
    const lineHeight = lineHeightOf(node.parentElement);
    range.selectNode(node);
    for (const rect of range.getClientRects()) {
      if (rect.height === 0) {
        continue;
      }
      // NaN for 'line-height: normal', the rect is the line box in this case
      const halfLeading = (lineHeight - rect.height) / 2 || 0;
      const line = {
        top: rect.top - top - halfLeading,
        bottom: rect.bottom - top + halfLeading,
      };
      const last = lines[lines.length - 1];
      if (last && isSameLine(last, line)) {
        last.bottom = Math.max(last.bottom, line.bottom);
      } else {
        if (line.top > targetOffset) {
          break mainLoop;
        }
        lines.push(line);
      }
    }
  }

  let result = targetOffset;
  let minDistance = Infinity;
  for (const { bottom } of lines) {
    const distance = Math.abs(bottom - targetOffset);
    if (distance < minDistance) {
      minDistance = distance;
      result = bottom;
    }
  }
  return result;
}

/**
 * The line box is not shorter than the line-height of the containing block, even
 * if the inline element has a smaller one (e.g. inline code with line-height: 1)
 *
 * @param {Element} element
 * @returns {number} NaN for 'line-height: normal'
 */
function lineHeightOf(element) {
  let block = element;
  while (block.parentElement && getComputedStyle(block).display.startsWith('inline')) {
    block = block.parentElement;
  }
  const own = parseFloat(getComputedStyle(element).lineHeight);
  const blocks = parseFloat(getComputedStyle(block).lineHeight);
  return Number.isNaN(blocks) ? own : Math.max(own || 0, blocks);
}

function isSameLine(a, b) {
  const middle = (b.top + b.bottom) / 2;
  return middle > a.top && middle < a.bottom;
}

let resizeObserver = null;
const resizeHandlers = new Map();

/**
 * Subscribe to resize of the given element
 *
 * @param {Element} element
 * @param {(entry: ResizeObserverEntry) => void} callback
 * @returns {() => void} unsubscribe function
 */
function observeResizeOf(element, callback) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  if (!resizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        resizeHandlers.get(entry.target)?.(entry);
      }
    });
  }

  resizeHandlers.set(element, callback);
  resizeObserver.observe(element);
  return () => {
    resizeObserver.unobserve(element);
    resizeHandlers.delete(element);
  };
}
