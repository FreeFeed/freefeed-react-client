import { EventsSequence, CombinedEventsSequences, FINISH, START } from '../utils/event-sequences';
import { unscrollDebug } from '../utils/debug';

export const scrolling = new EventsSequence(200);
const userInteraction = new EventsSequence(500);
export const scrollingOrInteraction = new CombinedEventsSequences(scrolling, userInteraction);

scrolling.on(START, () => unscrollDebug('Scrolling started'));
scrolling.on(FINISH, () => unscrollDebug('Scrolling finished'));

export function initUnscroll() {
  window.addEventListener('scroll', scrolling.trigger);
  window.addEventListener('resize', scrolling.trigger);
  window.addEventListener('focusin', scrolling.trigger);
  window.addEventListener('focusout', scrolling.trigger);

  window.addEventListener('mousemove', userInteraction.trigger);
  window.addEventListener('mousedown', userInteraction.trigger);
  window.addEventListener('mouseup', userInteraction.trigger);
  window.addEventListener('touchmove', userInteraction.trigger);
  window.addEventListener('touchstart', userInteraction.trigger);
  window.addEventListener('touchend', userInteraction.trigger);

  window.MutationObserver &&
    new window.MutationObserver(unscroll).observe(document.getElementById('app'), {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
    });
}

const pinnedSelectors = [
  'header', // main page header
  '.create-post',
  '.post-header',
  '.post-text',
  '.post-footer',
  '.post-likes',
  '.attachments',
  '.link-preview',
  '.comment',
].join(',');

const inputElements = ['INPUT', 'TEXTAREA', 'SELECT'];

const maxPinDepth = 4;

/* Pinned elements collection */
export const pinnedElements = [];
pinnedElements.clear = function () {
  this.length = 0;
};

pinnedElements.capture = function () {
  this.clear();

  const { activeElement } = document;
  if (
    activeElement !== document.body &&
    inputElements.includes(activeElement.tagName) &&
    isInViewport(activeElement)
  ) {
    const { top } = activeElement.getBoundingClientRect();
    this.push({ node: activeElement, top });
    unscrollDebug('Pinned input:', activeElement);
    return;
  }

  const nodes = document.querySelectorAll(pinnedSelectors);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const { top, bottom } = node.getBoundingClientRect();
    if (bottom > 0) {
      this.push({ node, top });
      unscrollDebug('Pinned element:', node);
      let p = node.parentElement;
      while (p && this.length < maxPinDepth) {
        const { top } = p.getBoundingClientRect();
        this.push({ node: p, top });
        p = p.parentElement;
      }
      break;
    }
  }
};
/* /Pinned elements collection */

scrolling.on(START, () => pinnedElements.clear());
scrolling.on(FINISH, () => pinnedElements.capture());

export function safeScrollTo(x, y) {
  scrolling.trigger();
  window.scrollTo(x, y);
}

export function safeScrollBy(x, y) {
  scrolling.trigger();
  window.scrollBy(x, y);
}

export function unscroll() {
  if (!scrolling.active) {
    unscrollTo(pinnedElements);
  }
}

export function unscrollTo(elements) {
  const pinned = elements.find((p) => p.node.isConnected);
  if (!pinned) {
    return;
  }
  const { top } = pinned.node.getBoundingClientRect();
  if (top !== pinned.top) {
    unscrollDebug(`⚡ Compensating by ${top - pinned.top}px`);
    window.scrollBy(0, top - pinned.top);
  }
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
