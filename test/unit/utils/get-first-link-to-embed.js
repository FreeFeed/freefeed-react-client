/* global CONFIG */
import { describe, it } from 'vitest';
import expect from 'unexpected';

const { siteDomains } = CONFIG;

import { getFirstLinkToEmbed } from '../../../src/utils/parse-text';

const testLink = 'http://facebook.com/';
const secondTestLink = 'http://twitter.com/';
const freefeedTestLink = `http://${siteDomains[0]}/kadmil`;
const protocolLessTestLink = 'mail.ru';

describe('getFirstLinkToEmbed()', () => {
  it(`should select link when there's nothing but the link`, () => {
    const testText = `${testLink}`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', testLink);
  });

  it(`should select link when there's one link embedded in text`, () => {
    const testText = `ururur ${testLink} ararar`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', testLink);
  });

  it(`should return undefined when there's no link in input`, () => {
    const testText = `ururur ararar`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to be undefined');
  });

  it(`should returns undefined when there's "!" preceding the only link`, () => {
    const testText = `ururur !${testLink} ararar`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to be undefined');
  });

  it('should select second link when first one is preceded by "!"', () => {
    const testText = `ururur !${testLink} ${secondTestLink} ararar`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', secondTestLink);
  });

  it('should ignore links to freefeed', () => {
    const testText = `ururur ${freefeedTestLink} ${testLink} ararar`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', testLink);
  });

  it('should ignore protocolless links', () => {
    const testText = `ururur ${protocolLessTestLink} ${testLink} ararar`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', testLink);
  });

  it('should return short path for short post link', () => {
    const shortLink = '/testuser/abc123';
    const testText = `check this post ${shortLink} ok`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', shortLink);
  });

  it('should return short path for short comment link', () => {
    const shortLinkWithHash = '/testuser/abc123#ab12';
    const testText = `check this comment ${shortLinkWithHash} ok`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', shortLinkWithHash);
  });

  it('should return full URL for full comment link', () => {
    const commentLink = `https://${siteDomains[0]}/testuser/abc123#ab12`;
    const testText = `check this comment ${commentLink} ok`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', commentLink);
  });

  it('should return full URL for full comment link with legacy format', () => {
    const commentLink = `https://${siteDomains[0]}/testuser/abc123#comment-12345678-1234-4123-8123-123456789abc`;
    const testText = `check this comment ${commentLink} ok`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', commentLink);
  });

  it('should ignore short link preceded by "!"', () => {
    const shortLink = '/testuser/abc123';
    const testText = `don't embed !${shortLink} but embed ${testLink}`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', testLink);
  });

  it('should select short link over regular link when short link comes first', () => {
    const shortLink = '/testuser/abc123';
    const testText = `${shortLink} and ${testLink}`;
    const result = getFirstLinkToEmbed(testText);

    expect(result, 'to equal', shortLink);
  });
});
