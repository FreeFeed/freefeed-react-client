require('../config/lib/loader-node');

// https://github.com/testing-library/react-testing-library/issues/470
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  set: () => {},
});
