import { IpcRenderer } from 'electron'
import { CallbackStore } from './CallbackStore'
import { EventBusInterface } from './EventBusInterface'
import { Event } from '../Events'

export class IpcRendererEventBus implements EventBusInterface {
  private ipc: IpcRenderer

  private callbacks: Array<CallbackStore> = []

  constructor(ipc: IpcRenderer) {
    this.ipc = ipc
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback: (msg: MessageType) => void) {
    const wrappedCallback = (_: any, arg: any) => {
      callback(arg)
    }
    console.log('subscribing', event.topic)
    this.ipc.on(event.topic, wrappedCallback)
    this.callbacks.push({
      callback,
      wrappedCallback,
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    this.ipc.removeAllListeners(event.topic)
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    const item = this.callbacks.find(store => store.callback === callback)
    if (!item) {
      return
    }
    this.ipc.removeListener(event.topic, item.wrappedCallback)
    this.callbacks = this.callbacks.filter(a => a !== item)
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    this.ipc.send(event.topic, msg)
  }
}
