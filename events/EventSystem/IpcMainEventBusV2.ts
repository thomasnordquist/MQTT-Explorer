import { IpcMain } from 'electron'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'
import { MessageCodec } from './MessageCodec'

/**
 * Enhanced IPC Main Event Bus with Protobuf support
 *
 * This version uses binary serialization for better performance
 * while maintaining backward compatibility with the old JSON-based system.
 */
export class IpcMainEventBusV2 implements EventBusInterface {
  private ipc: IpcMain
  private client: any
  private useBinary: boolean

  constructor(ipc: IpcMain, useBinary: boolean = true) {
    this.ipc = ipc
    this.useBinary = useBinary
  }

  public subscribe<MessageType>(subscribeEvent: Event<MessageType>, callback: (msg: MessageType) => void) {
    console.log('subscribing', subscribeEvent.topic, this.useBinary ? '(binary)' : '(json)')
    this.ipc.on(subscribeEvent.topic, (event: any, arg: any) => {
      this.client = event.sender

      if (this.useBinary && arg instanceof Uint8Array) {
        // Binary message - decode it
        const { data } = MessageCodec.decodeWithPayload<MessageType>(arg)
        callback(data)
      } else {
        // Regular JSON message
        callback(arg)
      }
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
    if (!this.client || this.client.isDestroyed()) {
      return
    }

    if (this.useBinary) {
      // Encode as binary
      const binary = MessageCodec.encode(event.topic, msg)
      this.client.send(event.topic, binary)
    } else {
      // Send as JSON (legacy)
      this.client.send(event.topic, msg)
    }
  }
}
