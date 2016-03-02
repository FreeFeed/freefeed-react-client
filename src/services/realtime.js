import {api as apiConfig} from '../config'
import {getToken} from './auth'
import io from 'socket.io-client'

export function init(eventHandlers){
  const socket = io.connect(`${apiConfig.host}/`, {query: `token=${getToken()}`})
  Object.keys(eventHandlers).forEach((event) => socket.on(event, eventHandlers[event]))
  return {
    socket,
    changeSubscription: function(newSubscription) {
      if (this.subscription){
        this.socket.emit('unsubscribe', this.subscription)
        this.socket.off('reconnect', this.subscribe)
      }
      this.subscription = newSubscription
      this.subscribe = () => this.socket.emit('subscribe', this.subscription)
      this.socket.on('reconnect', this.subscribe)
      this.subscribe()
    },
    disconnect: function() {
      this.socket.disconnect()
    }
  }
}

const dummyPost = {
  getBoundingClientRect: _ => ({top:0})
}

export const scrollCompensator = dispatchAction => (...actionParams) => {
  //we hope that markup will remain the same — best tradeoff between this and code all over components
  const postCommentNodes = [...document.querySelectorAll('.post, .comment')]

  const firstVisible = postCommentNodes.filter(element => element.getBoundingClientRect().top > 0)[0]

  const nearestTopIndex = postCommentNodes.indexOf(firstVisible) - 1

  const nearestTop = postCommentNodes[nearestTopIndex] || dummyPost

  const topBefore = nearestTop.getBoundingClientRect().top

  //here we're dispatching, so render is called internally and after call we have new page
  const res = dispatchAction(...actionParams)

  const topAfter = nearestTop.getBoundingClientRect().top

  if (topAfter !== topBefore) {
    scrollBy(0, topAfter - topBefore)
  }
  return res
}