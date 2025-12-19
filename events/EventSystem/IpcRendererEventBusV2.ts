import { CallbackStore } from './CallbackStore'
import { EventBusInterface } from './EventBusInterface'
import { Event } from '../Events'
import { IpcRenderer } from 'electron'
import { MessageCodec } from './MessageCodec'

/**
 * Enhanced IPC Renderer Event Bus with Protobuf support
 *
 * This version uses binary serialization for better performance
 * while maintaining backward compatibility with the old JSON-based system.
 */
export class IpcRendererEventBusV2 implements EventBusInterface {
  private ipc: IpcRenderer
  private callbacks: Array<CallbackStore> = []
  private useBinary: boolean

  constructor(ipc: IpcRenderer, useBinary: boolean = true) {
    this.ipc = ipc
    this.useBinary = useBinary
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback: (msg: MessageType) => void) {
    const wrappedCallback = (_: any, arg: any) => {
      if (this.useBinary && arg instanceof Uint8Array) {
        // Binary message - decode it
        const { data } = MessageCodec.decodeWithPayload<MessageType>(arg)
        callback(data)
      } else {
        // Regular JSON message
        callback(arg)
      }
    }
    console.log('subscribing', event.topic, this.useBinary ? '(binary)' : '(json)')
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
    if (this.useBinary) {
      // Encode as binary
      const binary = MessageCodec.encode(event.topic, msg)
      this.ipc.send(event.topic, binary)
    } else {
      // Send as JSON (legacy)
      this.ipc.send(event.topic, msg)
    }
  }
}
