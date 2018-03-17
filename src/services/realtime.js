import io from 'socket.io-client';
import _ from 'lodash';

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
  rooms = [];

  constructor(eventHandlers) {
    this.socket = improveSocket(io(`${apiConfig.host}/`));
    bindSocketActionsLog(this.socket)(eventsToLog);

    this.socket.on('connect', async () => {
      await this.socket.emitAsync('auth', { authToken: getToken() }); // should always be first
      await this.socket.emitAsync('subscribe', roomsToHash(this.rooms));
    });

    this.socket.on('*', (event, data) => {
      if (data.realtimeChannels && _.intersection(data.realtimeChannels, this.rooms).length === 0) {
        return;
      }
      if (eventHandlers[event]) {
        scrollCompensator(eventHandlers[event])(data);
      }
    });
  }

  async reAuthorize() {
    if (this.socket.connected) {
      await this.socket.emitAsync('auth', { authToken: getToken() });
    }
  }

  async subscribe(...newRooms) {
    const diff = _.difference(newRooms, this.rooms);
    if (diff.length > 0) {
      console.log('subscribing to ', diff);  // eslint-disable-line no-console
      this.rooms = _.union(this.rooms, newRooms);
      if (this.socket.connected) {
        await this.socket.emitAsync('subscribe', roomsToHash(diff));
      }
    }
  }

  async unsubscribe(predicate = () => true) {
    const diff = this.rooms.filter(predicate);
    if (diff.length > 0) {
      console.log('unsubscribing from ', diff);  // eslint-disable-line no-console
      this.rooms = _.difference(this.rooms, diff);
      if (this.socket.connected) {
        await this.socket.emitAsync('unsubscribe', roomsToHash(diff));
      }
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

function roomsToHash(rooms) {
  return rooms.reduce((hash, room) => {
    const [type, id] = room.split(':', 2);
    hash[type] = hash[type] || [];
    hash[type].push(id);
    return hash;
  }, {});
}
