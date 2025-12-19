import * as SocketIO from 'socket.io'
import { Event } from '../Events'
import { EventBusInterface } from './EventBusInterface'

export class SocketIOServerEventBus implements EventBusInterface {
  private io: SocketIO.Server
  private client: SocketIO.Socket | undefined

  constructor(io: SocketIO.Server) {
    this.io = io

    // Handle client connections
    this.io.on('connection', socket => {
      console.log('Client connected:', socket.id)
      this.client = socket

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
    this.io.on('connection', socket => {
      socket.on(subscribeEvent.topic, (arg: any) => {
        this.client = socket
        callback(arg)
      })
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    console.log('unsubscribeAll', event.topic)
    this.io.removeAllListeners(event.topic)
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
