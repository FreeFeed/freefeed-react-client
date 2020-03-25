import createDebug from 'debug';
import { EventsSequence, CombinedEventsSequences, FINISH, START } from '../utils/event-sequences';

const unscrollDebug = createDebug('freefeed:react:unscroll');

// TODO: reset scroll position on navigation events

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

  new MutationObserver(unscroll).observe(document.getElementById('app'), {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  });
}

const pinnedSelectors = [
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
let pinnedElements = [];

scrolling.on(START, () => (pinnedElements = []));
scrolling.on(FINISH, () => {
  pinnedElements = [];
  const { activeElement } = document;
  if (
    activeElement !== document.body &&
    inputElements.includes(activeElement.tagName) &&
    isInViewport(activeElement)
  ) {
    const { top } = activeElement.getBoundingClientRect();
    pinnedElements.push({ node: activeElement, top });
    unscrollDebug('Pinned input:', activeElement);
    return;
  }

  const nodes = document.querySelectorAll(pinnedSelectors);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const { top, bottom } = node.getBoundingClientRect();
    if (bottom > 0) {
      pinnedElements.push({ node, top });
      unscrollDebug('Pinned element:', node);
      let p = node.parentElement;
      while (p && pinnedElements.length < maxPinDepth) {
        const { top } = p.getBoundingClientRect();
        pinnedElements.push({ node: p, top });
        p = p.parentElement;
      }
      break;
    }
  }
});

export function safeScrollTo(x, y) {
  scrolling.trigger();
  window.scrollTo(x, y);
}

export function safeScrollBy(x, y) {
  scrolling.trigger();
  window.scrollBy(x, y);
}

export function unscroll() {
  if (scrolling.active) {
    return;
  }
  const pinned = pinnedElements.find((p) => p.node.isConnected);
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
