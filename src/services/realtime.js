import io from 'socket.io-client';

import config from '../config';
import { getToken } from './auth';

const apiConfig = config.api;

const dummyPost = {
  getBoundingClientRect: () => ({ top:0 })
};

const scrollCompensator = (dispatchAction) => (...actionParams) => {
  //we hope that markup will remain the same — best tradeoff between this and code all over components
  const postCommentNodes = [...document.querySelectorAll('.post, .comment')];

  const [firstVisible] = postCommentNodes.filter((element) => element.getBoundingClientRect().top > 0);

  const nearestTopIndex = postCommentNodes.indexOf(firstVisible) - 1;

  const nearestTop = postCommentNodes[nearestTopIndex] || dummyPost;

  const topBefore = nearestTop.getBoundingClientRect().top;
  const heightBefore = document.body.offsetHeight;

  //here we're dispatching, so render is called internally and after call we have new page
  const res = dispatchAction(...actionParams);

  if (res.then) {
    res.then(() => {
      const topAfter = nearestTop.getBoundingClientRect().top;
      const heightAfter = document.body.offsetHeight;

      if (topAfter !== topBefore) {
        scrollBy(0, heightAfter - heightBefore);
      }
    });
  }

  const topAfter = nearestTop.getBoundingClientRect().top;
  const heightAfter = document.body.offsetHeight;

  if (topAfter !== topBefore) {
    scrollBy(0, heightAfter - heightBefore);
  }
  return res;
};

const bindSocketLog = (socket) => (eventName) => socket.on(eventName, (data) => console.log(`socket ${eventName}`, data));  // eslint-disable-line no-console

const bindSocketActionsLog = (socket) => (events) => events.forEach(bindSocketLog(socket));

const eventsToLog = [
  'connect',
  'error',
  'disconnect',
  'reconnect',
];

export class Connection {
  socket;

  constructor(eventHandlers) {
    this.socket = improveSocket(io(`${apiConfig.host}/`));
    bindSocketActionsLog(this.socket)(eventsToLog);

    this.socket.on('connect', () => {
      if ('connect' in eventHandlers) {
        eventHandlers.connect();
      }
    });

    this.socket.on('*', (event, data) => {
      if (event in eventHandlers) {
        scrollCompensator(eventHandlers[event])(data);
      }
    });
  }

  async reAuthorize() {
    if (this.socket.connected) {
      await this.socket.emitAsync('auth', { authToken: getToken() });
    }
  }

  async subscribeTo(room) {
    if (this.socket.connected) {
      console.log('subscribing to', room);  // eslint-disable-line no-console
      await this.socket.emitAsync('subscribe', roomToHash(room));
    }
  }

  async unsubscribeFrom(room) {
    if (this.socket.connected) {
      console.log('unsubscribing from', room);  // eslint-disable-line no-console
      await this.socket.emitAsync('unsubscribe', roomToHash(room));
    }
  }
}

function improveSocket(socket) {
  // Asynt emitter
  socket.emitAsync = (event, ...args) => new Promise((resolve) => socket.emit(event, ...[...args, resolve]));

  // Catch-all event handler (https://stackoverflow.com/a/33960032)
  const { onevent } = socket;
  socket.onevent = (packet) => {
    onevent.call(socket, packet);
    packet.data = ["*"].concat(packet.data || []);
    onevent.call(socket, packet);
  };
  return socket;
}

function roomToHash(room) {
  const [type, id] = room.split(':', 2);
  return { [type]: [id] };
}
