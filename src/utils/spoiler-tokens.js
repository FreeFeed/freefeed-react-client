import { Token } from 'social-text-tokenizer';

import { byRegexp, makeToken } from 'social-text-tokenizer/cjs/lib';

const startSpoilerRegex = /<(spoiler|спойлер)>/gi;
const endSpoilerRegex = /<\/(spoiler|спойлер)>/gi;

class StartSpoiler extends Token {}
class EndSpoiler extends Token {}

const tokenizerStartSpoiler = byRegexp(startSpoilerRegex, makeToken(StartSpoiler));
const tokenizerEndSpoiler = byRegexp(endSpoilerRegex, makeToken(EndSpoiler));

// Make sure that the list of tokens contains only
// valid pairs of StartSpoiler/EndSpoiler tokens
const validateSpoilerTags = (tokenizer) => {
  return function (text) {
    const validated = [];
    let startSpoilerIndex = -1;
    const tokens = tokenizer(text);

    tokens.forEach((token, i) => {
      if (token instanceof StartSpoiler) {
        if (startSpoilerIndex !== -1) {
          // previous StartSpoiler is invalid
          validated[startSpoilerIndex] = null;
        }
        startSpoilerIndex = i;
        validated.push(token);
      } else if (token instanceof EndSpoiler) {
        if (startSpoilerIndex !== -1) {
          startSpoilerIndex = -1;
          validated.push(token);
        }
      } else {
        validated.push(token);
      }
    });

    if (startSpoilerIndex !== -1) {
      // un-closed StartSpoiler
      validated[startSpoilerIndex] = null;
    }

    return validated.filter(Boolean);
  };
};

export {
  tokenizerStartSpoiler,
  tokenizerEndSpoiler,
  StartSpoiler,
  EndSpoiler,
  validateSpoilerTags,
};
