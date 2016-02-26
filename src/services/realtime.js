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
      }
      this.subscription = newSubscription
      this.socket.emit('subscribe', this.subscription)
    },
    disconnect: function() {
      this.socket.disconnect()
    }
  }
}
