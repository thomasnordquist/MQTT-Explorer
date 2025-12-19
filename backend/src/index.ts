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
  setMaxMessageSize as setMaxMessageSizeEvent,
  MAX_MESSAGE_SIZE_DEFAULT,
  MAX_MESSAGE_SIZE_MIN,
  MAX_MESSAGE_SIZE_MAX,
} from '../../events'

export class ConnectionManager {
  private connections: { [s: string]: DataSource<any> } = {}
  private maxMessageSize: number = MAX_MESSAGE_SIZE_DEFAULT

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
      if (buffer.length > this.maxMessageSize) {
        buffer = buffer.slice(0, this.maxMessageSize)
      }

      let decoded_payload = null
      decoded_payload = Base64Message.fromBuffer(buffer)

      backendEvents.emit(messageEvent, {
        topic,
        payload: decoded_payload,
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
    backendEvents.subscribe(setMaxMessageSizeEvent, (maxMessageSize: number) => {
      // Validate and clamp the value to reasonable bounds
      if (typeof maxMessageSize === 'number' && maxMessageSize >= MAX_MESSAGE_SIZE_MIN && maxMessageSize <= MAX_MESSAGE_SIZE_MAX) {
        this.maxMessageSize = maxMessageSize
      }
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
