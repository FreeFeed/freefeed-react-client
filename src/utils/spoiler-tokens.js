import { Token } from 'social-text-tokenizer';

import byRegexp, { makeToken } from 'social-text-tokenizer/build/cjs/lib/byRegexp';

const startSpoilerRegex = /<(spoiler|спойлер)>/gi;
const endSpoilerRegex = /<\/(spoiler|спойлер)>/gi;

class StartSpoiler extends Token {}
class EndSpoiler extends Token {}

const tokenizerStartSpoiler = byRegexp(startSpoilerRegex, makeToken(StartSpoiler));
const tokenizerEndSpoiler = byRegexp(endSpoilerRegex, makeToken(EndSpoiler));

export { tokenizerStartSpoiler, tokenizerEndSpoiler, StartSpoiler, EndSpoiler };
