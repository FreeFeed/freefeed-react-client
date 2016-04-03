import {api as apiConfig} from '../config';
import {getToken} from './auth';
import io from 'socket.io-client';

const dummyPost = {
  getBoundingClientRect: _ => ({top:0})
};

const scrollCompensator = dispatchAction => (...actionParams) => {
  //we hope that markup will remain the same — best tradeoff between this and code all over components
  const postCommentNodes = [...document.querySelectorAll('.post, .comment')];

  const firstVisible = postCommentNodes.filter(element => element.getBoundingClientRect().top > 0)[0];

  const nearestTopIndex = postCommentNodes.indexOf(firstVisible) - 1;

  const nearestTop = postCommentNodes[nearestTopIndex] || dummyPost;

  const topBefore = nearestTop.getBoundingClientRect().top;

  //here we're dispatching, so render is called internally and after call we have new page
  const res = dispatchAction(...actionParams);

  const topAfter = nearestTop.getBoundingClientRect().top;

  if (topAfter !== topBefore) {
    scrollBy(0, topAfter - topBefore);
  }
  return res;
};

const bindSocketLog = socket => eventName => socket.on(eventName, data => console.log(`socket ${eventName}`, data));

const bindSocketActionsLog = socket => events => events.forEach(bindSocketLog(socket));

const eventsToLog = [
  'connect',
  'error',
  'disconnect',
  'reconnect',
];

const bindSocketEventHandlers = socket => eventHandlers => {
  Object.keys(eventHandlers).forEach((event) => socket.on(event, scrollCompensator(eventHandlers[event])));
};

const openSocket = _ => io.connect(`${apiConfig.host}/`, {query: `token=${getToken()}`});

export function init(eventHandlers){
  const socket = openSocket();

  bindSocketEventHandlers(socket)(eventHandlers);

  bindSocketActionsLog(socket)(eventsToLog);

  let subscription;
  let subscribe;

  return {
    unsubscribe: _ => {
      if (subscription){
        console.log('unsubscribing from ', subscription);
        socket.emit('unsubscribe', subscription);
        socket.off('reconnect', subscribe);
      }
    },
    subscribe: newSubscription => {
      subscription = newSubscription;
      console.log('subscribing to ', subscription);
      subscribe = () => socket.emit('subscribe', subscription);
      socket.on('reconnect', subscribe);
      subscribe();
    },
    disconnect: _ => socket.disconnect()
  };
}
