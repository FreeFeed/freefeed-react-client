import { describe, it } from 'mocha';
import expect from 'unexpected';

import { getFirstLinkToEmbed } from '../../../src/utils/parse-text';

const testLink = 'http://facebook.com/';
const secondTestLink = 'http://twitter.com/';
const freefeedTestLink = 'http://freefeed.net/kadmil';
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
});
