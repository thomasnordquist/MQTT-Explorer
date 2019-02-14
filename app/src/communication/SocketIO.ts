import * as io from 'socket.io-client'

import { EventBusInterface, Event } from '../../../events'

class SocketIoClient implements EventBusInterface {
  private client?: any
  constructor(url = 'http://localhost:3000') {
    this.client = io(url)
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback:(msg: MessageType) => void) {
    this.client.on(event.topic, callback)
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    this.client.removeAllListeners()
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    this.client.removeListener(event.topic, callback)
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    this.client.emit(event.topic, msg)
  }
}

export const rendererEvents = new SocketIoClient()
