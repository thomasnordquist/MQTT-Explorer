import { Server as SocketIOServer, Socket } from 'socket.io'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'

export class SocketIOServerEventBus implements EventBusInterface {
  private io: SocketIOServer
  private client: Socket | undefined
  private eventHandlers: Map<string, (arg: any) => void> = new Map()

  constructor(io: SocketIOServer) {
    this.io = io

    // Register connection handler once
    this.io.on('connection', socket => {
      console.log('Client connected:', socket.id)
      this.client = socket

      // Register all existing event handlers on this socket
      this.eventHandlers.forEach((handler, topic) => {
        socket.on(topic, handler)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
        if (this.client === socket) {
          this.client = undefined
        }
      })
    })
  }

  public subscribe<MessageType>(subscribeEvent: Event<MessageType>, callback: (msg: MessageType) => void) {
    console.log('subscribing', subscribeEvent.topic)

    const handler = (arg: any) => {
      callback(arg)
    }

    // Store handler for future connections
    this.eventHandlers.set(subscribeEvent.topic, handler)

    // If there's already a connected client, register the handler
    if (this.client) {
      this.client.on(subscribeEvent.topic, handler)
    }
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    console.log('unsubscribeAll', event.topic)
    this.eventHandlers.delete(event.topic)
    if (this.client) {
      this.client.removeAllListeners(event.topic)
    }
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented')
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    if (this.client && this.client.connected) {
      this.client.emit(event.topic, msg)
    }
  }
}
