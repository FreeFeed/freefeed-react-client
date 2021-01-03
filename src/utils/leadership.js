import { isSupported } from 'local-storage-fallback';

import { leaderDebug } from './debug';

/**
 * Simple leader (s)election algorithm
 *
 * Each node awaits (baseElectInterval * (1 + Math.random())) ms for the ping
 * from the current leader. If no signal is received, node becames leader and
 * pings other nodes every pingInterval ms.
 *
 * We use localStorage instead of the other mechanisms here because it is a more
 * reliable method for background tabs (see
 * https://github.com/pubkey/broadcast-channel/issues/414).
 */
export function takeLeadership({ pingInterval, baseElectInterval, storageKey }) {
  if (!isSupported('localStorage')) {
    leaderDebug('localStorage is not supported, rejecting');
    return Promise.reject(new Error('🚫 localStorage is not supported'));
  }

  return new Promise((resolve) => {
    let electTimer = 0;
    const becameLeader = () => {
      leaderDebug('🏆 we are leader now!');
      window.clearInterval(electTimer);
      electTimer = 0;
      broadcast(storageKey, 'leader');
      setInterval(() => broadcast(storageKey, 'leader'), pingInterval);
      resolve();
    };
    window.addEventListener('storage', (e) => {
      if (e.key === storageKey && e.newValue !== null && electTimer) {
        leaderDebug(`🔄 we are not a leader, restarting election sycle`);
        window.clearInterval(electTimer);
        electTimer = setTimeout(becameLeader, baseElectInterval * (1 + Math.random()));
      }
    });
    leaderDebug(`🏁 starting election sycle`);
    electTimer = setTimeout(becameLeader, baseElectInterval * (1 + Math.random()));
  });
}

function broadcast(key, value) {
  // localStorage API is synchronous, so use setTimeout to not block the main
  // handler
  setTimeout(() => {
    leaderDebug(`📣 sending message: ${JSON.stringify({ key, value })}`);
    window.localStorage.setItem(key, value);
    window.localStorage.removeItem(key);
  }, 0);
}
