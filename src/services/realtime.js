/* global CONFIG */
import createDebug from 'debug';
import io from 'socket.io-client';

import { getToken } from './auth';

const dummyPost = { getBoundingClientRect: () => ({ top: 0 }) };

const scrollDebug = createDebug('freefeed:react:realtime:scrollCompensator');
export const scrollCompensator = (dispatchAction) => (...actionParams) => {
  // we hope that markup will remain the same — best tradeoff between this and code all over components
  const postCommentNodes = [...document.querySelectorAll('.post, .comment')];

  const [firstVisible] = postCommentNodes.filter(
    (element) => element.getBoundingClientRect().top > 0,
  );

  const nearestTopIndex = postCommentNodes.indexOf(firstVisible) - 1;

  const nearestTop = postCommentNodes[nearestTopIndex] || dummyPost;

  const topBefore = nearestTop.getBoundingClientRect().top;
  const heightBefore = document.body.offsetHeight;

  // here we're dispatching, so render is called internally and after call we have new page
  const res = dispatchAction(...actionParams);

  if (res.then) {
    res.then(() => {
      const topAfter = nearestTop.getBoundingClientRect().top;
      const heightAfter = document.body.offsetHeight;

      if (topAfter !== topBefore) {
        const heightOffset = heightAfter - heightBefore;
        scrollDebug('Asynchronous action changed height. Compensating', {
          offset: heightOffset,
        });
        scrollBy(0, heightOffset);
      }
    });
  } else {
    const topAfter = nearestTop.getBoundingClientRect().top;
    const heightAfter = document.body.offsetHeight;

    if (topAfter !== topBefore) {
      const heightOffset = heightAfter - heightBefore;
      scrollDebug('Action changed height. Compensating', {
        offset: heightOffset,
      });
      scrollBy(0, heightOffset);
    }
  }

  return res;
};

const bindSocketLog = (socket) => (eventName) =>
  socket.on(eventName, (data) => console.log(`socket ${eventName}`, data)); // eslint-disable-line no-console

const bindSocketActionsLog = (socket) => (events) => events.forEach(bindSocketLog(socket));

const eventsToLog = ['connect', 'error', 'disconnect', 'reconnect'];

export class Connection {
  socket;

  constructor() {
    this.socket = improveSocket(io(`${CONFIG.api.root}/`));
    bindSocketActionsLog(this.socket)(eventsToLog);
  }

  onConnect(handler) {
    this.socket.on('connect', handler);
  }

  onEvent(handler) {
    this.socket.on('*', handler);
  }

  async reAuthorize() {
    if (this.socket.connected) {
      await this.socket.emitAsync('auth', { authToken: getToken() });
    }
  }

  async subscribeTo(...rooms) {
    if (this.socket.connected && rooms.length > 0) {
      console.log('subscribing to', rooms); // eslint-disable-line no-console
      await this.socket.emitAsync('subscribe', roomsToHash(rooms));
    }
  }

  async unsubscribeFrom(...rooms) {
    if (this.socket.connected && rooms.length > 0) {
      console.log('unsubscribing from', rooms); // eslint-disable-line no-console
      await this.socket.emitAsync('unsubscribe', roomsToHash(rooms));
    }
  }
}

function improveSocket(socket) {
  // Asynt emitter
  socket.emitAsync = (event, ...args) =>
    new Promise((resolve) => socket.emit(event, ...[...args, resolve]));

  // Catch-all event handler (https://stackoverflow.com/a/33960032)
  const { onevent } = socket;
  socket.onevent = (packet) => {
    onevent.call(socket, packet);
    packet.data = ['*'].concat(packet.data || []);
    onevent.call(socket, packet);
  };
  return socket;
}

function roomsToHash(rooms) {
  const result = {};
  for (const room of rooms) {
    const [type, id] = room.split(':', 2);
    if (type in result) {
      result[type].push(id);
    } else {
      result[type] = [id];
    }
  }
  return result;
}
