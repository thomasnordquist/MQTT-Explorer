import { IpcMain, IpcRenderer, ipcMain, ipcRenderer } from 'electron'

import { Event } from './Events'

export interface EventBusInterface {
  subscribe<MessageType>(event: Event<MessageType>, callback:(msg: MessageType) => void): void
  unsubscribeAll<MessageType>(event: Event<MessageType>): void
  emit<MessageType>(event: Event<MessageType>, msg: MessageType): void
  unsubscribe<MessageType>(event: Event<MessageType>, callback: any): void
}

interface CallbackStore {
  wrappedCallback: any
  callback: any
}

class IpcMainEventBus implements EventBusInterface {
  private ipc: IpcMain
  private client: any
  constructor(ipc: IpcMain) {
    this.ipc = ipc
  }

  public subscribe<MessageType>(subscribeEvent: Event<MessageType>, callback:(msg: MessageType) => void) {
    console.log('subscribing', subscribeEvent.topic)
    this.ipc.on(subscribeEvent.topic, (event: any, arg: any) => {
      console.log(subscribeEvent.topic, arg)
      this.client = event.sender
      callback(arg)
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    this.ipc.removeAllListeners(event.topic)
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented') // Todo: implement
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    if (!this.client.isDestroyed()) {
      console.log(event.topic, msg)

      this.client.send(event.topic, msg)
    }
  }
}

class IpcRendererEventBus implements EventBusInterface {
  private ipc: IpcRenderer
  private callbacks: CallbackStore[] = []

  constructor(ipc: IpcRenderer) {
    this.ipc = ipc
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback:(msg: MessageType) => void) {
    const wrappedCallback = (_event: any, arg: any) => {
      callback(arg)
    }

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
    console.log(event.topic, msg)
    this.ipc.send(event.topic, msg)
  }
}

export const rendererEvents = new IpcRendererEventBus(ipcRenderer)
export const backendEvents = new IpcMainEventBus(ipcMain)
