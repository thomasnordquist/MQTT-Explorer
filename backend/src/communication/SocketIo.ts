import * as SocketIo from 'socket.io'
import { EventBusInterface, Event } from '../../../events'
import * as http from 'http'

class SocketIoServerEventBus implements EventBusInterface {
  private httpServer: any
  private socketIo: SocketIo.Server
  constructor(serverPort = 3000) {
    this.httpServer = http.createServer()
    this.socketIo = SocketIo(this.httpServer)
    this.httpServer.listen(serverPort)
  }

  public subscribe<MessageType>(event: Event<MessageType>, callback:(msg: MessageType) => void) {
    console.log('subscribing', event.topic)

    Object.keys(this.socketIo.sockets.sockets).forEach((key) => {
      const socket = this.socketIo.sockets.sockets[key]
      socket.on(event.topic, callback)
    })
  }

  public unsubscribeAll<MessageType>(event: Event<MessageType>) {
    Object.keys(this.socketIo.sockets.sockets).forEach((key) => {
      const socket = this.socketIo.sockets.sockets[key]
      socket.removeAllListeners()
    })
  }

  public unsubscribe<MessageType>(event: Event<MessageType>, callback: any) {
    throw new Error('Not implemented') // Todo: implement
  }

  public emit<MessageType>(event: Event<MessageType>, msg: MessageType) {
    this.socketIo.emit(event.topic, msg)
  }
}

export const backendEvents = new SocketIoServerEventBus()
