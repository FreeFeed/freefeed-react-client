import { startAnimation } from './throbber-animation';

self.onmessage = (e) => startAnimation(e.data);
