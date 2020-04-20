import { Base64Message } from './Model/Base64Message'
import { DataSource, MqttSource } from './DataSource'
import {
  AddMqttConnection,
  MqttMessage,
  addMqttConnectionEvent,
  backendEvents,
  makeConnectionMessageEvent,
  makeConnectionStateEvent,
  makePublishEvent,
  removeConnection,
} from '../../events'

export class ConnectionManager {
  private connections: { [s: string]: DataSource<any> } = {}

  private handleConnectionRequest = (event: AddMqttConnection) => {
    const connectionId = event.id

    // Prevent double connections when reloading
    if (this.connections[connectionId]) {
      this.removeConnection(connectionId)
    }

    const options = event.options
    const connection = new MqttSource()
    this.connections[connectionId] = connection

    const connectionStateEvent = makeConnectionStateEvent(connectionId)
    connection.stateMachine.onUpdate.subscribe(state => {
      backendEvents.emit(connectionStateEvent, state)
    })

    connection.connect(options)
    this.handleNewMessagesForConnection(connectionId, connection)
    backendEvents.subscribe(makePublishEvent(connectionId), (msg: MqttMessage) => {
      this.connections[connectionId].publish(msg)
    })
  }

  private handleNewMessagesForConnection(connectionId: string, connection: MqttSource) {
    const messageEvent = makeConnectionMessageEvent(connectionId)
    connection.onMessage((topic: string, payload: Buffer, packet: any) => {
      let buffer = payload
      if (buffer.length > 20000) {
        buffer = buffer.slice(0, 20000)
      }

      backendEvents.emit(messageEvent, {
        topic,
        payload: Base64Message.fromBuffer(buffer),
        qos: packet.qos,
        retain: packet.retain,
        messageId: packet.messageId,
      })
    })
  }

  public manageConnections() {
    backendEvents.subscribe(addMqttConnectionEvent, this.handleConnectionRequest)
    backendEvents.subscribe(removeConnection, (connectionId: string) => {
      this.removeConnection(connectionId)
    })
  }

  public removeConnection(connectionId: string) {
    const connection = this.connections[connectionId]
    if (connection) {
      backendEvents.unsubscribeAll(makePublishEvent(connectionId))
      connection.disconnect()
      delete this.connections[connectionId]
      connection.stateMachine.onUpdate.removeAllListeners()
    }
  }

  public closeAllConnections() {
    Object.keys(this.connections).forEach(connectionId => this.removeConnection(connectionId))
  }
}
