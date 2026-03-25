/* global describe, it, expect, beforeEach, afterEach */
import {
  isPostLink,
  parsePostLink,
  hasCommentHash,
  isCommentLink,
  parseCommentLink,
} from '../../src/utils/post-link-utils';

describe('post-link-utils', () => {
  let originalConfig;

  beforeEach(() => {
    originalConfig = global.CONFIG;
    global.CONFIG = {
      siteDomains: ['freefeed.net', 'gamma.freefeed.net'],
    };
  });

  afterEach(() => {
    global.CONFIG = originalConfig;
  });

  describe('isPostLink', () => {
    it('should recognize short link with short ID', () => {
      expect(isPostLink('/username/abc123')).toBe(true);
      expect(isPostLink('/user-name/def456')).toBe(true);
      expect(isPostLink('/test-user/a1b2c3d4e5')).toBe(true);
    });

    it('should recognize short link with UUID', () => {
      expect(isPostLink('/username/12345678-1234-4123-8123-123456789abc')).toBe(true);
      expect(isPostLink('/user-name/abcdef12-3456-4789-abcd-ef1234567890')).toBe(true);
    });

    it('should recognize full URL with short ID', () => {
      expect(isPostLink('https://freefeed.net/username/abc123')).toBe(true);
      expect(isPostLink('http://freefeed.net/user-name/def456')).toBe(true);
      expect(isPostLink('https://gamma.freefeed.net/test/a1b2c3')).toBe(true);
    });

    it('should recognize full URL with UUID', () => {
      expect(isPostLink('https://freefeed.net/username/12345678-1234-4123-8123-123456789abc')).toBe(
        true,
      );
      expect(
        isPostLink('http://gamma.freefeed.net/user/abcdef12-3456-4789-abcd-ef1234567890'),
      ).toBe(true);
    });

    it('should reject links with hash (comment links)', () => {
      expect(isPostLink('/username/abc123#comment')).toBe(false);
      expect(isPostLink('/username/abc123#def456')).toBe(false);
      expect(isPostLink('https://freefeed.net/username/abc123#comment')).toBe(false);
      expect(
        isPostLink('https://freefeed.net/username/12345678-1234-4123-8123-123456789abc#c1'),
      ).toBe(false);
    });

    it('should reject invalid username format', () => {
      expect(isPostLink('/ab/abc123')).toBe(false); // too short
      expect(isPostLink('/user_name/abc123')).toBe(false); // underscore not allowed
      expect(isPostLink('/User/abc123')).toBe(false); // uppercase not allowed
      expect(isPostLink('/a'.repeat(31) + '/abc123')).toBe(false); // too long
    });

    it('should reject invalid post ID format', () => {
      expect(isPostLink('/username/abc12')).toBe(false); // too short (< 6)
      expect(isPostLink('/username/abc12345678901')).toBe(false); // too long (> 10)
      expect(isPostLink('/username/abcdefghij')).toBe(false); // contains non-hex chars
      expect(isPostLink('/username/12345678-1234-5123-8123-123456789abc')).toBe(false); // invalid UUID version
    });

    it('should reject non-local domains', () => {
      expect(isPostLink('https://example.com/username/abc123')).toBe(false);
      expect(isPostLink('https://twitter.com/username/abc123')).toBe(false);
    });

    it('should reject other local paths', () => {
      expect(isPostLink('/username')).toBe(false);
      expect(isPostLink('/username/comments')).toBe(false);
      expect(isPostLink('/username/likes')).toBe(false);
      expect(isPostLink('https://freefeed.net/settings')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isPostLink('not a url')).toBe(false);
      expect(isPostLink('')).toBe(false);
      expect(isPostLink('/')).toBe(false);
    });
  });

  describe('parsePostLink', () => {
    it('should parse short link with short ID', () => {
      expect(parsePostLink('/username/abc123')).toEqual({
        username: 'username',
        postId: 'abc123',
      });
      expect(parsePostLink('/test-user/def456')).toEqual({
        username: 'test-user',
        postId: 'def456',
      });
    });

    it('should parse short link with UUID', () => {
      expect(parsePostLink('/username/12345678-1234-4123-8123-123456789abc')).toEqual({
        username: 'username',
        postId: '12345678-1234-4123-8123-123456789abc',
      });
    });

    it('should parse full URL with short ID', () => {
      expect(parsePostLink('https://freefeed.net/username/abc123')).toEqual({
        username: 'username',
        postId: 'abc123',
      });
      expect(parsePostLink('http://gamma.freefeed.net/test/def456')).toEqual({
        username: 'test',
        postId: 'def456',
      });
    });

    it('should parse full URL with UUID', () => {
      expect(
        parsePostLink('https://freefeed.net/user/12345678-1234-4123-8123-123456789abc'),
      ).toEqual({
        username: 'user',
        postId: '12345678-1234-4123-8123-123456789abc',
      });
    });

    it('should return null for invalid links', () => {
      expect(parsePostLink('/username/abc123#comment')).toBeNull();
      expect(parsePostLink('/ab/abc123')).toBeNull();
      expect(parsePostLink('/username/abc12')).toBeNull();
      expect(parsePostLink('https://example.com/username/abc123')).toBeNull();
      expect(parsePostLink('not a url')).toBeNull();
      expect(parsePostLink('')).toBeNull();
    });

    it('should handle URLs with query parameters', () => {
      expect(parsePostLink('https://freefeed.net/username/abc123?foo=bar')).toEqual({
        username: 'username',
        postId: 'abc123',
      });
    });
  });

  describe('hasCommentHash', () => {
    it('should detect hash in short links', () => {
      expect(hasCommentHash('/username/abc123#comment')).toBe(true);
      expect(hasCommentHash('/username/abc123#def456')).toBe(true);
      expect(hasCommentHash('/username/abc123#')).toBe(true);
    });

    it('should detect hash in full URLs', () => {
      expect(hasCommentHash('https://freefeed.net/username/abc123#comment')).toBe(true);
      expect(hasCommentHash('https://freefeed.net/username/abc123#def456')).toBe(true);
      expect(hasCommentHash('http://gamma.freefeed.net/user/abc123#c1')).toBe(true);
    });

    it('should return false for links without hash', () => {
      expect(hasCommentHash('/username/abc123')).toBe(false);
      expect(hasCommentHash('https://freefeed.net/username/abc123')).toBe(false);
      expect(hasCommentHash('https://freefeed.net/username/abc123?foo=bar')).toBe(false);
    });

    it('should handle invalid URLs', () => {
      expect(hasCommentHash('not#a#url')).toBe(true);
      expect(hasCommentHash('not a url')).toBe(false);
      expect(hasCommentHash('')).toBe(false);
    });
  });

  describe('isCommentLink', () => {
    it('should recognize short link with short comment ID', () => {
      expect(isCommentLink('/username/abc123#def456')).toBe(true);
      expect(isCommentLink('/user-name/abc123#c1d2e3')).toBe(true);
    });

    it('should recognize short link with legacy comment-UUID format', () => {
      expect(isCommentLink('/username/abc123#comment-12345678-1234-4123-8123-123456789abc')).toBe(
        true,
      );
    });

    it('should recognize full URL with short comment ID', () => {
      expect(isCommentLink('https://freefeed.net/username/abc123#def456')).toBe(true);
      expect(isCommentLink('http://gamma.freefeed.net/user/abc123#c1')).toBe(true);
    });

    it('should recognize full URL with legacy comment-UUID format', () => {
      expect(
        isCommentLink(
          'https://freefeed.net/username/abc123#comment-12345678-1234-4123-8123-123456789abc',
        ),
      ).toBe(true);
    });

    it('should reject links without hash', () => {
      expect(isCommentLink('/username/abc123')).toBe(false);
      expect(isCommentLink('https://freefeed.net/username/abc123')).toBe(false);
    });

    it('should reject non-local domains', () => {
      expect(isCommentLink('https://example.com/username/abc123#def456')).toBe(false);
    });

    it('should reject invalid URLs', () => {
      expect(isCommentLink('not a url')).toBe(false);
      expect(isCommentLink('')).toBe(false);
    });
  });

  describe('parseCommentLink', () => {
    it('should parse short link with short comment ID', () => {
      expect(parseCommentLink('/username/abc123#def456')).toEqual({
        username: 'username',
        postId: 'abc123',
        commentId: 'def456',
      });
    });

    it('should parse short link with legacy comment-UUID format', () => {
      expect(
        parseCommentLink('/username/abc123#comment-12345678-1234-4123-8123-123456789abc'),
      ).toEqual({
        username: 'username',
        postId: 'abc123',
        commentId: '12345678-1234-4123-8123-123456789abc',
      });
    });

    it('should parse full URL with short comment ID', () => {
      expect(parseCommentLink('https://freefeed.net/username/abc123#def456')).toEqual({
        username: 'username',
        postId: 'abc123',
        commentId: 'def456',
      });
      expect(parseCommentLink('http://gamma.freefeed.net/test-user/abc123#c1')).toEqual({
        username: 'test-user',
        postId: 'abc123',
        commentId: 'c1',
      });
    });

    it('should parse full URL with legacy comment-UUID format', () => {
      expect(
        parseCommentLink(
          'https://freefeed.net/username/abc123#comment-12345678-1234-4123-8123-123456789abc',
        ),
      ).toEqual({
        username: 'username',
        postId: 'abc123',
        commentId: '12345678-1234-4123-8123-123456789abc',
      });
    });

    it('should return null for links without hash', () => {
      expect(parseCommentLink('/username/abc123')).toBeNull();
      expect(parseCommentLink('https://freefeed.net/username/abc123')).toBeNull();
    });

    it('should return null for invalid URLs', () => {
      expect(parseCommentLink('/ab/abc123#def')).toBeNull(); // invalid username
      expect(parseCommentLink('/username/abc12#def')).toBeNull(); // invalid postId
      expect(parseCommentLink('https://example.com/username/abc123#def')).toBeNull();
      expect(parseCommentLink('not a url')).toBeNull();
      expect(parseCommentLink('')).toBeNull();
    });
  });
});
