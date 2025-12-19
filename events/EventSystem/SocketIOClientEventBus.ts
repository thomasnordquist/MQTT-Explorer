import { Socket } from 'socket.io-client'
import { CallbackStore } from './CallbackStore'
import { EventBusInterface } from './EventBusInterface'
import { Event } from '../Events'

export class SocketIOClientEventBus implements EventBusInterface {
  private socket: Socket
  private callbacks: Array<CallbackStore> = []

  constructor(socket: Socket) {
    this.socket = socket
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback: (msg: MessageType) => void) {
    const wrappedCallback = (arg: any) => {
      callback(arg)
    }
    console.log('subscribing', event.topic)
    this.socket.on(event.topic, wrappedCallback)
    this.callbacks.push({
      callback,
      wrappedCallback,
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    this.socket.removeAllListeners(event.topic)
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    const item = this.callbacks.find(store => store.callback === callback)
    if (!item) {
      return
    }
    this.socket.off(event.topic, item.wrappedCallback)
    this.callbacks = this.callbacks.filter(a => a !== item)
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    this.socket.emit(event.topic, msg)
  }
}
