import { IpcMain } from 'electron'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'

export class IpcMainEventBus implements EventBusInterface {
  private ipc: IpcMain
  private client: any
  constructor(ipc: IpcMain) {
    this.ipc = ipc
  }

  public subscribe<MessageType>(subscribeEvent: Event<MessageType>, callback: (msg: MessageType) => void) {
    console.log('subscribing', subscribeEvent.topic)
    this.ipc.on(subscribeEvent.topic, (event: any, arg: any) => {
      this.client = event.sender
      callback(arg)
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    console.log('unsubscribeAll', event.topic)
    this.ipc.removeAllListeners(event.topic)
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented') // Todo: implement
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    if (!this.client.isDestroyed()) {
      this.client.send(event.topic, msg)
    }
  }
}
