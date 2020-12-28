/* global CONFIG */
import io from 'socket.io-client';

import {
  realtimeSocketDebug as socketDebug,
  realtimeSubscriptionDebug as subscriptionDebug,
} from '../utils/debug';
import { getToken } from './auth';

const bindSocketLog = (socket) => (eventName) =>
  socket.on(eventName, (data) => socketDebug(`got event: ${eventName}`, data));

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
      subscriptionDebug('subscribing to', rooms);
      await this.socket.emitAsync('subscribe', roomsToHash(rooms));
    }
  }

  async unsubscribeFrom(...rooms) {
    if (this.socket.connected && rooms.length > 0) {
      subscriptionDebug('unsubscribing from', rooms);
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
