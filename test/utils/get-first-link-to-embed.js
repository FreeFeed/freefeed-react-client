import test from 'tape';

import { getFirstLinkToEmbed } from '../../src/utils';

const testLink = 'http://facebook.com';
const secondTestLink = 'http://twitter.com';
const freefeedTestLink = 'http://freefeed.net/kadmil';
const protocolLessTestLink = 'mail.ru';

test('getFirstLinkToEmbed selects link then where\'s only link', (t) => {
  const testText = `${testLink}`;

  const result = getFirstLinkToEmbed(testText);

  t.equal(result, testLink);

  t.end();
});


test('getFirstLinkToEmbed selects link then where\'s one', (t) => {
  const testText = `ururur ${testLink} ararar`;

  const result = getFirstLinkToEmbed(testText);

  t.equal(result, testLink);

  t.end();
});

test('getFirstLinkToEmbed returns undefined then where\'s no link', (t) => {
  const testText = `ururur ararar`;

  const result = getFirstLinkToEmbed(testText);

  t.notOk(result);

  t.end();
});

test('getFirstLinkToEmbed returns undefined then where\'s ! before the link', (t) => {
  const testText = `ururur !${testLink} ararar`;

  const result = getFirstLinkToEmbed(testText);

  t.notOk(result);

  t.end();
});

test('getFirstLinkToEmbed ignores link with ! before', (t) => {
  const testText = `ururur !${testLink} ${secondTestLink} ararar`;

  const result = getFirstLinkToEmbed(testText);

  t.equal(result, secondTestLink);

  t.end();
});

test('getFirstLinkToEmbed ignores freefeed links', (t) => {
  const testText = `ururur ${freefeedTestLink} ${testLink} ararar`;

  const result = getFirstLinkToEmbed(testText);

  t.equal(result, testLink);

  t.end();
});

test('getFirstLinkToEmbed ignores protocolless links', (t) => {
  const testText = `ururur ${protocolLessTestLink} ${testLink} ararar`;

  const result = getFirstLinkToEmbed(testText);

  t.equal(result, testLink);

  t.end();
});
