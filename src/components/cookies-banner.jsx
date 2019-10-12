import React from 'react';
import { useSubscription } from 'use-subscription';

import { cookiesEnabled } from '../services/feat-detection';

export function CookiesBanner() {
  const enabled = useSubscription(cookiesEnabledSub);

  return (
    enabled || (
      <div className="alert alert-warning">
        <p>
          <strong>Warning!</strong> It seems that 🍪 cookies are disabled in your browser!
        </p>
        <p>
          Cookies support is necessary for authorization on our website. Please enable it or you
          will not be able to sign in.
        </p>
      </div>
    )
  );
}

const cookiesEnabledSub = (() => {
  let currentValue = true;
  const listeners = [];

  let timer = null;

  return {
    getCurrentValue: () => currentValue,
    subscribe: (callback) => {
      if (listeners.length === 0) {
        currentValue = cookiesEnabled();
        timer = setInterval(() => {
          const value = cookiesEnabled();
          if (value !== currentValue) {
            currentValue = value;
            listeners.forEach((l) => l());
          }
        }, 2000);
      }
      listeners.push(callback);
      return () => {
        const p = listeners.indexOf(callback);
        p >= 0 && listeners.splice(p, 1);
        if (listeners.length === 0) {
          clearInterval(timer);
        }
      };
    },
  };
})();
