import { CallbackStore } from './CallbackStore'
import { EventBusInterface } from './EventBusInterface'
import { Event } from '../Events'

// Generic socket interface that socket.io-client's Socket implements
// This avoids direct dependency on socket.io-client package
export interface SocketLike {
  on(event: string, callback: (...args: any[]) => void): any
  off(event: string, callback: (...args: any[]) => void): any
  removeAllListeners(event: string): any
  emit(event: string, ...args: any[]): any
}

export class SocketIOClientEventBus implements EventBusInterface {
  private socket: SocketLike
  private callbacks: Array<CallbackStore> = []

  constructor(socket: SocketLike) {
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
