import memoize from 'memoize-one';

// See https://learn.microsoft.com/en-us/globalization/windows-keyboard-layouts
const KBD_US = `\`1234567890-=\\qwertyuiop[]asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+|QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>?`;
const KBD_Russian = `ё1234567890-=\\йцукенгшщзхъфывапролджэячсмитьбю.Ё!"№;%:?*()_+/ЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ,`;
const KBD_Ukrainian = `\`1234567890-=\\йцукенгшщзхїфівапролджєячсмитьбю.~!"№;%:?*()_+/ЙЦУКЕНГШЩЗХЇФІВАПРОЛДЖЄЯЧСМИТЬБЮ,`;

const kbdLayouts = [KBD_US, KBD_Russian, KBD_Ukrainian];

export const kbdVariants = memoize((input) => {
  const results = new Set([input]);
  for (let i = 0; i < kbdLayouts.length; i++) {
    for (let j = 0; j < kbdLayouts.length; j++) {
      if (i === j) {
        continue;
      }
      const l1 = kbdLayouts[i];
      const l2 = kbdLayouts[j];
      let variant = '';
      for (const char of input) {
        const idx = l1.indexOf(char);
        if (idx >= 0) {
          variant += l2[idx];
        } else {
          variant += char;
        }
      }
      results.add(variant);
    }
  }
  return results;
});
