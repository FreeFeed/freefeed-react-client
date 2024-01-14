/**
 * Simple fullscreen API helper,
 * supports unprefixed and webkit-prefixed versions
 * @see https://photoswipe.com/native-fullscreen-on-open/
 */
export function getFullscreenAPI() {
  let api;
  let enterFS;
  let exitFS;
  let elementFS;
  let changeEvent;
  let errorEvent;

  if (document.fullscreenEnabled) {
    enterFS = 'requestFullscreen';
    exitFS = 'exitFullscreen';
    elementFS = 'fullscreenElement';
    changeEvent = 'fullscreenchange';
    errorEvent = 'fullscreenerror';
  } else if (document.webkitFullscreenEnabled) {
    enterFS = 'webkitRequestFullscreen';
    exitFS = 'webkitExitFullscreen';
    elementFS = 'webkitFullscreenElement';
    changeEvent = 'webkitfullscreenchange';
    errorEvent = 'webkitfullscreenerror';
  }

  if (enterFS) {
    api = {
      request(el) {
        if (enterFS === 'webkitRequestFullscreen') {
          return el[enterFS](Element.ALLOW_KEYBOARD_INPUT);
        }
        return el[enterFS]();
      },

      exit() {
        return document[exitFS]();
      },

      isFullscreen() {
        return document[elementFS];
      },

      changeEvent,
      errorEvent,
    };
  }

  return api;
}
