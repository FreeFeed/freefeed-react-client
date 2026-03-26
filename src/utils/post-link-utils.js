/* global CONFIG */
import { linkHref } from 'social-text-tokenizer/prettifiers';

const { siteDomains } = CONFIG;

// Post ID patterns
const UUID_PATTERN = /^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i;
const SHORT_ID_PATTERN = /^[a-f\d]{6,10}$/i;
const USERNAME_PATTERN = /^[a-z\d-]{3,30}$/; // lowercase only, no 'i' flag

// Post link patterns (without hash)
const SHORT_POST_LINK_PATTERN =
  /^\/([a-z\d-]{3,30})\/([\da-f]{6,10}|[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12})$/i;

/**
 * Check if the given post ID is valid (UUID or short ID)
 * @param {string} postId
 * @returns {boolean}
 */
function isValidPostId(postId) {
  return UUID_PATTERN.test(postId) || SHORT_ID_PATTERN.test(postId);
}

/**
 * Check if the URL is a link to a FreeFeed post (not a comment)
 * @param {string} url - URL or path to check
 * @param {string[]} localDomains - List of local domains (default: siteDomains from config)
 * @returns {boolean}
 */
export function isPostLink(url, localDomains = siteDomains) {
  // Check for hash (comment link)
  if (hasCommentHash(url)) {
    return false;
  }

  // Try to parse as short link first
  const shortMatch = SHORT_POST_LINK_PATTERN.exec(url);
  if (shortMatch) {
    const [, username, postId] = shortMatch;
    return USERNAME_PATTERN.test(username) && isValidPostId(postId);
  }

  // Try to parse as full URL
  let parsedUrl;
  try {
    parsedUrl = new URL(linkHref(url));
  } catch {
    return false;
  }

  // Check if domain is local
  if (!localDomains.includes(parsedUrl.host)) {
    return false;
  }

  // Check path format
  const pathMatch = SHORT_POST_LINK_PATTERN.exec(parsedUrl.pathname);
  if (!pathMatch) {
    return false;
  }

  const [, username, postId] = pathMatch;
  return USERNAME_PATTERN.test(username) && isValidPostId(postId);
}

/**
 * Parse post link and extract username and postId
 * @param {string} url - URL or path to parse
 * @param {string[]} localDomains - List of local domains (default: siteDomains from config)
 * @returns {{ username: string, postId: string } | null}
 */
export function parsePostLink(url, localDomains = siteDomains) {
  // Try short link first
  const shortMatch = SHORT_POST_LINK_PATTERN.exec(url);
  if (shortMatch) {
    const [, username, postId] = shortMatch;
    if (USERNAME_PATTERN.test(username) && isValidPostId(postId)) {
      return { username, postId };
    }
  }

  // Try full URL
  let parsedUrl;
  try {
    parsedUrl = new URL(linkHref(url));
  } catch {
    return null;
  }

  // Check if domain is local
  if (!localDomains.includes(parsedUrl.host)) {
    return null;
  }

  const pathMatch = SHORT_POST_LINK_PATTERN.exec(parsedUrl.pathname);
  if (!pathMatch) {
    return null;
  }

  const [, username, postId] = pathMatch;
  if (USERNAME_PATTERN.test(username) && isValidPostId(postId)) {
    return { username, postId };
  }

  return null;
}

/**
 * Check if the URL has a hash part (comment link)
 * @param {string} url - URL or path to check
 * @returns {boolean}
 */
export function hasCommentHash(url) {
  // Check for hash in short link
  if (url.includes('#')) {
    return true;
  }

  // Check for hash in full URL
  try {
    const parsedUrl = new URL(linkHref(url));
    return parsedUrl.hash.length > 0;
  } catch {
    // If it's not a valid URL, check for hash in the string
    return url.includes('#');
  }
}

// Comment link patterns (with hash)
// Short link: /username/postId#commentId or /username/postId#comment-UUID
const SHORT_COMMENT_LINK_PATTERN =
  /^\/([a-z\d-]{3,30})\/([\da-f]{6,10}|[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12})#(.+)$/i;

/**
 * Extract comment ID from hash string
 * Handles both formats: #abc123 (short) and #comment-UUID (legacy)
 * @param {string} hash - Hash string including #
 * @returns {string} - Comment ID (short or UUID)
 */
function extractCommentId(hash) {
  if (!hash || hash.length < 2) {
    return '';
  }
  // Remove leading #
  const id = hash.slice(1);
  // Handle legacy format: comment-UUID
  if (id.startsWith('comment-')) {
    return id.slice(8); // Remove 'comment-' prefix
  }
  return id;
}

/**
 * Check if the URL is a link to a FreeFeed comment
 * @param {string} url - URL or path to check
 * @param {string[]} localDomains - List of local domains (default: siteDomains from config)
 * @returns {boolean}
 */
export function isCommentLink(url, localDomains = siteDomains) {
  return parseCommentLink(url, localDomains) !== null;
}

/**
 * Parse comment link and extract username, postId, and commentId
 * @param {string} url - URL or path to parse
 * @param {string[]} localDomains - List of local domains (default: siteDomains from config)
 * @returns {{ username: string, postId: string, commentId: string } | null}
 */
export function parseCommentLink(url, localDomains = siteDomains) {
  // Try short link first
  const shortMatch = SHORT_COMMENT_LINK_PATTERN.exec(url);
  if (shortMatch) {
    const [, username, postId, hash] = shortMatch;
    const commentId = extractCommentId(`#${hash}`);
    if (USERNAME_PATTERN.test(username) && isValidPostId(postId) && commentId) {
      return { username, postId, commentId };
    }
  }

  // Try full URL
  let parsedUrl;
  try {
    parsedUrl = new URL(linkHref(url));
  } catch {
    return null;
  }

  // Check if domain is local
  if (!localDomains.includes(parsedUrl.host)) {
    return null;
  }

  // Check path format (without hash)
  const pathMatch = SHORT_POST_LINK_PATTERN.exec(parsedUrl.pathname);
  if (!pathMatch) {
    return null;
  }

  const [, username, postId] = pathMatch;
  const commentId = extractCommentId(parsedUrl.hash);

  if (USERNAME_PATTERN.test(username) && isValidPostId(postId) && commentId) {
    return { username, postId, commentId };
  }

  return null;
}
