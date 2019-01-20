import { IpcMain, IpcRenderer, ipcMain, ipcRenderer } from 'electron'

import { Event } from './Events'

export interface EventBusInterface {
  subscribe<MessageType>(event: Event<MessageType>, callback:(msg: MessageType) => void): void
  unsubscribeAll<MessageType>(event: Event<MessageType>): void
  emit<MessageType>(event: Event<MessageType>, msg: MessageType): void
}

class IpcMainEventBus implements EventBusInterface {
  private ipc: IpcMain
  private client: any
  constructor(ipc: IpcMain) {
    this.ipc = ipc
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback:(msg: MessageType) => void) {
    console.log('subscribing', event.topic)
    this.ipc.on(event.topic, (event: any, arg: any) => {
      this.client = event.sender
      callback(arg)
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    this.ipc.removeAllListeners(event.topic)
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    if (!this.client.isDestroyed()) {
      this.client.send(event.topic, msg)
    }
  }
}

class IpcRendererEventBus implements EventBusInterface {
  private ipc: IpcRenderer
  constructor(ipc: IpcRenderer) {
    this.ipc = ipc
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback:(msg: MessageType) => void) {
    this.ipc.on(event.topic, (_event: any, arg: any) => callback(arg))
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    this.ipc.removeAllListeners(event.topic)
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    this.ipc.send(event.topic, msg)
  }
}

export const rendererEvents = new IpcRendererEventBus(ipcRenderer)
export const backendEvents = new IpcMainEventBus(ipcMain)
